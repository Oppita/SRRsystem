import React, { useState } from 'react';
import { Contract, Pago, InterventoriaReport } from '../types';
import { useProject } from '../store/ProjectContext';
import { X, DollarSign, Calendar, FileText, CheckCircle2, AlertCircle, Upload, Loader2 } from 'lucide-react';
import { uploadDocumentToStorage, formatDateForInput } from '../lib/storage';

interface AddPagoFormProps {
  contracts: Contract[];
  reports: InterventoriaReport[];
  onClose: () => void;
}

export const AddPagoForm: React.FC<AddPagoFormProps> = ({ contracts, reports, onClose }) => {
  const { addPago, addDocument } = useProject();
  const [formData, setFormData] = useState<Partial<Pago>>({
    contractId: contracts[0]?.id || '',
    fecha: new Date().toISOString().split('T')[0],
    estado: 'Pendiente',
    valor: 0,
    numero: '',
    observaciones: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contractId || !formData.valor || !formData.numero) return;

    setIsSubmitting(true);

    try {
      let soporteUrl = formData.soporteUrl;

      if (selectedFile) {
        const folderPath = `Pagos/${formData.contractId}`;
        soporteUrl = await uploadDocumentToStorage(selectedFile, folderPath);
        
        // Add to document repository
        addDocument({
          id: `DOC-PAGO-${Date.now()}`,
          contractId: formData.contractId,
          titulo: `Soporte Pago ${formData.numero}`,
          tipo: 'Soporte Pago',
          fechaCreacion: new Date().toISOString().split('T')[0],
          ultimaActualizacion: new Date().toISOString().split('T')[0],
          estado: 'Aprobado',
          tags: ['Pago', formData.numero],
          folderPath,
          versiones: [{
            id: `VER-${Date.now()}`,
            version: 1,
            fecha: new Date().toISOString().split('T')[0],
            url: soporteUrl,
            nombreArchivo: selectedFile.name,
            subidoPor: 'Administrador',
            accion: 'Subida',
            estado: 'Aprobado'
          }]
        });
      }

      const newPago: Pago = {
        id: `PAG-${Date.now()}`,
        contractId: formData.contractId!,
        reportId: formData.reportId,
        numero: formData.numero!,
        fecha: formData.fecha!,
        valor: Number(formData.valor),
        estado: formData.estado as any,
        observaciones: formData.observaciones || '',
        soporteUrl,
      };

      addPago(newPago);
      onClose();
    } catch (error) {
      console.error("Error saving pago:", error);
      alert("Hubo un error al guardar el pago.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <DollarSign size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Registrar Pago</h2>
              <p className="text-indigo-100 text-xs">Gestión financiera del contrato</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contrato</label>
              <select 
                value={formData.contractId}
                onChange={e => setFormData({ ...formData, contractId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              >
                {contracts.map(c => (
                  <option key={c.id} value={c.id}>{c.numero} - {c.contratista}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Número de Pago / Factura</label>
              <input 
                type="text"
                value={formData.numero}
                onChange={e => setFormData({ ...formData, numero: e.target.value })}
                placeholder="Ej: PAG-001"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Valor del Pago</label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="number"
                  value={formData.valor}
                  onChange={e => setFormData({ ...formData, valor: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="date"
                  value={formatDateForInput(formData.fecha || '')}
                  onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Informe de Interventoría Asociado</label>
              <select 
                value={formData.reportId}
                onChange={e => setFormData({ ...formData, reportId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="">Ninguno</option>
                {reports.filter(r => r.contractId === formData.contractId || !r.contractId).map(r => (
                  <option key={r.id} value={r.id}>Semana {r.semana} ({r.fechaInicio} - {r.fechaFin})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</label>
              <select 
                value={formData.estado}
                onChange={e => setFormData({ ...formData, estado: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Pagado">Pagado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Soporte del Pago (Opcional)</label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
                id="soporte-upload"
              />
              <label
                htmlFor="soporte-upload"
                className="flex items-center justify-center gap-2 w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl px-4 py-6 text-sm hover:bg-slate-100 hover:border-indigo-400 transition-all cursor-pointer"
              >
                <Upload size={20} className="text-slate-400" />
                <span className="text-slate-600 font-medium">
                  {selectedFile ? selectedFile.name : 'Subir documento de soporte'}
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Observaciones</label>
            <textarea 
              value={formData.observaciones}
              onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
              placeholder="Detalles adicionales del pago..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Pago'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
