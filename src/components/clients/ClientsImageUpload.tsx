// src/components/clients/ClientsImageUpload.tsx
// ⭐ FIX: Nampidirina ny prop `initials` mba tsy hisy ilay mifanindry intsony
import React, { useRef, DragEvent, useState } from 'react';
import { Loader2, CheckCircle, AlertCircle, Image as ImageIcon, Upload, Camera, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const THEME = {
  light: { border: '#E2E8F0', borderHover: '#6366F1', background: '#FFFFFF', softBackground: '#F8FAFC', text: '#0F172A', muted: '#64748B', subMuted: '#94A3B8', primary: '#6366F1', primarySoft: 'rgba(99,102,241,0.08)', success: '#059669', danger: '#DC2626' },
  dark: { border: '#334155', borderHover: '#818CF8', background: '#0F172A', softBackground: '#111827', text: '#F8FAFC', muted: '#94A3B8', subMuted: '#64748B', primary: '#818CF8', primarySoft: 'rgba(129,140,248,0.10)', success: '#34D399', danger: '#F87171' },
};

interface ClientsImageUploadProps { 
  imagePreview: string | null; 
  uploadingImage: boolean; 
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  onRemoveImage: () => void; 
  fileInputRef: React.RefObject<HTMLInputElement>; 
  isDark?: boolean; 
  uploadProgress?: number; 
  error?: string | null;
  initials?: string; // ⭐ VAOVAO: Nampidirina ny initiales mba haseho rehefa tsy misy sary
}

const ClientsImageUpload: React.FC<ClientsImageUploadProps> = ({ 
  imagePreview, 
  uploadingImage, 
  onImageChange, 
  onRemoveImage, 
  fileInputRef, 
  isDark: isDarkProp, 
  uploadProgress = 0, 
  error = null,
  initials = ''
}) => {
  const { isDark: themeIsDark } = useTheme(); 
  const isDark = isDarkProp !== undefined ? isDarkProp : themeIsDark; 
  const theme = isDark ? THEME.dark : THEME.light;
  const [isDragging, setIsDragging] = useState(false); 
  const [isHovering, setIsHovering] = useState(false); 
  const dropRef = useRef<HTMLDivElement>(null);
  
  const handleClick = () => { if (!uploadingImage && fileInputRef.current) fileInputRef.current.click(); };
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); if (!uploadingImage) setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); if (!uploadingImage) setIsDragging(true); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); if (uploadingImage) return; const files = e.dataTransfer.files; if (files && files.length > 0 && fileInputRef.current) { const file = files[0]; if (!file.type.startsWith('image/')) return; const dataTransfer = new DataTransfer(); dataTransfer.items.add(file); fileInputRef.current.files = dataTransfer.files; fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true })); } };
  const FileInput = () => <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/gif,image/webp" onChange={onImageChange} className="hidden" disabled={uploadingImage} />;

  // ⭐ Mise à jour des bordures pour utiliser border-gray-300 en Light et border-slate-700 en Dark
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';

  if (imagePreview && typeof imagePreview === 'string') {
    return (
      <div ref={dropRef} className="group relative h-full w-full cursor-pointer overflow-hidden rounded-xl border transition-all duration-200" style={{ borderColor: isDragging ? theme.borderHover : theme.border, background: theme.background, boxShadow: isDragging ? `0 0 0 3px ${theme.primarySoft}` : 'none' }} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} onClick={handleClick}>
        <img src={imagePreview} alt="Aperçu du client" className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <button type="button" onClick={e => { e.stopPropagation(); onRemoveImage(); }} disabled={uploadingImage} className="absolute left-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white shadow-lg backdrop-blur-md transition-all duration-150 hover:scale-105 hover:bg-black/75 disabled:cursor-not-allowed disabled:opacity-50" title="Supprimer l'image"><X className="h-3.5 w-3.5" /></button>
        {!uploadingImage && !error && <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-md" style={{ background: isDark ? 'rgba(15,23,42,0.88)' : 'rgba(255,255,255,0.94)', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.9)', color: theme.success }}><CheckCircle className="h-3.5 w-3.5" strokeWidth={2} />Prête</div>}
        <div className={`absolute inset-0 z-10 flex items-center justify-center bg-black/45 backdrop-blur-[1px] transition-opacity duration-200 ${isHovering ? 'opacity-100' : 'opacity-0'}`}><div className="flex flex-col items-center gap-2 text-white"><div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/15 shadow-lg backdrop-blur-md"><Camera className="h-5 w-5" strokeWidth={2} /></div><span className="text-[13px] font-medium">Changer la photo</span><span className="text-[11px] text-white/70">Cliquez ou glissez une image</span></div></div>
        {uploadingImage && <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/65 text-white backdrop-blur-[2px]"><Loader2 className="mb-2 h-7 w-7 animate-spin" strokeWidth={2} /><span className="text-[13px] font-semibold">Téléchargement...</span><div className="mt-3 h-1.5 w-32 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-indigo-400 transition-all duration-200" style={{ width: `${Math.min(uploadProgress, 100)}%` }} /></div><span className="mt-1.5 text-[11px] text-white/70">{Math.min(uploadProgress, 100)}%</span></div>}
        <FileInput />
      </div>
    );
  }

  return (
    <div ref={dropRef} className="group relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed px-5 text-center transition-all duration-200" onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} onClick={handleClick} style={{ borderColor: isDragging ? theme.borderHover : error ? theme.danger : theme.border, background: isDragging ? theme.primarySoft : theme.background, boxShadow: isDragging ? `0 0 0 3px ${theme.primarySoft}` : 'none' }}>
      
      {/* ⭐ FAMPIANARANA: Haseho eo afovoany tsara ilay initiales rehefa tsy misy sary, tsy mifanindry intsony */}
      {!uploadingImage && !error && initials && (
        <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-10 transition-opacity">
          <div className="flex h-24 w-24 items-center justify-center rounded-full text-4xl font-bold" style={{ background: theme.primarySoft, color: theme.primary }}>{initials}</div>
        </div>
      )}

      {uploadingImage ? (
        <div className="flex flex-col items-center"><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10"><Loader2 className="h-5 w-5 animate-spin" style={{ color: theme.primary }} /></div><span className="text-[13px] font-semibold" style={{ color: theme.text }}>Téléchargement...</span><div className="mt-3 h-1.5 w-36 overflow-hidden rounded-full" style={{ background: isDark ? '#334155' : '#E2E8F0' }}><div className="h-full rounded-full bg-indigo-500 transition-all duration-200" style={{ width: `${Math.min(uploadProgress, 100)}%` }} /></div><span className="mt-1.5 text-[11px]" style={{ color: theme.subMuted }}>{Math.min(uploadProgress, 100)}%</span></div>
      ) : (
        <>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 group-hover:scale-105 z-10" style={{ background: error ? isDark ? 'rgba(248,113,113,0.10)' : '#FEF2F2' : isDragging ? theme.primarySoft : isDark ? '#1E293B' : '#F1F5F9' }}>{error ? <AlertCircle className="h-5 w-5" style={{ color: theme.danger }} /> : isDragging ? <Upload className="h-5 w-5" style={{ color: theme.primary }} /> : <ImageIcon className="h-5 w-5" style={{ color: theme.muted }} />}</div>
          <p className="text-[13px] font-semibold z-10" style={{ color: error ? theme.danger : isDragging ? theme.primary : theme.text }}>{error ? error : isDragging ? 'Déposez l’image ici' : 'Ajouter une image'}</p>
          {!error && <><p className="mt-1 text-[12px] z-10" style={{ color: theme.subMuted }}>Cliquez ou glissez-déposez</p><p className="mt-1 text-[11px] z-10" style={{ color: theme.subMuted }}>PNG, JPG, WEBP ou GIF · 10 MB max.</p></>}
          {isDragging && <div className="mt-3 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400 z-10">Relâchez pour importer</div>}
        </>
      )}
      <FileInput />
    </div>
  );
};
export default ClientsImageUpload;