import React, { useState, useMemo } from 'react';
import { Contract, Otrosie, Project, Convenio } from '../types';
import { ChevronDown, ChevronUp, FileText, Clock, AlertTriangle, DollarSign, Calendar, Edit2, Layers, Activity, TrendingUp, Trash2 } from 'lucide-react';
import { ContractTimeline } from './ContractTimeline';
import { EditContractModal } from './EditContractModal';
import { useProject } from '../store/ProjectContext';
import { calculateProjectTotals, calculateContractTotals } from '../utils/projectCalculations';
import { AddContractForm } from './AddContractForm';

interface ContratosDetalladosProps {
  contracts: Contract[];
  otrosies: Otrosie[];
  projectId: string;
  project: Project;
}

export const ContratosDetallados: React.FC<ContratosDetalladosProps> = ({ contracts, otrosies, projectId, project }) => {
  const { state } = useProject();
  const [expandedContractId, setExpandedContractId] = useState<string | null>(null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  const convenio = useMemo(() => 
    state.convenios.find(c => c.id === project.convenioId),
    [state.convenios, project.convenioId]
  );

  const convenioTotals = useMemo(() => {
    if (!convenio) return null;
    return calculateProjectTotals(
      project,
      state.contratos,
      state.otrosies,
      state.convenios,
      state.afectaciones,
      state.pagos,
      state.suspensiones,
      undefined,
      state.proyectos,
      undefined,
      state.presupuestos
    );
  }, [project, state, convenio]);

  const convenioOtrosies = useMemo(() => 
    state.otrosies.filter(o => o.convenioId === convenio?.id),
    [state.otrosies, convenio?.id]
  );

  const convenioDocuments = useMemo(() => 
    state.documentos.filter(d => d.convenioId === convenio?.id),
    [state.documentos, convenio?.id]
  );

  const timeProgress = useMemo(() => {
    if (!convenio || !convenio.fechaInicio || !convenio.fechaFin) return 0;
    const start = new Date(convenio.fechaInicio).getTime();
    const end = new Date(convenio.fechaFin).getTime();
    const now = new Date().getTime();
    if (now < start) return 0;
    if (now > end) return 100;
    return ((now - start) / (end - start)) * 100;
  }, [convenio]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-lg font-semibold text-slate-800">Jerarquía y Detalle de Contratación</h3>
        {convenio && (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
            <Layers size={14} />
            Proyecto Vinculado a Convenio
          </div>
        )}
      </div>

      {/* SECCIÓN 1: CONVENIO (JERARQUÍA SUPERIOR) */}
      {convenio && (
        <div className="border-2 border-emerald-200 rounded-3xl overflow-hidden bg-emerald-50/30 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="p-6 bg-emerald-100/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-emerald-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200">
                <Layers size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 text-[10px] font-black rounded-lg uppercase tracking-widest">Nivel 1: Convenio Marco</span>
                  <span className="text-xs font-bold text-slate-500">No. {convenio.numero}</span>
                </div>
                <h4 className="text-2xl font-black text-slate-900 leading-tight">{convenio.nombre}</h4>
              </div>
            </div>
            <div className="text-right bg-white/60 px-6 py-3 rounded-2xl border border-emerald-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Valor Total del Convenio</span>
              <span className="text-3xl font-black text-emerald-700 tracking-tighter">{formatCurrency(convenioTotals?.valorTotal || convenio.valorTotal)}</span>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Trazabilidad Financiera Detallada */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Valor Original</p>
                <p className="text-sm font-bold text-slate-700">{formatCurrency(convenioTotals?.valorOriginal || 0)}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Adiciones/Reduc.</p>
                <p className={`text-sm font-bold ${(convenioTotals?.valorAdicional || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {(convenioTotals?.valorAdicional || 0) >= 0 ? '+' : ''}{formatCurrency(convenioTotals?.valorAdicional || 0)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Valor Total</p>
                <p className="text-sm font-bold text-slate-900">{formatCurrency(convenioTotals?.valorTotal || 0)}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Contratado</p>
                <p className="text-sm font-bold text-indigo-600">{formatCurrency(convenioTotals?.valorContratado || 0)}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ejecutado (Pagos)</p>
                <p className="text-sm font-bold text-emerald-600">{formatCurrency(convenioTotals?.valorEjecutado || 0)}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Saldo x Ejecutar</p>
                <p className="text-sm font-bold text-rose-600">{formatCurrency(convenioTotals?.saldoPorEjecutar || 0)}</p>
              </div>
            </div>

            {/* Barras de Ejecución (Financiera y Tiempo) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Ejecución Financiera */}
              <div className="space-y-4 bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <span className="text-sm font-black text-slate-800">Ejecución Financiera</span>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pagos vs Valor Total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-emerald-600 tracking-tighter">
                      {convenioTotals ? ((convenioTotals.valorEjecutado / convenioTotals.valorTotal) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
                
                <div className="relative pt-2">
                  <div className="w-full bg-slate-100 rounded-full h-6 overflow-hidden border border-slate-200 p-1">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-1000 relative shadow-inner"
                      style={{ width: `${convenioTotals ? (convenioTotals.valorEjecutado / convenioTotals.valorTotal) * 100 : 0}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Inversión: {formatCurrency(convenioTotals?.valorTotal || 0)}</span>
                  <span>Saldo: {formatCurrency(convenioTotals?.saldoPorEjecutar || 0)}</span>
                </div>
              </div>

              {/* Ejecución de Tiempo */}
              <div className="space-y-4 bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Clock size={20} />
                    </div>
                    <div>
                      <span className="text-sm font-black text-slate-800">Transcurso del Tiempo</span>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Días Transcurridos vs Plazo Total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-indigo-600 tracking-tighter">
                      {timeProgress.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="relative pt-2">
                  <div className="w-full bg-slate-100 rounded-full h-6 overflow-hidden border border-slate-200 p-1">
                    <div 
                      className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-full rounded-full transition-all duration-1000 relative shadow-inner"
                      style={{ width: `${timeProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Calendar size={12} /> Inicio: {convenio.fechaInicio}</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> Fin: {convenio.fechaFin}</span>
                </div>
              </div>
            </div>

            {/* Trazabilidad Financiera del Convenio */}
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-1">Trazabilidad Financiera</h5>
                  <p className="text-sm text-slate-500">Gestione los CDP, RC y RP desde el Módulo Financiero.</p>
                </div>
              </div>
            </div>

            {/* Otrosíes del Convenio */}
            {convenioOtrosies.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={18} className="text-emerald-600" />
                  <h5 className="font-bold text-slate-800 uppercase tracking-wider text-xs">Otrosíes del Convenio</h5>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {convenioOtrosies.map(o => (
                    <div key={o.id} className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{o.numero}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{o.fechaFirma}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-emerald-600 font-bold">+{formatCurrency(o.valorAdicional || 0)}</p>
                          <p className="text-[10px] text-indigo-600 font-bold">+{o.plazoAdicionalMeses || 0} meses</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documentos del Convenio */}
            {convenioDocuments.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={18} className="text-emerald-600" />
                  <h5 className="font-bold text-slate-800 uppercase tracking-wider text-xs">Documentos de Soporte</h5>
                </div>
                <div className="flex flex-wrap gap-3">
                  {convenioDocuments.map(doc => {
                    const latestVersion = doc.versiones[doc.versiones.length - 1];
                    return (
                      <a 
                        key={doc.id} 
                        href={latestVersion?.url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all text-xs font-bold"
                      >
                        <FileText size={14} />
                        {doc.titulo}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Línea de Tiempo del Convenio */}
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
              <h5 className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-6 flex items-center gap-2">
                <Clock size={16} className="text-emerald-600" />
                Línea de Tiempo del Convenio Marco
              </h5>
              <ContractTimeline contracts={[]} otrosies={convenioOtrosies} convenio={convenio} />
            </div>

            {/* Pie de Trazabilidad */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-emerald-100">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Financiero OK</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200"></div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Cronograma OK</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-200"></div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Estado: {convenio.estado}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-700 bg-emerald-100 px-4 py-2 rounded-full uppercase tracking-widest border border-emerald-200">
                <TrendingUp size={14} />
                Trazabilidad Financiera y Temporal Consolidada
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 2: CONTRATOS (NIVEL 2) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
            {convenio ? '2' : '1'}
          </div>
          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-sm">
            {convenio ? 'Contratación Derivada' : 'Contratación del Proyecto'}
          </h4>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
        {contracts.map(contract => {
          const contractOtrosies = otrosies.filter(o => o.contractId === contract.id);
          const isExpanded = expandedContractId === contract.id;

          return (
            <div key={contract.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div 
                className="p-4 bg-slate-50 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => setExpandedContractId(isExpanded ? null : contract.id)}
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider ${
                    contract.tipo === 'Obra' ? 'bg-indigo-100 text-indigo-700' : 
                    contract.tipo === 'Interventoría' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {contract.tipo}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{contract.numero}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingContract(contract);
                    }}
                    className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Editar Contrato con IA"
                  >
                    <Edit2 size={16} />
                  </button>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {isExpanded && (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Valor Inicial</p>
                      <p className="font-bold text-slate-900">{formatCurrency(contract.valor)}</p>
                      {contractOtrosies.length > 0 && (
                        <p className="text-xs text-emerald-600 font-bold mt-1">
                          Total: {formatCurrency(contract.valor + contractOtrosies.reduce((sum, o) => sum + (o.valorAdicional || 0), 0))}
                        </p>
                      )}
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Plazo Inicial</p>
                      <p className="font-bold text-slate-900">{contract.plazoMeses} meses</p>
                      {contractOtrosies.length > 0 && (
                        <p className="text-xs text-indigo-600 font-bold mt-1">
                          Total: {contract.plazoMeses + contractOtrosies.reduce((sum, o) => sum + (o.plazoAdicionalMeses || 0), 0)} meses
                        </p>
                      )}
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Contratista</p>
                      <p className="font-bold text-slate-900">{contract.contratista}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Estado</p>
                      <p className="font-bold text-slate-900">{contract.estado}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="font-bold text-slate-800 mb-4">Línea de Tiempo</h4>
                    <ContractTimeline contracts={[contract]} otrosies={contractOtrosies} />
                  </div>

                  {contractOtrosies.length > 0 && (
                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="font-bold text-slate-800 mb-4">Otrosíes</h4>
                      <div className="space-y-6">
                        {contractOtrosies.map(o => (
                          <div key={o.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex justify-between items-center mb-4">
                              <div>
                                <p className="font-bold text-slate-900">{o.numero}</p>
                                <p className="text-xs text-slate-500">{o.fechaFirma}</p>
                              </div>
                              <div className="flex gap-4 text-sm">
                                <div className="text-right">
                                  <p className="text-[10px] text-slate-400 uppercase font-bold">Impacto Valor</p>
                                  <p className="font-bold text-emerald-600">{formatCurrency(o.valorAdicional)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] text-slate-400 uppercase font-bold">Impacto Tiempo</p>
                                  <p className="font-bold text-indigo-600">{o.plazoAdicionalMeses} meses</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editingContract && (
        <EditContractModal 
          contract={editingContract}
          projectId={projectId}
          onClose={() => setEditingContract(null)}
        />
      )}
    </div>
  </div>
);
};
