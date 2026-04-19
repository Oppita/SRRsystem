import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, FolderKanban, AlertTriangle, Settings, LogOut, Search, Bell, 
  TableProperties, Activity, Map, Zap, PlusCircle, Calendar, Users, FileText, 
  ClipboardCheck, CloudUpload, CloudDownload, Loader2, RefreshCw, CheckSquare, 
  BrainCircuit, ShieldCheck, Database, CloudRain, TrendingUp, Download, Lock as LockIcon, X 
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Vista360 } from './components/Vista360';
import { ProjectDetails } from './components/ProjectDetails';
import { MatrizInteligente } from './components/MatrizInteligente';
import { GeneradorInformes } from './components/GeneradorInformes';
import { CentroControlSRR } from './components/CentroControlSRR';
import { CentroInteligenciaSRR } from './components/CentroInteligenciaSRR';
import FlujoInstitucional from './components/FlujoInstitucional';
import { ColombiaMap } from './components/ColombiaMap';
import { TerritorialPanel } from './components/TerritorialPanel';
import { VigenciaModule } from './components/VigenciaModule';
import { ContractorProfile } from './components/ContractorProfile';
import { DocumentRepository } from './components/DocumentRepository';
import { AgendaPMU } from './components/AgendaPMU';
import { CreateProjectForm } from './components/CreateProjectForm';
import { LandingPage } from './components/LandingPage';
import { GestionOPS } from './components/GestionOPS';
import { GestionComisiones } from './components/GestionComisiones';
import { GestionPolizas } from './components/GestionPolizas';
import { TaskBoard } from './components/TaskBoard';
import { PriorizacionInversion } from './components/PriorizacionInversion';
import { RiskDashboard } from './components/RiskDashboard';
import { Auth } from './components/Auth';
import { ProteccionFinanciera } from './components/ProteccionFinanciera';
import { LaboratorioFinanciero } from './components/LaboratorioFinanciero';
import { FinancialTraceabilityDashboard } from './components/FinancialTraceabilityDashboard';
import { MicRModule } from './components/MicRModule';
import { EventosDashboard } from './components/EventosDashboard';
import { SurveyModule } from './components/SurveyModule';
import { supabase, isSupabaseConfigured, supabaseUrl } from './lib/supabase';
import { ProjectData, DepartmentRisk, Threat } from './types';

import { mockThreats } from './data/mockDepartments';
import { useProject } from './store/ProjectContext';
import { showAlert } from './utils/alert';

function App() {
  const { 
    state, 
    getProjectData, 
    addProject, 
    saveToSupabase, 
    loadFromSupabase, 
    repairAllUrls, 
    syncing, 
    loading: contextLoading, 
    error: syncError, 
    isCloudCheckComplete, 
    hasSyncedWithCloud,
    importFromJSON,
    exportToJSON
  } = useProject();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeView, setActiveView] = useState<
    'landing' | 'dashboard' | 'project' | 'vista360' | 'matriz' | 'informes' | 
    'centroControl' | 'mapa' | 'inteligencia' | 'crearProyecto' | 'vigencias' | 
    'contractors' | 'documents' | 'flujo' | 'ops' | 'comisiones' | 'tareas' | 
    'interventoria' | 'riesgo' | 'priorizacion' | 'pot' | 'riesgoDashboard' | 
    'polizas' | 'agenda' | 'financiera' | 'laboratorio' | 'micr' | 'eventos' | 
    'trazabilidad' | 'encuestas'
  >('landing');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [reportProjectId, setReportProjectId] = useState<string | undefined>();
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswordGuard, setShowPasswordGuard] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void>(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // Perfiles de acceso por correo
  const userRole = useMemo(() => {
    if (!user) return 'public';
    if (user.email === 'admin@srr.gov.co' || user.email === '7albahacas@gmail.com') return 'admin';
    if (user.email?.includes('encuestas')) return 'survey_only';
    return 'user';
  }, [user]);

  const canAccessModule = (view: string) => {
    if (userRole === 'admin') return true;
    if (userRole === 'survey_only') return view === 'encuestas';
    return view !== 'config' && view !== 'financiera'; // Ejemplo de restricción básica
  };

  const executeWithGuard = (action: () => void) => {
    setPendingAction(() => action);
    setShowPasswordGuard(true);
    setConfirmPassword('');
    setPasswordError(false);
  };

  const handleConfirmGuard = () => {
    // Aquí usamos una contraseña de "sistema" como pidió el usuario.
    // Usaremos un valor por defecto o variable de entorno si estuviera disponible.
    const SUPABASE_SYS_PASS = 'SUPA2026'; // Contraseña de respaldo/sistema 
    
    if (confirmPassword === SUPABASE_SYS_PASS) {
      if (pendingAction) pendingAction();
      setShowPasswordGuard(false);
      setPendingAction(null);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleAlert = (e: CustomEvent) => {
      setAlertMessage(e.detail);
    };
    window.addEventListener('show-alert', handleAlert as EventListener);
    return () => window.removeEventListener('show-alert', handleAlert as EventListener);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (!isSupabaseConfigured) {
        setAuthLoading(false);
        return;
      }

      // Conexión no bloqueante: la app continúa aunque Supabase no responda
      console.log('Verificando estado de Supabase...');

      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          if (error.message.includes('Refresh Token Not Found') || error.message.includes('Invalid Refresh Token')) {
             console.warn('Sesión expirada o inválida, limpiando estado...');
             supabase.auth.signOut();
             setUser(null);
          } else {
            console.warn('Supabase no disponible, usando modo local:', error.message);
          }
        } else {
          setUser(session?.user ?? null);
        }
      }).catch(err => {
        console.warn('Error de conexión a Supabase, modo local activado:', err.message);
      }).finally(() => {
        setAuthLoading(false);
      });
    };

    initAuth();

    const { data: { subscription } } = isSupabaseConfigured 
      ? supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
        })
      : { data: { subscription: { unsubscribe: () => {} } } };

    return () => subscription.unsubscribe();
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveView('landing');
  };

  const handleExportData = () => {
    executeWithGuard(() => {
      const dataStr = localStorage.getItem('srr_app_state');
      if (!dataStr) {
        showAlert('No hay datos para exportar.');
        return;
      }
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `srr_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    executeWithGuard(() => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          // Validate JSON
          JSON.parse(content);
          localStorage.setItem('srr_app_state', content);
          showAlert('Datos importados correctamente. La página se recargará.');
          setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
          showAlert('Error al importar el archivo. Asegúrese de que sea un archivo JSON válido exportado desde esta aplicación.');
        }
      };
      reader.readAsText(file);
    });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearCache = () => {
    executeWithGuard(async () => {
      if (window.confirm('¿Está seguro de que desea limpiar el caché local? Esto eliminará los datos guardados en el navegador, cerrará su sesión y recargará la página.')) {
        // Clear Supabase session
        await supabase.auth.signOut();
        
        // Clear local storage
        localStorage.removeItem('srr_app_state');
        // Also clear other potential large keys
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('edan_data_') || key.includes('supabase.auth.token')) {
            localStorage.removeItem(key);
          }
        });
        
        // Final fallback: clear everything
        localStorage.clear();
        
        showAlert('Caché local limpiado y sesión cerrada. Recargando...');
        setTimeout(() => window.location.reload(), 1500);
      }
    });
  };
  
  // Reconstruct ProjectData array for components that expect it
  const projectsData: ProjectData[] = useMemo(() => {
    const allProjects = state.proyectos.map(p => getProjectData(p.id)!).filter(Boolean);
    return allProjects.filter(p => 
      (p.project.nombre || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (p.project.municipio || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      state.contratos.some(c => c.projectId === p.project.id && ((c.numero?.toString() || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || (c.nit?.toString() || '').toLowerCase().includes((searchQuery || '').toLowerCase())))
    );
  }, [state, getProjectData, searchQuery]);

  const dynamicDepartments = useMemo(() => {
    return state.departamentos.map(dept => {
      const deptProjects = projectsData.filter(p => p.project.departamento === dept.name);
      const totalInvestment = deptProjects.reduce((sum, p) => {
        const projectContracts = p.contracts || [];
        const contractValue = projectContracts.reduce((cSum, c) => cSum + c.valor, 0);
        return sum + contractValue;
      }, 0);
      
      return {
        ...dept,
        investment: totalInvestment > 0 ? totalInvestment : dept.investment // Fallback to mock if no projects
      };
    });
  }, [projectsData, state.departamentos]);

  const selectedProject = useMemo(() => {
    return selectedProjectId ? getProjectData(selectedProjectId) : null;
  }, [selectedProjectId, getProjectData]);

  const handleProjectSelect = (project: ProjectData) => {
    setSelectedProjectId(project.project.id);
    setActiveView('project');
  };

  const handleOpenPanel = (dept: string) => {
    setSelectedDept(dept);
  };

  const handleBackToDashboard = () => {
    setSelectedProjectId(null);
    setActiveView('dashboard');
  };

  // Function to update project data from the matrix
  const handleUpdateProject = (projectId: string, section: string, field: string, value: any) => {
    // In a real app, this would call a dispatch or an API
    console.log('Update project:', projectId, section, field, value);
  };

  const handleGenerateReport = (projectId: string) => {
    setReportProjectId(projectId);
    setActiveView('informes');
  };

  const handleSaveToCloud = async () => {
    executeWithGuard(async () => {
      try {
        await saveToSupabase(true);
        showAlert('Datos guardados en la nube correctamente.');
      } catch (e) {
        showAlert('Error al guardar en la nube.');
      }
    });
  };

  const handleLoadFromCloud = async () => {
    executeWithGuard(async () => {
      try {
        await loadFromSupabase(true);
        showAlert('Datos cargados desde la nube correctamente.');
      } catch (e) {
        showAlert('Error al cargar desde la nube.');
      }
    });
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-500 mx-auto mb-4" size={48} />
          <p className="text-slate-400 font-medium">Cargando sesión segura...</p>
        </div>
      </div>
    );
  }

  if (activeView === 'landing') {
    return <LandingPage 
      onEnterAdmin={() => setActiveView('dashboard')} 
      onEnterSurveys={() => setActiveView('encuestas')}
    />;
  }

  if (!user && isSupabaseConfigured) {
    return <Auth onSuccess={() => {
      // Si el usuario es de encuestas, forzamos esa vista
      if (userRole === 'survey_only') {
        setActiveView('encuestas');
      } else {
        setActiveView(current => current === 'landing' ? 'dashboard' : current);
      }
    }} />;
  }

  if ((activeView as string) === 'encuestas') {
    return (
      <div className="h-screen w-screen bg-slate-50 overflow-y-auto overflow-x-hidden">
        <SurveyModule onExit={() => setActiveView('landing')} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold">
            M
          </div>
          <span className="font-semibold text-white tracking-wide">Matriz Inteligente</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {canAccessModule('dashboard') && (
            <button 
              onClick={handleBackToDashboard}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'dashboard' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard Ejecutivo SRR</span>
            </button>
          )}
          
          {canAccessModule('flujo') && (
            <button 
              onClick={() => setActiveView('flujo')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'flujo' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <ClipboardCheck size={20} />
              <span className="font-medium">Banco de Proyectos</span>
            </button>
          )}

          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Gestión
          </div>
          
          {canAccessModule('inteligencia') && (
            <button 
              onClick={() => setActiveView('inteligencia')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'inteligencia' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <BrainCircuit size={20} />
              <span className="font-medium">Centro de Inteligencia</span>
            </button>
          )}

          {canAccessModule('financiera') && (
            <button 
              onClick={() => setActiveView('financiera')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'financiera' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <ShieldCheck size={20} />
              <span className="font-medium">Prot. Financiera</span>
            </button>
          )}

          {canAccessModule('laboratorio') && (
            <button 
              onClick={() => setActiveView('laboratorio')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'laboratorio' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <TrendingUp size={20} />
              <span className="font-medium">Laboratorio Financiero</span>
            </button>
          )}

          {canAccessModule('eventos') && (
            <button 
              onClick={() => setActiveView('eventos')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'eventos' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <CloudRain size={20} />
              <span className="font-medium">Gestión de Eventos (MIC-R/PMU)</span>
            </button>
          )}

          {canAccessModule('riesgoDashboard') && (
            <button 
              onClick={() => setActiveView('riesgoDashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'riesgoDashboard' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <AlertTriangle size={20} />
              <span className="font-medium">Dashboard de Riesgos</span>
            </button>
          )}

          {canAccessModule('priorizacion') && (
            <button 
              onClick={() => setActiveView('priorizacion')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'priorizacion' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <TableProperties size={20} />
              <span className="font-medium">Priorización Inversión</span>
            </button>
          )}

          {canAccessModule('centroControl') && (
            <button 
              onClick={() => setActiveView('centroControl')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'centroControl' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <Activity size={20} />
              <span className="font-medium">Centro de Control SRR</span>
            </button>
          )}

          {canAccessModule('mapa') && (
            <button 
              onClick={() => setActiveView('mapa')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'mapa' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <Map size={20} />
              <span className="font-medium">Mapa Territorial</span>
            </button>
          )}

          {canAccessModule('matriz') && (
            <button 
              onClick={() => setActiveView('matriz')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'matriz' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <TableProperties size={20} />
              <span className="font-medium">Matriz Seguimiento SRR</span>
            </button>
          )}

          {canAccessModule('informes') && (
            <button 
              onClick={() => setActiveView('informes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'informes' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <FolderKanban size={20} />
              <span className="font-medium">Generador de Informes</span>
            </button>
          )}

          {canAccessModule('tareas') && (
            <button 
              onClick={() => setActiveView('tareas')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'tareas' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <CheckSquare size={20} />
              <span className="font-medium">Tareas y Notificaciones</span>
            </button>
          )}

          {canAccessModule('vigencias') && (
            <button 
              onClick={() => setActiveView('vigencias')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'vigencias' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <Calendar size={20} />
              <span className="font-medium">Vigencias e Inversión</span>
            </button>
          )}

          {canAccessModule('contractors') && (
            <button 
              onClick={() => setActiveView('contractors')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'contractors' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <Users size={20} />
              <span className="font-medium">Perfil de Contratista</span>
            </button>
          )}

          {canAccessModule('ops') && (
            <button 
              onClick={() => setActiveView('ops')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'ops' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <Users size={20} />
              <span className="font-medium">Gestión OPS</span>
            </button>
          )}

          {canAccessModule('comisiones') && (
            <button 
              onClick={() => setActiveView('comisiones')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'comisiones' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <Map size={20} />
              <span className="font-medium">Gestión Comisiones</span>
            </button>
          )}

          {canAccessModule('polizas') && (
            <button 
              onClick={() => setActiveView('polizas')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'polizas' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <ShieldCheck size={20} />
              <span className="font-medium">Gestión Pólizas</span>
            </button>
          )}

          {canAccessModule('documents') && (
            <button 
              onClick={() => setActiveView('documents')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'documents' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <FileText size={20} />
              <span className="font-medium">Repositorio Documental</span>
            </button>
          )}

          {canAccessModule('encuestas') && (
            <button 
              onClick={() => setActiveView('encuestas')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${(activeView as string) === 'encuestas' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <ClipboardCheck size={20} />
              <span className="font-medium">Módulo de Encuestas</span>
            </button>
          )}
        </nav>
        
        <div className="p-4 border-t border-slate-800 space-y-2">
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleImportData} 
            className="hidden" 
          />
          {userRole === 'admin' && (
            <>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-emerald-400 transition-colors"
              >
                <CloudUpload size={20} />
                <span className="font-medium">Importar Datos</span>
              </button>
              <button 
                onClick={handleExportData}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-indigo-400 transition-colors"
              >
                <CloudDownload size={20} />
                <span className="font-medium">Exportar Datos</span>
              </button>
              <button 
                onClick={handleClearCache}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-rose-400 transition-colors"
              >
                <RefreshCw size={20} />
                <span className="font-medium">Limpiar Caché Local</span>
              </button>
              <button 
                onClick={() => setActiveView('vigencias')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'vigencias' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <Settings size={20} />
                <span className="font-medium">Configuración</span>
              </button>
            </>
          )}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-rose-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Salir</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="hover:text-slate-900 cursor-pointer transition-colors" onClick={handleBackToDashboard}>Inicio</span>
            {activeView === 'project' && selectedProject && (
              <>
                <span>/</span>
                <span className="text-slate-900 font-medium truncate max-w-[300px]">{selectedProject.project.nombre}</span>
              </>
            )}
            {activeView === 'inteligencia' && (
              <>
                <span>/</span>
                <span className="text-slate-900 font-medium">Centro de Inteligencia</span>
              </>
            )}
            {activeView === 'centroControl' && (
              <>
                <span>/</span>
                <span className="text-slate-900 font-medium">Centro de Control SRR</span>
              </>
            )}
            {activeView === 'mapa' && (
              <>
                <span>/</span>
                <span className="text-slate-900 font-medium">Mapa Territorial</span>
              </>
            )}
            {activeView === 'matriz' && (
              <>
                <span>/</span>
                <span className="text-slate-900 font-medium">Matriz de Seguimiento SRR</span>
              </>
            )}
            {activeView === 'informes' && (
              <>
                <span>/</span>
                <span className="text-slate-900 font-medium">Generador de Informes Institucionales</span>
              </>
            )}
            {activeView === 'agenda' && (
              <>
                <span>/</span>
                <span className="text-slate-900 font-medium">Agenda y PMU</span>
              </>
            )}
            {activeView === 'tareas' && (
              <>
                <span>/</span>
                <span className="text-slate-900 font-medium">Tareas y Notificaciones</span>
              </>
            )}
            {activeView === 'vigencias' && (
              <>
                <span>/</span>
                <span className="text-slate-900 font-medium">Vigencias e Inversión</span>
              </>
            )}
            {activeView === 'contractors' && (
              <>
                <span>/</span>
                <span className="text-slate-900 font-medium">Perfil de Contratista</span>
              </>
            )}
            {activeView === 'documents' && (
              <>
                <span>/</span>
                <span className="text-slate-900 font-medium">Repositorio Documental</span>
              </>
            )}
            {activeView === 'laboratorio' && (
              <>
                <span>/</span>
                <span className="text-slate-900 font-medium">Laboratorio Financiero</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            {/* Sync Controls */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-r border-slate-200 text-xs font-semibold">
                {!isCloudCheckComplete ? (
                  <>
                    <Loader2 size={12} className="animate-spin text-indigo-500" />
                    <span className="text-slate-500">Conectando...</span>
                  </>
                ) : hasSyncedWithCloud ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-600 font-medium">Nube Activa ({state.proyectos.length})</span>
                  </>
                ) : (
                  <>
                    <Database size={12} className="text-slate-400" />
                    <span className="text-slate-500">Solo Local</span>
                  </>
                )}
              </div>
              <button 
                onClick={handleSaveToCloud}
                disabled={syncing || !isSupabaseConfigured}
                title="Sincronizar con la nube (Subir)"
                className="p-2 text-slate-600 hover:bg-white hover:text-indigo-600 rounded-lg transition-all disabled:opacity-50"
              >
                {syncing ? <Loader2 size={18} className="animate-spin" /> : <CloudUpload size={18} />}
              </button>
              <button 
                onClick={handleLoadFromCloud}
                disabled={syncing || !isSupabaseConfigured}
                title="Cargar desde la nube (Descargar)"
                className="p-2 text-slate-600 hover:bg-white hover:text-indigo-600 rounded-lg transition-all disabled:opacity-50"
              >
                <CloudDownload size={18} />
              </button>
              <button 
                onClick={repairAllUrls}
                disabled={syncing}
                title="Reparar URLs de Almacenamiento"
                className="p-2 text-slate-600 hover:bg-white hover:text-amber-600 rounded-lg transition-all disabled:opacity-50"
              >
                <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
              </button>

              {/* Botones de Rescate JSON */}
              <div className="flex items-center gap-1 border-l border-slate-200 ml-1 pl-1">
                <button 
                  onClick={handleExportData}
                  title="Exportar copia de seguridad (JSON)"
                  className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <Download size={18} />
                </button>
                <label className="p-2 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer">
                  <FileText size={18} />
                  <input 
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    onChange={handleImportData} 
                  />
                </label>
              </div>

              {syncError && (
                <div className="px-2 text-xs text-rose-500 font-medium max-w-[150px] truncate" title={syncError}>
                  Error
                </div>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar proyecto, NIT, contrato..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all w-64"
              />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className={`flex-1 overflow-auto ${activeView === 'matriz' || activeView === 'centroControl' || activeView === 'vista360' ? 'p-0 bg-slate-100' : 'p-8'}`}>
          {activeView === 'crearProyecto' && (
            <div className="h-full p-4">
              <CreateProjectForm 
                onSave={(p) => {
                  addProject(p);
                  setActiveView('dashboard');
                }} 
                onCancel={() => setActiveView('flujo')}
              />
            </div>
          )}
          {activeView === 'dashboard' && (
            <Dashboard 
              projects={projectsData} 
              onSelectProject={handleProjectSelect} 
              onManageLiquidation={(project) => {
                setSelectedProjectId(project.project.id);
                setActiveView('flujo');
              }}
            />
          )}
          {activeView === 'vista360' && selectedProject && (
            <Vista360 project={selectedProject} onBack={() => setActiveView('dashboard')} />
          )}
          {activeView === 'project' && selectedProject && (
            <ProjectDetails 
              data={selectedProject} 
              onBack={handleBackToDashboard} 
              onUpdateProject={handleUpdateProject} 
              onOpenVista360={() => setActiveView('vista360')}
            />
          )}
          {activeView === 'matriz' && (
            <div className="h-full p-4">
              <MatrizInteligente projects={projectsData} onUpdateProject={handleUpdateProject} onSelectProject={handleProjectSelect} />
            </div>
          )}
          {activeView === 'informes' && (
            <div className="h-full p-4">
              <GeneradorInformes projects={projectsData} initialProjectId={reportProjectId} />
            </div>
          )}
          {activeView === 'tareas' && (
            <div className="h-full p-4">
              <TaskBoard />
            </div>
          )}
          {activeView === 'inteligencia' && (
            <div className="h-full p-4">
              <CentroInteligenciaSRR projects={projectsData} professionals={state.professionals} />
            </div>
          )}
          {activeView === 'priorizacion' && (
            <div className="h-full p-4 overflow-y-auto">
              <PriorizacionInversion projects={projectsData.map(p => p.project)} departmentsData={dynamicDepartments} />
            </div>
          )}
          {activeView === 'riesgoDashboard' && (
            <div className="h-full p-4 overflow-y-auto">
              <RiskDashboard 
                contracts={state.contratos} 
                otrosies={state.otrosies} 
                pagos={state.pagos} 
                reports={state.informesInterventoria} 
                projects={projectsData}
              />
            </div>
          )}
          {activeView === 'agenda' && (
            <div className="h-full bg-slate-50">
              <AgendaPMU />
            </div>
          )}
          {activeView === 'eventos' && (
            <div className="h-full bg-slate-50 overflow-y-auto">
              <EventosDashboard />
            </div>
          )}
          {activeView === 'flujo' && (
            <div className="h-full">
              <FlujoInstitucional 
                initialSelectedProjectId={selectedProjectId} 
                onGoToProjectDetails={(projectId) => {
                  setSelectedProjectId(projectId);
                  setActiveView('project');
                }}
                onCreateProject={() => setActiveView('crearProyecto')}
              />
            </div>
          )}
          {activeView === 'vigencias' && (
            <div className="h-full p-4">
              <VigenciaModule />
            </div>
          )}
          {activeView === 'contractors' && (
            <div className="h-full p-4">
              <ContractorProfile 
                onSelectProject={(projectId) => {
                  setSelectedProjectId(projectId);
                  setActiveView('project');
                }}
              />
            </div>
          )}
          {activeView === 'documents' && (
            <div className="h-full p-4">
              <DocumentRepository />
            </div>
          )}
          {activeView === 'ops' && (
            <div className="h-full p-4">
              <GestionOPS projectId={selectedProjectId || ''} />
            </div>
          )}
          {activeView === 'comisiones' && (
            <div className="h-full p-4">
              <GestionComisiones projectId={selectedProjectId || ''} />
            </div>
          )}
          {activeView === 'polizas' && (
            <div className="h-full p-4">
              <GestionPolizas projectId={selectedProjectId || ''} />
            </div>
          )}
          {activeView === 'financiera' && (
            <div className="h-full">
              <ProteccionFinanciera />
            </div>
          )}
          {activeView === 'laboratorio' && (
            <div className="h-full overflow-y-auto">
              <LaboratorioFinanciero />
            </div>
          )}
          {activeView === 'micr' && (
            <div className="h-full">
              <MicRModule />
            </div>
          )}
          {activeView === 'centroControl' && (
            <CentroControlSRR projects={projectsData} onGenerateReport={handleGenerateReport} />
          )}
          {activeView === 'mapa' && (
            <div className="h-full p-4">
              <ColombiaMap 
                projects={projectsData} 
                departmentsData={dynamicDepartments}
                threats={mockThreats}
                onOpenPanel={handleOpenPanel} 
                onSelectProject={(project) => {
                  setSelectedProjectId(project.project.id);
                  setActiveView('project');
                }}
              />
              {selectedDept && (
                <TerritorialPanel 
                  dept={selectedDept} 
                  projects={projectsData} 
                  threats={mockThreats}
                  onClose={() => setSelectedDept(null)} 
                  onSelectProject={(project) => {
                    setSelectedProjectId(project.project.id);
                    setActiveView('project');
                    setSelectedDept(null);
                  }}
                />
              )}
            </div>
          )}

        </div>
      </main>

      {/* Global Alert Modal */}
      {alertMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center animate-in zoom-in duration-200">
            <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Aviso</h3>
            <p className="text-slate-600 mb-6">{alertMessage}</p>
            <button
              onClick={() => setAlertMessage(null)}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Restricción de Acceso - Password Guard Modal */}
      <AnimatePresence>
        {showPasswordGuard && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 bg-indigo-600 text-white text-center relative">
                <button 
                  onClick={() => setShowPasswordGuard(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <ShieldCheck className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Acceso Restringido</h2>
                <p className="text-indigo-100 text-sm mt-2 font-medium">Se requiere contraseña de sistema para realizar esta operación con los datos de Supabase.</p>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contraseña de Supabase</label>
                  <div className="relative">
                    <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      autoFocus
                      className={`w-full pl-12 pr-4 py-4 bg-slate-50 border ${passwordError ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-200'} rounded-2xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono font-bold`}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError(false);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleConfirmGuard()}
                    />
                  </div>
                  {passwordError && (
                    <p className="text-xs font-bold text-rose-500 px-1 animate-bounce">Contraseña incorrecta. Verifique sus credenciales.</p>
                  )}
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    onClick={() => setShowPasswordGuard(false)}
                    className="flex-1 py-4 px-6 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    CANCELAR
                  </button>
                  <button 
                    onClick={handleConfirmGuard}
                    className="flex-1 py-4 px-6 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    CONTINUAR
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
