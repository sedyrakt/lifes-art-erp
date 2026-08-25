// ============================================================
// src/components/company/CompanySettingsModal/CompanySettingsImage.tsx
// ⭐ PRODUCTION READY - IMAGE UPLOAD
// ============================================================
import React,{useRef,useState} from 'react';
import {Upload,Image as ImageIcon,Trash2,Loader2,RefreshCw,CheckCircle2} from 'lucide-react';

const COLORS={
  light:{
    card:'#FFF',border:'#E2E8F0',inputMuted:'#F8FAFC',text:'#202124',muted:'#5F6368',
    subMuted:'#80868B',primary:'#6366F1',primaryHover:'#185ABC',primarySoft:'#E8F0FE',
    danger:'#D93025',success:'#188038'
  },
  dark:{
    card:'#0F172A',border:'#334155',inputMuted:'#111827',text:'#F8FAFC',muted:'#CBD5E1',
    subMuted:'#94A3B8',primary:'#6366F1',primaryHover:'#A8C7FA',primarySoft:'rgba(138,180,248,.12)',
    danger:'#F28B82',success:'#81C995'
  }
};

interface CompanySettingsImageProps{
  imagePreview:string|null;
  savingImage:boolean;
  isDark:boolean;
  onImageChange:(file:File)=>void;
  onRemoveImage:()=>void;
  onDrop:(e:React.DragEvent<HTMLDivElement>)=>void;
  onDragOver:(e:React.DragEvent<HTMLDivElement>)=>void;
  label?:string;
}

const CompanySettingsImage:React.FC<CompanySettingsImageProps>=({
  imagePreview,savingImage,isDark,onImageChange,onRemoveImage,onDrop,onDragOver,label="Image de l'entreprise"
})=>{
  const theme=isDark?COLORS.dark:COLORS.light;
  const fileInputRef=useRef<HTMLInputElement>(null);
  const [isDragging,setIsDragging]=useState(false);
  const [imageError,setImageError]=useState(false);

  const isValidImage=typeof imagePreview==='string'&&imagePreview.trim().length>0&&!imageError;

  const validateFile=(file:File)=>{
    const allowed=['image/png','image/jpeg','image/jpg','image/webp'];
    if(!allowed.includes(file.type)){
      console.error('❌ Format image non supporté:',file.type);
      return false;
    }
    if(file.size>5*1024*1024){
      console.error('❌ Image trop volumineuse:',file.size);
      return false;
    }
    return true;
  };

  const handleFileChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];
    if(!file)return;
    if(!validateFile(file)){
      if(fileInputRef.current)fileInputRef.current.value='';
      return;
    }
    setImageError(false);
    onImageChange(file);
    if(fileInputRef.current)fileInputRef.current.value='';
  };

  const handleRemove=()=>{
    setImageError(false);
    onRemoveImage();
    if(fileInputRef.current)fileInputRef.current.value='';
  };

  const handleDragEnter=(e:React.DragEvent<HTMLDivElement>)=>{
    e.preventDefault();e.stopPropagation();setIsDragging(true);
  };

  const handleDragLeave=(e:React.DragEvent<HTMLDivElement>)=>{
    e.preventDefault();e.stopPropagation();setIsDragging(false);
  };

  const handleDrop=(e:React.DragEvent<HTMLDivElement>)=>{
    e.preventDefault();e.stopPropagation();setIsDragging(false);setImageError(false);onDrop(e);
  };

  const handleReplace=()=>fileInputRef.current?.click();

  const handleImageError=(e:React.SyntheticEvent<HTMLImageElement>)=>{
    console.error('❌ Impossible de charger l’image de l’entreprise');
    setImageError(true);
    e.currentTarget.style.display='none';
  };

  return(
    <div className="mb-4 overflow-hidden rounded-xl border" style={{background:theme.card,borderColor:theme.border}}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3" style={{borderColor:theme.border,background:isDark?'#0F172A':'#F8FAFC'}}>
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{background:theme.primarySoft,color:theme.primary}}>
            <ImageIcon size={16} strokeWidth={2}/>
          </div>
          <div className="min-w-0">
            <div className="text-[14px] font-medium" style={{color:theme.text}}>{label}</div>
            <div className="mt-0.5 text-[12px]" style={{color:theme.subMuted}}>Logo ou image de votre entreprise</div>
          </div>
        </div>
        <span className="hidden shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[12px] font-medium sm:inline-flex dark:bg-slate-800" style={{color:theme.subMuted}}>
          PNG · JPG · WEBP · 5 MB max
        </span>
      </div>

      <div className="p-4">
        {isValidImage?(
          <div className="space-y-3">
            <div className="group relative flex h-[150px] w-full items-center justify-center overflow-hidden rounded-xl border" style={{background:theme.inputMuted,borderColor:theme.border}}>
              <img
                src={imagePreview}
                alt="Image entreprise"
                className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
                onError={handleImageError}
              />

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/45 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                <button type="button" onClick={handleReplace} disabled={savingImage} className="inline-flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-[14px] font-medium text-slate-700 shadow-lg transition-all hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
                  <RefreshCw size={14}/> Remplacer
                </button>
                <button type="button" onClick={handleRemove} disabled={savingImage} className="inline-flex h-9 items-center gap-2 rounded-lg bg-rose-600 px-3 text-[14px] font-medium text-white shadow-lg transition-all hover:bg-rose-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
                  <Trash2 size={14}/> Supprimer
                </button>
              </div>

              {savingImage&&(
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 backdrop-blur-sm dark:bg-slate-950/85">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10">
                    <Loader2 size={18} className="animate-spin text-indigo-600 dark:text-indigo-400"/>
                  </div>
                  <span className="text-[14px] font-medium" style={{color:theme.muted}}>Téléchargement en cours...</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0" style={{color:theme.success}}/>
                <span className="text-[14px] font-medium" style={{color:theme.muted}}>Image sélectionnée</span>
              </div>
              <button type="button" onClick={handleReplace} disabled={savingImage} className="text-[14px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50" style={{color:theme.primary}} onMouseEnter={e=>e.currentTarget.style.color=theme.primaryHover} onMouseLeave={e=>e.currentTarget.style.color=theme.primary}>
                Modifier
              </button>
            </div>

            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleFileChange} className="hidden"/>
          </div>
        ):(
          <div
            onDrop={handleDrop}
            onDragOver={onDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onClick={()=>fileInputRef.current?.click()}
            className={`group flex min-h-[170px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-6 text-center transition-all duration-200 ${isDragging?'border-indigo-500 bg-indigo-50/70 dark:border-indigo-400 dark:bg-indigo-500/10':'hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:border-indigo-500/60 dark:hover:bg-indigo-500/5'}`}
            style={{borderColor:isDragging?undefined:(isDark?'#334155':'#CBD5E1')}}
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-105" style={{background:theme.primarySoft,color:theme.primary}}>
              <Upload size={20} strokeWidth={2}/>
            </div>

            <p className="text-[14px] font-medium" style={{color:theme.text}}>
              {isDragging?'Déposez votre image ici':'Cliquez pour choisir une image'}
            </p>
            <p className="mt-1 text-[12px]" style={{color:theme.subMuted}}>
              ou glissez-déposez votre fichier ici
            </p>
            <div className="mt-3 rounded-md bg-slate-100 px-2.5 py-1 text-[12px] font-medium dark:bg-slate-800" style={{color:theme.subMuted}}>
              PNG, JPG ou WEBP · 5 MB maximum
            </div>

            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleFileChange} className="hidden"/>
          </div>
        )}

        <div className="mt-3 flex items-start gap-2">
          <ImageIcon size={13} className="mt-0.5 shrink-0" style={{color:theme.subMuted}}/>
          <p className="text-[12px] leading-relaxed" style={{color:theme.subMuted}}>
            Utilisez une image de bonne qualité avec un fond transparent si vous souhaitez l'utiliser comme logo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanySettingsImage;