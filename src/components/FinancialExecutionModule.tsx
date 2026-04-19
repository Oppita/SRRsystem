import React, { useState, useMemo, useRef } from 'react';
import { useProject } from '../store/ProjectContext';
import { FinancialDocument } from '../types';
import { 
  FileText, Plus, Search, Filter, Download, Trash2, 
  DollarSign, Activity, Calendar, Hash, Building2, User,
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Upload, Loader2, X, Edit,
  FileSpreadsheet, History
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { analyzeFinancialDocumentText } from '../services/financialService';
import { showAlert } from '../utils/alert';

const CDPListItem = ({ 
  doc, 
  linkedRCs, 
  totalComprometido, 
  executionPercentage, 
  formatCurrency, 
  onEdit, 
  onDelete,
  state 
}: any) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`group bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden ${expanded ? 'border-indigo-300 shadow-xl ring-4 ring-indigo-50' : 'border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md'}`}>
      <div className="p-6 cursor-pointer select-none" onClick={() => setExpanded(!expanded)}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4">
            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black transition-colors ${expanded ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
              <span className="text-[10px] uppercase tracking-tighter">CDP</span>
              <span className="text-lg leading-none">#</span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-black text-xl text-slate-800 tracking-tight">No. {doc.numero}</h4>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${executionPercentage >= 100 ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                  {executionPercentage >= 100 ? 'Comprometido Total' : 'En Ejecución'}
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 max-w-md line-clamp-1">{doc.descripcion}</p>
              <div className="flex items-center gap-4 mt-2">
                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                    <Calendar size={12} /> {doc.fecha}
                 </div>
                 {doc.rubro && (
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                      <Hash size={12} /> {doc.rubro}
                   </div>
                 )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Presupuesto Asignado</p>
            <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(doc.valor)}</p>
            <div className="flex items-center justify-end gap-2 mt-1">
               <span className="text-[10px] font-bold text-slate-400">RCs: {linkedRCs.length}</span>
               <div className="w-1 h-1 rounded-full bg-slate-300" />
               <span className={`text-[10px] font-bold ${executionPercentage > 100 ? 'text-rose-600' : 'text-emerald-600'}`}>{executionPercentage.toFixed(1)}% Comprometido</span>
            </div>
          </div>
        </div>

        <div className="relative pt-2">
          <div className="flex justify-between items-end mb-2">
             <div className="space-y-0.5">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Barra de Ejecución CDPxRC</p>
                <p className="text-xs font-bold text-slate-500">
                  Comprometido: <span className="text-indigo-600">{formatCurrency(totalComprometido)}</span> de <span className="text-slate-800">{formatCurrency(doc.valor)}</span>
                </p>
             </div>
             <div className={`flex items-center gap-1 p-1 rounded-lg ${expanded ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
             </div>
          </div>
          
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative shadow-inner">
            {/* Background segments for different RCs could go here if we want to be very visual, but a single bar with a marker for overflow is good */}
            <div 
              className={`h-full transition-all duration-1000 shadow-[inset_-2px_0_10px_rgba(0,0,0,0.1)] ${executionPercentage > 100 ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'}`}
              style={{ width: `${Math.min(100, executionPercentage)}%` }}
            />
            {executionPercentage > 100 && (
               <div className="absolute right-0 top-0 h-full w-4 bg-rose-600 animate-pulse flex items-center justify-center">
                  <AlertTriangle size={10} className="text-white" />
               </div>
            )}
          </div>
          
          <div className="flex justify-between mt-2 px-1">
             <div className="flex gap-4">
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Disponible</span>
                   <span className="text-xs font-bold text-slate-700">{formatCurrency(Math.max(0, doc.valor - totalComprometido))}</span>
                </div>
                {linkedRCs.reduce((sum: number, rc: any) => sum + (rc.valorPagado || 0), 0) > 0 && (
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Pagado Total</span>
                     <span className="text-xs font-bold text-blue-600">{formatCurrency(linkedRCs.reduce((sum: number, rc: any) => sum + (rc.valorPagado || 0), 0))}</span>
                  </div>
                )}
             </div>
             <button className="text-[10px] font-black text-indigo-500 uppercase hover:underline">Ver Detalles Completos</button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="bg-slate-50 border-t border-slate-100 p-8 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h5 className="text-xs font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <Activity size={18} className="text-indigo-600" /> Trazabilidad de Compromisos (RC)
            </h5>
            <div className="flex gap-2">
               <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-500 shadow-sm">
                 {linkedRCs.length} RCs Vinculados
               </span>
               <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black hover:bg-slate-800 transition-colors shadow-lg shadow-indigo-200"
                >
                  <Edit size={12} /> Gestionar
                </button>
            </div>
          </div>
          
          {linkedRCs.length === 0 ? (
            <div className="text-center py-12 bg-white border-2 border-slate-100 border-dashed rounded-3xl">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <FileText size={24} className="text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400">No hay Registros de Compromiso vinculados a este CDP</p>
              <p className="text-[10px] text-slate-400 uppercase mt-1">Vincule un RC usando el número de CDP {doc.numero}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {linkedRCs.map((rc: any) => (
                <div key={rc.id} className="relative group/rc bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-xl transition-all duration-300">
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black shadow-lg">RC</div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h6 className="font-black text-slate-800 text-lg">No. {rc.numero}</h6>
                      <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                        <Calendar size={10} /> {rc.fecha}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-600 tracking-tight">{formatCurrency(rc.valor)}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Val. Compromiso</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium mb-4 line-clamp-2 leading-relaxed">
                    {rc.descripcion || 'Sin descripción detallada.'}
                  </p>

                  <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                    <div className="flex gap-3">
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase">Pagado</span>
                          <span className={`text-xs font-black ${rc.valorPagado > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                            {formatCurrency(rc.valorPagado || 0)}
                          </span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase italic">Saldo RC</span>
                          <span className="text-xs font-bold text-slate-700">
                            {formatCurrency(rc.valor - (rc.valorPagado || 0))}
                          </span>
                       </div>
                    </div>
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${Math.min(100, ((rc.valorPagado || 0) / rc.valor) * 100)}%` }}
                       />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200/60">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-50 rounded-xl text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                   <Trash2 size={18} />
                </div>
                <div className="hidden md:block">
                   <p className="text-[10px] font-black text-slate-400 uppercase italic">Zona de Seguridad</p>
                   <p className="text-[10px] text-slate-400 leading-none">Los cambios en CDPs afectan la trazabilidad de los RCs vinculados.</p>
                </div>
             </div>
             <div className="flex gap-3">
                <button className="px-6 py-2 bg-slate-800 text-white rounded-xl text-xs font-black hover:bg-black transition-colors shadow-lg">Descargar Reporte</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface FinancialExecutionModuleProps {
  projectId?: string;
}

export const FinancialExecutionModule: React.FC<FinancialExecutionModuleProps> = ({ projectId }) => {
  const { state, addFinancialDocument, addFinancialDocuments, updateFinancialDocument, deleteFinancialDocument, clearFinancialDocuments, clearDuplicatesFinancialDocuments } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'CDP' | 'RC'>('CDP');
  const [showModal, setShowModal] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
  const [selectedContractId, setSelectedContractId] = useState('');
  const [selectedConvenioId, setSelectedConvenioId] = useState('');
  const [selectedOtrosieId, setSelectedOtrosieId] = useState('');
  const [selectedEventoId, setSelectedEventoId] = useState('');
  const [previewDoc, setPreviewDoc] = useState<FinancialDocument | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [convenioSearch, setConvenioSearch] = useState('');
  const [contractSearch, setContractSearch] = useState('');

  const projectDocs = useMemo(() => {
    let docs = state.financialDocuments || [];
    if (projectId) {
      docs = docs.filter(d => d.projectId === projectId);
    }
    return docs;
  }, [state.financialDocuments, projectId]);

  const filteredDocs = projectDocs.filter(d => (d.tipo === activeTab || (activeTab === 'RC' && d.tipo === 'RC')) && (d.numero.includes(searchQuery) || d.descripcion.toLowerCase().includes(searchQuery.toLowerCase())));

  const availableProjects = state.proyectos;
  const projectContracts = state.contratos.filter(c => 
    (!selectedProjectId || c.projectId === selectedProjectId) &&
    (c.numero.toLowerCase().includes(contractSearch.toLowerCase()))
  );
  const projectConvenios = state.convenios.filter(c => {
    const matchesSearch = c.numero.toLowerCase().includes(convenioSearch.toLowerCase()) || 
                          c.nombre.toLowerCase().includes(convenioSearch.toLowerCase());
    if (!selectedProjectId) return matchesSearch;
    const p = state.proyectos.find(proj => proj.id === selectedProjectId);
    return c.id === p?.convenioId && matchesSearch;
  });
  const projectOtrosies = state.otrosies.filter(o => 
    projectContracts.some(c => c.id === o.contractId) || 
    projectConvenios.some(c => c.id === o.convenioId)
  );

  const totals = useMemo(() => {
    return projectDocs.reduce((acc, doc) => {
      acc[doc.tipo] = (acc[doc.tipo] || 0) + doc.valor;
      return acc;
    }, { CDP: 0, RC: 0, Otros: 0 } as Record<string, number>);
  }, [projectDocs]);

  const difference = useMemo(() => {
    return totals.CDP - totals.RC;
  }, [totals.CDP, totals.RC]);

  const projectTotal = useMemo(() => {
    if (projectId) {
      const p = state.proyectos.find(p => p.id === projectId);
      if (!p) return 0;
      const convenio = state.convenios.find(c => c.id === p.convenioId);
      return convenio?.valorTotal || p.matrix?.valorTotalProyecto || 0;
    }
    // Global total
    return state.convenios.reduce((sum, c) => sum + (Number(c.valorTotal) || 0), 0);
  }, [state.proyectos, state.convenios, projectId]);

  const handleAnalyzeText = async () => {
    if (!pastedText.trim()) return;
    setIsAnalyzing(true);
    try {
      const doc = await analyzeFinancialDocumentText(
        pastedText, 
        selectedContractId, 
        selectedProjectId || projectId || '', 
        selectedConvenioId, 
        selectedOtrosieId
      );
      // Add event ID if selected
      if (selectedEventoId) {
        doc.eventoId = selectedEventoId;
      }
      setPreviewDoc(doc);
    } catch (error) {
      console.error(error);
      showAlert('Error al analizar el documento.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!previewDoc) return;

    const docsToSave: FinancialDocument[] = [];
    
    // Ensure we have a contractId if possible
    let finalDoc = { ...previewDoc };
    if (!finalDoc.contractId && finalDoc.contrato) {
      const matchingContract = state.contratos.find(c => 
        c.numero.toLowerCase().includes(finalDoc.contrato!.toLowerCase()) ||
        finalDoc.contrato!.toLowerCase().includes(c.numero.toLowerCase())
      );
      if (matchingContract) {
        finalDoc.contractId = matchingContract.id;
      }
    }

    // Add the main document
    docsToSave.push(finalDoc);

    // If it's a CDP and contains RC information, create the RC document automatically
    if (finalDoc.tipo === 'CDP' && finalDoc.numeroRc && finalDoc.valorRc) {
      const rcDoc: FinancialDocument = {
        ...finalDoc,
        id: `FIN-RC-${Date.now()}`,
        tipo: 'RC',
        numero: finalDoc.numeroRc,
        numeroCdp: finalDoc.numero,
        valor: finalDoc.valorRc,
        fecha: finalDoc.fechaRc || finalDoc.fecha,
        descripcion: `Registro Compromiso derivado del CDP No. ${finalDoc.numero}. ${finalDoc.descripcion}`,
        valorPagado: finalDoc.valorPagado,
        // Clear RC specific fields in the RC document itself to avoid recursion
        numeroRc: undefined,
        valorRc: undefined,
        fechaRc: undefined,
        validacion_ia: {
          ...finalDoc.validacion_ia!,
          observaciones: `Generado automáticamente desde CDP No. ${finalDoc.numero}`
        }
      };
      docsToSave.push(rcDoc);
    }

    // Use the new batch add method
    if (editingDocId) {
      updateFinancialDocument(finalDoc);
      showAlert('Documento financiero actualizado exitosamente.');
    } else {
      addFinancialDocuments(docsToSave);
      if (docsToSave.length > 1) {
        showAlert('CDP y RC creados exitosamente.');
      } else {
        showAlert('Documento financiero guardado exitosamente.');
      }
    }

    setPreviewDoc(null);
    setEditingDocId(null);
    setPastedText('');
    setShowModal(false);
    if (!projectId) setSelectedProjectId('');
    setSelectedContractId('');
    setSelectedConvenioId('');
    setSelectedOtrosieId('');
    setSelectedEventoId('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      
      const lines = content.split('\n');
      const docsToSave: FinancialDocument[] = [];
      
      lines.forEach((line, index) => {
        // Skip header if it looks like one
        if (index === 0 && (line.toLowerCase().includes('n°') || line.toLowerCase().includes('vincular'))) return;
        if (!line.trim()) return;
        
        // Flexible split: attempts tab first, then semicolon, then comma
        let parts = line.split('\t');
        if (parts.length < 5) parts = line.split(';');
        if (parts.length < 5) parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        
        if (parts.length >= 10) {
          const cleanAmount = (s: string) => {
            if (!s) return 0;
            // Remove symbols but keep numbers and decimal separators
            let val = s.replace(/[$\s]/g, '');
            // Handle European/Latin American format: 1.000,00 -> 1000.00
            if (val.includes(',') && val.includes('.')) {
              if (val.lastIndexOf(',') > val.lastIndexOf('.')) {
                val = val.replace(/\./g, '').replace(',', '.');
              } else {
                val = val.replace(/,/g, '');
              }
            } else if (val.includes(',')) {
              val = val.replace(',', '.');
            }
            return parseFloat(val) || 0;
          };

          const parseSpanishDate = (d: string) => {
            if (!d) return new Date().toISOString().split('T')[0];
            const clean = d.trim();
            if (clean.includes('/')) {
              const [day, month, year] = clean.split('/');
              if (year && year.length === 2) {
                return `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              }
              return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            return clean;
          };

          // Mapping based on Header:
          // 0: N°, 1: ConvenioRef, 2: ContractRef, 3: Beneficiary, 4: Rubro, 5: Fuente, 
          // 6: NoCDP, 7: FechaCDP, 8: ValCDP, 9: NoRC, 10: FechaRC, 11: ValRC, 12: Pagos Realizados
          const convenioRef = parts[1]?.trim();
          const contractRef = parts[2]?.trim();
          const beneficiary = parts[3]?.trim();
          const rubro = parts[4]?.trim();
          const fuente = parts[5]?.trim();
          const description = parts[17]?.trim() || `${fuente}: ${rubro}`;

          const cdpNum = parts[6]?.trim();
          const cdpDate = parseSpanishDate(parts[7]);
          const cdpVal = cleanAmount(parts[8]);

          const rcNum = parts[9]?.trim();
          const rcDate = parseSpanishDate(parts[10]);
          const rcVal = cleanAmount(parts[11]);
          
          const rpVal = cleanAmount(parts[12]);

          if (cdpNum) {
            // Attempt to resolve IDs
            let convenioId = selectedConvenioId || undefined;
            if (!convenioId && convenioRef) {
              const matched = state.convenios.find(c => 
                c.numero.toLowerCase().includes(convenioRef.toLowerCase()) || 
                convenioRef.toLowerCase().includes(c.numero.toLowerCase())
              );
              if (matched) convenioId = matched.id;
            }

            let contractId = selectedContractId || undefined;
            if (!contractId && contractRef) {
              const matched = state.contratos.find(c => 
                c.numero.toLowerCase().includes(contractRef.toLowerCase()) || 
                contractRef.toLowerCase().includes(c.numero.toLowerCase())
              );
              if (matched) contractId = matched.id;
            }

            const baseDoc = {
              projectId: selectedProjectId || projectId || '',
              convenioId,
              contractId,
              nombre: beneficiary,
              rubro,
              fuente,
              descripcion: description,
              validacion_ia: { coherente: true, observaciones: 'Importado vía Carga Masiva', inconsistencias: [] }
            };

            // 1. Create CDP
            const cdpDoc: FinancialDocument = {
              ...baseDoc,
              id: `FIN-CDP-CSV-${Date.now()}-${index}`,
              tipo: 'CDP',
              numero: cdpNum,
              valor: cdpVal,
              fecha: cdpDate,
            };
            docsToSave.push(cdpDoc);

            // 2. Create RC if exists
            if (rcNum && rcVal > 0) {
              const rcDoc: FinancialDocument = {
                ...baseDoc,
                id: `FIN-RC-CSV-${Date.now()}-${index}`,
                tipo: 'RC',
                numero: rcNum,
                numeroCdp: cdpNum,
                valor: rcVal,
                fecha: rcDate || cdpDate,
                valorPagado: rpVal // Store payments on RC
              };
              docsToSave.push(rcDoc);
            }
          }
        }
      });
      
      if (docsToSave.length > 0) {
        addFinancialDocuments(docsToSave);
        showAlert(`Éxito: Se procesaron ${docsToSave.length} registros financieros.`);
      } else {
        showAlert('Error: Formato no reconocido o sin datos procesables.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleDeleteAll = () => {
    if (window.confirm('¿Está seguro de que desea eliminar TODOS los documentos financieros? Esta acción no se puede deshacer.')) {
      clearFinancialDocuments();
      showAlert('Todos los registros financieros han sido eliminados.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Módulo de Ejecución Financiera</h3>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              clearDuplicatesFinancialDocuments();
              showAlert('Se han eliminado los registros duplicados.');
            }}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
          >
            <History size={18} />
            Limpiar Duplicados
          </button>
          <button 
            onClick={handleDeleteAll}
            className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl font-bold hover:bg-rose-100 transition-colors"
          >
            <Trash2 size={18} />
            Borrar Todo
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
            <FileSpreadsheet size={18} />
            Carga Masiva (CSV)
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv,.txt" 
            className="hidden" 
          />
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Plus size={18} />
            Nuevo Documento
          </button>
        </div>
      </div>

      {/* Visual Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'CDP Registrados', value: totals.CDP, color: 'indigo' },
          { label: 'RC Registrados (Compromisos)', value: totals.RC, color: 'emerald' },
          { label: 'Recursos por Liberar', value: difference, color: 'amber' }
        ].map(stat => {
          const percentage = projectTotal > 0 ? (stat.value / projectTotal) * 100 : 0;
          return (
            <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-sm font-black text-${stat.color}-600`}>{percentage.toFixed(1)}%</p>
              </div>
              <p className="text-xl font-black text-slate-800 mb-3">{formatCurrency(stat.value)}</p>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className={`h-full bg-${stat.color}-500 rounded-full transition-all duration-1000`}
                  style={{ width: `${Math.min(100, Math.abs(percentage))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        {['CDP', 'RC'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-3 px-4 font-bold text-sm transition-colors border-b-2 ${
              activeTab === tab 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'CDP' ? 'CDPs' : 'RCs'} ({projectDocs.filter(d => d.tipo === tab).length})
          </button>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={`Buscar ${activeTab} por número o descripción...`}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              if (window.confirm('¿Desea eliminar los documentos (CDP/RC) con números duplicados? Se conservará solo el primer registro.')) {
                clearDuplicatesFinancialDocuments();
                showAlert('Duplicados eliminados exitosamente.');
              }
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-black border border-rose-100 hover:bg-rose-100 transition-colors"
          >
            <Trash2 size={14} /> Eliminar Duplicados
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
            <FileText className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-700 mb-1">No hay {activeTab}s registrados</h3>
            <p className="text-slate-500">Agregue un nuevo documento para comenzar el seguimiento.</p>
          </div>
        ) : activeTab === 'CDP' ? (
          filteredDocs.map(doc => {
            const linkedRCs = projectDocs.filter(d => d.tipo === 'RC' && d.numeroCdp === doc.numero);
            const totalComprometido = linkedRCs.reduce((sum, rc) => sum + rc.valor, 0);
            const executionPercentage = doc.valor > 0 ? (totalComprometido / doc.valor) * 100 : 0;
            const isExpanded = editingDocId === doc.id; // Using this as a temporary toggle for demo if no specific state exists, or I can add one. Wait, let's use a local expanded state.
            
            return <CDPListItem 
              key={doc.id} 
              doc={doc} 
              linkedRCs={linkedRCs} 
              totalComprometido={totalComprometido} 
              executionPercentage={executionPercentage}
              formatCurrency={formatCurrency}
              onEdit={() => {
                setEditingDocId(doc.id);
                setPreviewDoc(doc);
                setShowModal(true);
              }}
              onDelete={() => deleteFinancialDocument(doc.id)}
              state={state}
            />;
          })
        ) : (
          filteredDocs.map(doc => (
            <div key={doc.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-black tracking-wider">
                      {doc.tipo}
                    </span>
                    <h4 className="font-bold text-lg text-slate-800">No. {doc.numero}</h4>
                  </div>
                  <p className="text-sm text-slate-500">{doc.descripcion}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor</p>
                  <p className="text-xl font-black text-emerald-600">{formatCurrency(doc.valor)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 mt-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha</p>
                  <p className="text-sm font-medium text-slate-700">{doc.fecha}</p>
                </div>
                {doc.radicado && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Radicado</p>
                    <p className="text-sm font-medium text-slate-700">{doc.radicado}</p>
                  </div>
                )}
                {doc.solicitante && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Solicitante</p>
                    <p className="text-sm font-medium text-slate-700">{doc.solicitante}</p>
                  </div>
                )}
                {doc.rubro && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rubro</p>
                    <p className="text-sm font-medium text-slate-700">{doc.rubro}</p>
                  </div>
                )}
                {doc.areaEjecutora && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Área Ejecutora</p>
                    <p className="text-sm font-medium text-slate-700">{doc.areaEjecutora}</p>
                  </div>
                )}
                {doc.fuente && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fuente</p>
                    <p className="text-sm font-medium text-slate-700">{doc.fuente}</p>
                  </div>
                )}
                {doc.identificacion && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identificación</p>
                    <p className="text-sm font-medium text-slate-700">{doc.identificacion}</p>
                  </div>
                )}
                {doc.nombre && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre/Razón Social</p>
                    <p className="text-sm font-medium text-slate-700">{doc.nombre}</p>
                  </div>
                )}
                {doc.numeroRc && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No. RC</p>
                    <p className="text-sm font-medium text-slate-700">{doc.numeroRc}</p>
                  </div>
                )}
                        {doc.valorRc !== undefined && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor RC</p>
                            <p className="text-sm font-medium text-emerald-600 font-bold">{formatCurrency(doc.valorRc)}</p>
                          </div>
                        )}
                        {doc.valorPagado !== undefined && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor Pagado</p>
                            <p className="text-sm font-medium text-blue-600 font-bold">{formatCurrency(doc.valorPagado)}</p>
                          </div>
                        )}
                        {doc.tipo === 'CDP' && (
                          <div>
                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Por Liberar</p>
                            <p className="text-sm font-medium text-amber-600 font-bold">{formatCurrency(doc.valor - (doc.valorRc || 0))}</p>
                          </div>
                        )}
                        {doc.estado && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado</p>
                    <p className="text-sm font-medium text-slate-700">{doc.estado}</p>
                  </div>
                )}
                {doc.usuario && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Usuario</p>
                    <p className="text-sm font-medium text-slate-700">{doc.usuario}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                {doc.convenioId && (
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">
                    Convenio: {state.convenios.find(c => c.id === doc.convenioId)?.numero || doc.convenioId}
                  </span>
                )}
                {doc.contractId && (
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">
                    Contrato: {state.contratos.find(c => c.id === doc.contractId)?.numero || doc.contractId}
                  </span>
                )}
                {doc.otrosieId && (
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">
                    Otrosí: {state.otrosies.find(o => o.id === doc.otrosieId)?.numero || doc.otrosieId}
                  </span>
                )}
                {doc.eventoId && (
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">
                    Evento: {state.eventos.find(e => e.id === doc.eventoId)?.nombre || doc.eventoId}
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => {
                    setEditingDocId(doc.id);
                    setPreviewDoc(doc);
                    setSelectedProjectId(doc.projectId || '');
                    setSelectedContractId(doc.contractId || '');
                    setSelectedConvenioId(doc.convenioId || '');
                    setSelectedOtrosieId(doc.otrosieId || '');
                    setSelectedEventoId(doc.eventoId || '');
                    setShowModal(true);
                  }}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => deleteFinancialDocument(doc.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingDocId ? 'Editar' : 'Registrar'} Documento Financiero</h3>
              <button onClick={() => {
                setShowModal(false);
                setEditingDocId(null);
                setPreviewDoc(null);
              }} className="text-indigo-200 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {previewDoc ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-600" size={24} />
                    <div>
                      <p className="text-sm font-bold text-emerald-900">Extracción Exitosa</p>
                      <p className="text-xs text-emerald-700">Revisa los campos extraídos antes de confirmar el guardado.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vincular a Convenio</label>
                      <select 
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                        value={selectedConvenioId}
                        onChange={e => {
                          setSelectedConvenioId(e.target.value);
                          if (previewDoc) setPreviewDoc({...previewDoc, convenioId: e.target.value});
                        }}
                      >
                        <option value="">Ninguno</option>
                        {state.convenios.map(c => (
                          <option key={c.id} value={c.id}>{c.numero}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vincular a Contrato</label>
                      <select 
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                        value={selectedContractId}
                        onChange={e => {
                          setSelectedContractId(e.target.value);
                          if (previewDoc) setPreviewDoc({...previewDoc, contractId: e.target.value});
                        }}
                      >
                        <option value="">Ninguno</option>
                        {state.contratos.map(c => (
                          <option key={c.id} value={c.id}>{c.numero}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Información del CDP</h4>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tipo de Documento</label>
                        <select 
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                          value={previewDoc.tipo}
                          onChange={e => setPreviewDoc({...previewDoc, tipo: e.target.value as any})}
                        >
                          <option value="CDP">CDP (Disponibilidad)</option>
                          <option value="RC">RC (Registro Compromiso)</option>
                          <option value="Otros">Otros</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Número {previewDoc.tipo === 'CDP' ? 'CDP' : 'RC'}
                          </label>
                          <input 
                            type="text" 
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            value={previewDoc.numero}
                            onChange={e => setPreviewDoc({...previewDoc, numero: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Valor {previewDoc.tipo === 'CDP' ? 'CDP' : 'RC'}
                          </label>
                          <input 
                            type="number" 
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-indigo-600"
                            value={previewDoc.valor}
                            onChange={e => setPreviewDoc({...previewDoc, valor: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      {previewDoc.tipo === 'RC' && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vincular a Número de CDP</label>
                          <select 
                            className="w-full p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm font-black"
                            value={previewDoc.numeroCdp || ''}
                            onChange={e => setPreviewDoc({...previewDoc, numeroCdp: e.target.value})}
                          >
                            <option value="">Seleccione CDP...</option>
                            {projectDocs.filter(d => d.tipo === 'CDP').map(cdp => (
                              <option key={cdp.id} value={cdp.numero}>
                                CDP {cdp.numero} - {formatCurrency(cdp.valor)}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Descripción / Objeto</label>
                        <textarea 
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm h-20"
                          value={previewDoc.descripcion}
                          onChange={e => setPreviewDoc({...previewDoc, descripcion: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Información del RC (Si aplica)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Número RC</label>
                          <input 
                            type="text" 
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            value={previewDoc.numeroRc || ''}
                            onChange={e => setPreviewDoc({...previewDoc, numeroRc: e.target.value})}
                            placeholder="Ej: 1255"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Valor RC</label>
                          <input 
                            type="number" 
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-emerald-600"
                            value={previewDoc.valorRc || ''}
                            onChange={e => setPreviewDoc({...previewDoc, valorRc: Number(e.target.value)})}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fecha RC</label>
                          <input 
                            type="date" 
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            value={previewDoc.fechaRc || ''}
                            onChange={e => setPreviewDoc({...previewDoc, fechaRc: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Estado</label>
                          <input 
                            type="text" 
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            value={previewDoc.estado || ''}
                            onChange={e => setPreviewDoc({...previewDoc, estado: e.target.value})}
                            placeholder="Asignado"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Beneficiario / Nombre</label>
                        <input 
                          type="text" 
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                          value={previewDoc.nombre || ''}
                          onChange={e => setPreviewDoc({...previewDoc, nombre: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Rubro</label>
                      <input 
                        type="text" 
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        value={previewDoc.rubro || ''}
                        onChange={e => setPreviewDoc({...previewDoc, rubro: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fuente</label>
                      <input 
                        type="text" 
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        value={previewDoc.fuente || ''}
                        onChange={e => setPreviewDoc({...previewDoc, fuente: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Usuario</label>
                      <input 
                        type="text" 
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        value={previewDoc.usuario || ''}
                        onChange={e => setPreviewDoc({...previewDoc, usuario: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {!projectId && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Seleccionar Proyecto Destino</label>
                      <select 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                        value={selectedProjectId}
                        onChange={e => setSelectedProjectId(e.target.value)}
                      >
                        <option value="">-- Seleccione un Proyecto --</option>
                        {availableProjects.map(p => (
                          <option key={p.id} value={p.id}>{p.id} - {p.nombre}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vincular a Convenio</label>
                      <div className="space-y-2">
                        <input 
                          type="text"
                          placeholder="Buscar por número..."
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          value={convenioSearch}
                          onChange={e => setConvenioSearch(e.target.value)}
                        />
                        <select 
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                          value={selectedConvenioId}
                          onChange={e => setSelectedConvenioId(e.target.value)}
                        >
                          <option value="">Ninguno</option>
                          {projectConvenios.map(c => (
                            <option key={c.id} value={c.id}>{c.numero} - {c.nombre}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vincular a Contrato</label>
                      <div className="space-y-2">
                        <input 
                          type="text"
                          placeholder="Buscar por número..."
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          value={contractSearch}
                          onChange={e => setContractSearch(e.target.value)}
                        />
                        <select 
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                          value={selectedContractId}
                          onChange={e => setSelectedContractId(e.target.value)}
                        >
                          <option value="">Ninguno</option>
                          {projectContracts.map(c => (
                            <option key={c.id} value={c.id}>{c.numero} ({c.tipo})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vincular a Otrosí</label>
                      <select 
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        value={selectedOtrosieId}
                        onChange={e => setSelectedOtrosieId(e.target.value)}
                      >
                        <option value="">Ninguno</option>
                        {projectOtrosies.map(o => (
                          <option key={o.id} value={o.id}>{o.numero}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vincular a Evento</label>
                      <select 
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        value={selectedEventoId}
                        onChange={e => setSelectedEventoId(e.target.value)}
                      >
                        <option value="">Ninguno</option>
                        {state.eventos.map(e => (
                          <option key={e.id} value={e.id}>{e.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                      <Activity size={18} />
                      Extracción Automática con IA
                    </h4>
                    <p className="text-sm text-indigo-700 mb-4">
                      Pega el texto del CDP o RC extraído de la matriz o documento oficial. La IA extraerá todos los campos automáticamente.
                    </p>
                    <textarea
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Ejemplo: 15-0001 13.000.000,00 124 SUBDIRECC DE REDUCCION..."
                      className="w-full h-32 p-4 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
              <button 
                onClick={() => {
                  if (previewDoc) setPreviewDoc(null);
                  else setShowModal(false);
                }}
                className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-all"
              >
                {previewDoc ? 'Volver' : 'Cancelar'}
              </button>
              
              {previewDoc ? (
                <button 
                  onClick={handleSave}
                  className="bg-emerald-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex items-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Confirmar y Guardar
                </button>
              ) : (
                <button 
                  onClick={handleAnalyzeText}
                  disabled={isAnalyzing || !pastedText.trim()}
                  className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:bg-slate-400"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                  Analizar Documento
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
