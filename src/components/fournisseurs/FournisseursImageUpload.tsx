// src/components/fournisseurs/FournisseursImageUpload.tsx
import React, { useRef, DragEvent, useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Image as ImageIcon, Upload, Camera, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface FournisseursImageUploadProps {
  imagePreview: string | null;
  uploadingImage: boolean;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isDark?: boolean;
  uploadProgress?: number;
  error?: string | null;
}

const FournisseursImageUpload: React.FC<FournisseursImageUploadProps> = ({
  imagePreview, uploadingImage, onImageChange, onRemoveImage, fileInputRef,
  isDark: isDarkProp, uploadProgress = 0, error = null
}) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : themeIsDark;
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const progress = Math.min(Math.max(uploadProgress, 0), 100);
  const borderClass = isDark ? 'border-white/[0.06]' : 'border-slate-200';
  const borderHoverClass = isDark ? 'border-indigo-400' : 'border-indigo-500';
  const borderErrorClass = isDark ? 'border-rose-500/40' : 'border-rose-300';

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node)) { setIsDragging(false); } };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || uploadingImage) return;
    const input = fileInputRef.current;
    if (!input) return;
    try {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (err) { console.error('[FournisseursImageUpload] Drop error:', err); }
  };
  const handleClick = () => { if (uploadingImage) return; fileInputRef.current?.click(); };
  const accept = 'image/png,image/jpeg,image/jpg,image/gif,image/webp';

  if (imagePreview && typeof imagePreview === 'string') {
    return (
      <div className="absolute inset-0 h-full w-full overflow-hidden rounded-xl">
        <div className={`group relative h-full w-full cursor-pointer overflow-hidden rounded-xl border shadow-sm transition-all duration-200 ${borderClass}`} onMouseEnter={() => setIsHoveringImage(true)} onMouseLeave={() => setIsHoveringImage(false)} onClick={handleClick}>
          <img src={imagePreview} alt="Photo du fournisseur" className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]" loading="lazy" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35 opacity-70" />

          {/* REMOVE */}
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemoveImage(); }} disabled={uploadingImage} aria-label="Supprimer la photo" className="absolute left-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-black/55 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:border-rose-400 hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50">
            <X size={15} strokeWidth={2.2} />
          </button>

          {/* READY */}
          {!uploadingImage && !error && (
            <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/55 px-2.5 py-1.5 text-white shadow-lg backdrop-blur-md">
              <CheckCircle2 size={13} className="text-emerald-400" strokeWidth={2.3} />
              <span className="text-[12px] font-medium">Photo prête</span>
            </div>
          )}

          {/* HOVER CHANGE */}
          <div className={`absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[1px] transition-all duration-200 ${isHoveringImage && !uploadingImage ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
            <div className="flex flex-col items-center gap-2 text-center text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md"><Camera size={20} /></div>
              <span className="text-[13px] font-medium">Changer la photo</span>
            </div>
          </div>

          {/* UPLOADING */}
          {uploadingImage && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/55 backdrop-blur-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white"><Loader2 size={22} className="animate-spin" /></div>
              <div className="w-32">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-indigo-400 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-1.5 text-center text-[12px] font-medium text-white/80">{progress}%</div>
              </div>
            </div>
          )}

          {/* ERROR */}
          {error && !uploadingImage && (
            <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center gap-2 rounded-lg border bg-rose-500/90 px-3 py-2 text-white shadow-lg backdrop-blur-md" style={{ borderColor: borderErrorClass }}>
              <AlertCircle size={14} className="shrink-0" />
              <span className="truncate text-[12px] font-medium">{error}</span>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept={accept} onChange={onImageChange} className="hidden" disabled={uploadingImage} />
      </div>
    );
  }

  return (
    <div ref={dropRef} className={`absolute inset-0 flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border transition-all duration-200 ${isDragging ? 'bg-indigo-50/70 dark:bg-indigo-500/10' : error ? 'bg-rose-50/40 dark:bg-rose-500/5' : 'bg-white hover:bg-slate-50/80 dark:bg-[#0F172A] dark:hover:bg-slate-800/50'}`} style={{ borderColor: isDragging ? borderHoverClass : error ? borderErrorClass : borderClass, borderStyle: isDragging ? 'solid' : error ? 'solid' : 'dashed' }} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} onClick={handleClick}>
      {uploadingImage ? (
        <div className="flex w-full max-w-[180px] flex-col items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><Loader2 size={21} className="animate-spin" /></div>
          <span className="mt-2.5 text-[14px] font-medium text-slate-800 dark:text-slate-200">Téléversement...</span>
          <div className="mt-2 w-full">
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-full rounded-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-1 text-center text-[12px] font-medium text-slate-500 dark:text-slate-400">{progress}%</div>
          </div>
        </div>
      ) : (
        <>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 ${isDragging ? 'scale-105 bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400' : error ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'}`}>
            {isDragging ? <Upload size={21} strokeWidth={2} /> : error ? <AlertCircle size={21} strokeWidth={2} /> : <ImageIcon size={21} strokeWidth={2} />}
          </div>
          <div className="mt-3 text-center">
            {error ? (
              <>
                <p className="text-[14px] font-semibold text-rose-600 dark:text-rose-400">{error}</p>
                <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">Cliquez pour réessayer</p>
              </>
            ) : isDragging ? (
              <>
                <p className="text-[14px] font-semibold text-indigo-600 dark:text-indigo-400">Déposez votre image ici</p>
                <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">Relâchez pour téléverser</p>
              </>
            ) : (
              <>
                <p className="text-[14px] font-medium text-slate-700 dark:text-slate-200"><span className="font-semibold text-indigo-600 dark:text-indigo-400">Cliquez</span> ou glissez-déposez</p>
                <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">PNG, JPG, WEBP ou GIF · Max. 10 MB</p>
              </>
            )}
          </div>
        </>
      )}
      <input ref={fileInputRef} type="file" accept={accept} onChange={onImageChange} className="hidden" disabled={uploadingImage} />
    </div>
  );
};

export default FournisseursImageUpload;