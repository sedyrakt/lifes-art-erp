import React, { useRef, useState, DragEvent } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Image as ImageIcon, Upload, Camera, X } from 'lucide-react';

interface EmployesImageUploadProps { imagePreview: string | null; uploadingImage: boolean; onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onRemoveImage: () => void; uploadProgress: number; imageError: string | null; isDark: boolean; }

const EmployesImageUpload: React.FC<EmployesImageUploadProps> = ({ imagePreview, uploadingImage, onImageChange, onRemoveImage, uploadProgress, imageError, isDark }) => {
  const fileInputRef = useRef<HTMLInputElement>(null); const [isDragging, setIsDragging] = useState(false); const [isHovering, setIsHovering] = useState(false);
  // ⭐ Boridy mifanaraka amin'ny gray-300 / slate-700
  const theme = isDark ? { bg: '#0F172A', soft: '#111C30', border: '#334155', text: '#F8FAFC', muted: '#94A3B8', subtle: '#64748B', primary: '#818CF8' } : { bg: '#FFFFFF', soft: '#F8FAFC', border: '#D1D5DB', text: '#0F172A', muted: '#64748B', subtle: '#94A3B8', primary: '#6366F1' };
  
  const handleClick = () => { if (!uploadingImage && fileInputRef.current) fileInputRef.current.click(); };
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); const files = e.dataTransfer.files; if (!files || files.length === 0) return; const file = files[0]; if (!file.type.startsWith('image/')) return; const input = fileInputRef.current; if (!input) return; try { const dataTransfer = new DataTransfer(); dataTransfer.items.add(file); input.files = dataTransfer.files; input.dispatchEvent(new Event('change', { bubbles: true })); } catch {} };

  if (imagePreview && typeof imagePreview === 'string') {
    return (<div className="absolute inset-0 overflow-hidden"><div className="group relative h-full w-full cursor-pointer overflow-hidden" onClick={handleClick} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}><img src={imagePreview} alt="Aperçu employé" className={`h-full w-full object-cover transition-transform duration-300 ${isHovering ? 'scale-[1.035]' : 'scale-100'}`} /><div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" /><button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemoveImage(); }} disabled={uploadingImage} aria-label="Supprimer la photo" className="absolute left-2.5 top-2.5 z-20 flex h-7 w-7 items-center justify-center rounded-lg bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75 disabled:cursor-not-allowed disabled:opacity-50"><X className="h-3.5 w-3.5" /></button>{!uploadingImage && !imageError && (<div className="absolute right-2.5 top-2.5 z-20 flex items-center gap-1.5 rounded-full border border-emerald-200/30 bg-black/45 px-2 py-1 text-white backdrop-blur-sm"><CheckCircle2 className="h-3 w-3 text-emerald-400" /><span className="text-[11px] font-semibold">Prête</span></div>)}<div className={`absolute inset-0 z-10 flex items-center justify-center bg-black/40 transition-opacity duration-200 ${isHovering ? 'opacity-100' : 'pointer-events-none opacity-0'}`}><div className="flex flex-col items-center gap-1.5 text-white"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm"><Camera className="h-4.5 w-4.5" /></div><span className="text-[12px] font-medium">Changer la photo</span></div></div>{uploadingImage && (<div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/55 backdrop-blur-[2px]"><Loader2 className="h-7 w-7 animate-spin text-white" /><span className="text-[12px] font-semibold text-white">Téléchargement...</span><div className="h-1 w-24 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white transition-all duration-300" style={{ width: `${Math.min(uploadProgress, 100)}%` }} /></div><span className="text-[11px] text-white/80">{Math.min(uploadProgress, 100)}%</span></div>)}</div></div>);
  }

  return (<div onClick={handleClick} onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl transition-all duration-200" style={{ background: isDragging ? (isDark ? 'rgba(99,102,241,0.10)' : 'rgba(99,102,241,0.05)') : theme.soft, border: `1px dashed ${isDragging ? theme.primary : theme.border}` }}>
    <div className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200" style={{ background: isDragging ? (isDark ? 'rgba(99,102,241,0.15)' : '#EEF2FF') : (isDark ? '#1E293B' : '#F1F5F9'), color: isDragging ? theme.primary : theme.subtle }}>{uploadingImage ? <Loader2 className="h-6 w-6 animate-spin" /> : imageError ? <AlertCircle className="h-6 w-6 text-rose-500" /> : isDragging ? <Upload className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}</div>
    <div className="mt-2.5 px-3 text-center">
      {uploadingImage ? (
        <><p className="text-[13px] font-semibold" style={{ color: theme.text }}>Téléchargement...</p><div className="mx-auto mt-2 h-1 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-full rounded-full bg-indigo-500 transition-all duration-300" style={{ width: `${Math.min(uploadProgress, 100)}%` }} /></div><p className="mt-1 text-[11px]" style={{ color: theme.muted }}>{Math.min(uploadProgress, 100)}%</p></>
      ) : imageError ? (
        <p className="text-[12px] font-semibold text-rose-500">{imageError}</p>
      ) : (
        <><p className="text-[12px] font-semibold" style={{ color: theme.text }}><span style={{ color: theme.primary }}>Cliquez</span> ou glissez-déposez</p><p className="mt-1 text-[11px]" style={{ color: theme.muted }}>PNG, JPG, WEBP, GIF · Max 10MB</p></>
      )}
    </div>
    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/gif,image/webp" onChange={onImageChange} className="hidden" disabled={uploadingImage} />
  </div>);
};
export default EmployesImageUpload;