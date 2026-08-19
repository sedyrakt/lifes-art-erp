// src/components/produits/ProduitsImageUpload.tsx
// PREMIUM INDIGO IMAGE UPLOAD
import React, { useRef, useState, DragEvent } from 'react';
import { Upload, Loader2, X, Image as ImageIcon, CheckCircle2, AlertCircle, Camera } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ProduitsImageUploadProps {
  imagePreview: string | null;
  uploadingImage: boolean;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isDark?: boolean;
  uploadProgress?: number;
  error?: string | null;
}

const ProduitsImageUpload: React.FC<ProduitsImageUploadProps> = ({
  imagePreview, uploadingImage, onImageChange, onRemoveImage, fileInputRef, isDark: propIsDark, uploadProgress = 0, error = null,
}) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : themeIsDark;
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const progress = Math.min(Math.max(uploadProgress, 0), 100);

  // ⭐ FANITSIA MAJOR : Border Class
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';
  const errorBorderClass = isDark ? 'border-rose-500/30' : 'border-rose-300';
  const hoverBorderClass = isDark ? 'border-indigo-400' : 'border-indigo-300';

  const handleClick = () => { if (uploadingImage || !fileInputRef.current) return; fileInputRef.current.click(); };
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); if (!uploadingImage) setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); if (!uploadingImage) setIsDragging(true); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (uploadingImage || !fileInputRef.current) return;
    const files = e.dataTransfer.files; const file = files[0];
    if (!file.type.startsWith('image/')) return;
    const dataTransfer = new DataTransfer(); dataTransfer.items.add(file);
    fileInputRef.current.files = dataTransfer.files;
    fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
  };

  if (imagePreview && typeof imagePreview === 'string') {
    return (
      <div className="group relative h-full w-full cursor-pointer overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={handleClick}>
        <img src={imagePreview} alt="Aperçu du produit" className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.025]" />
        <div className={`absolute inset-0 bg-black/45 transition-opacity duration-200 ${isHovering ? 'opacity-100' : 'opacity-0'}`} />
        <button type="button" disabled={uploadingImage} aria-label="Supprimer l'image" onClick={e => { e.stopPropagation(); onRemoveImage(); }} className="absolute left-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/55 text-white shadow-sm backdrop-blur-sm transition-all hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"><X size={15} strokeWidth={2} /></button>
        {!uploadingImage && !error && <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/95 px-2.5 py-1.5 text-[12px] font-semibold text-emerald-600 shadow-sm backdrop-blur-sm dark:bg-slate-900/95 dark:text-emerald-400"><CheckCircle2 size={13} strokeWidth={2.2} />Prête</div>}
        {!uploadingImage && <div className={`absolute inset-0 z-10 flex items-center justify-center transition-all duration-200 ${isHovering ? 'opacity-100' : 'pointer-events-none opacity-0'}`}><div className="flex flex-col items-center gap-2 text-white"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/15 backdrop-blur-md"><Camera size={19} strokeWidth={2} /></div><span className="text-[13px] font-medium tracking-tight">Changer la photo</span></div></div>}
        {uploadingImage && <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/65 text-white backdrop-blur-[2px]"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><Loader2 size={20} className="animate-spin" /></div><span className="mt-2 text-[13px] font-semibold">Téléchargement...</span><div className="mt-3 h-1 w-32 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-indigo-400 transition-all duration-200" style={{ width: `${progress}%` }} /></div><span className="mt-1.5 text-[11px] font-medium text-white/70">{progress}%</span></div>}
        {error && !uploadingImage && <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] font-medium shadow-sm backdrop-blur-md" style={{ borderColor: errorBorderClass, background: isDark ? '#1E293B' : '#FFFFFF', color: isDark ? '#F87171' : '#DC2626' }}><AlertCircle size={14} className="shrink-0" /><span className="truncate">{error}</span></div>}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onImageChange} disabled={uploadingImage} className="hidden" />
      </div>
    );
  }

  return (
    <div ref={dropRef} className={`group relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed px-5 text-center transition-all duration-200 ${error ? 'bg-rose-50/40 dark:bg-rose-500/5' : isDragging ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'bg-white hover:bg-slate-50/70 dark:bg-[#0F172A] dark:hover:bg-slate-800/50'}`} style={{ borderColor: error ? errorBorderClass : isDragging ? hoverBorderClass : borderClass }} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} onClick={handleClick}>
      {uploadingImage ? (
        <>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><Loader2 size={20} className="animate-spin" /></div>
          <span className="mt-3 text-[13px] font-semibold text-slate-900 dark:text-slate-100">Téléchargement...</span>
          <div className="mt-3 h-1.5 w-36 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-full rounded-full bg-indigo-500 transition-all duration-200" style={{ width: `${progress}%` }} /></div>
          <span className="mt-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">{progress}%</span>
        </>
      ) : (
        <>
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${error ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : isDragging ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-indigo-500/10 dark:group-hover:text-indigo-400'}`}>{error ? <AlertCircle size={20} strokeWidth={2} /> : isDragging ? <Upload size={20} strokeWidth={2} /> : <ImageIcon size={20} strokeWidth={2} />}</div>
          <p className={`mt-3 text-[14px] font-semibold tracking-tight ${error ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-100'}`}>{error ? error : isDragging ? 'Déposez l’image ici' : 'Ajouter une image'}</p>
          {!error && <><p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">Cliquez ou glissez-déposez</p><p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">PNG, JPG, WEBP ou GIF · 10 MB max.</p></>}
        </>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={onImageChange} disabled={uploadingImage} className="hidden" />
    </div>
  );
};
export default ProduitsImageUpload;