import React,{useRef,useState,DragEvent}from'react';
import{Loader2,CheckCircle,AlertCircle,Image as ImageIcon,Upload,Camera,X}from'lucide-react';
import{useTheme}from'../../contexts/ThemeContext';

const THEME={
 light:{border:'#E2E8F0',borderHover:'#6366F1',background:'#FFF',text:'#0F172A',muted:'#64748B',subMuted:'#94A3B8',primary:'#6366F1',primarySoft:'rgba(99,102,241,.08)',success:'#059669',danger:'#DC2626'},
 dark:{border:'#334155',borderHover:'#818CF8',background:'#0F172A',text:'#F8FAFC',muted:'#94A3B8',subMuted:'#64748B',primary:'#818CF8',primarySoft:'rgba(129,140,248,.10)',success:'#34D399',danger:'#F87171'}
};

interface Props{
 imagePreview:string|null;uploadingImage:boolean;
 onImageChange:(e:React.ChangeEvent<HTMLInputElement>)=>void;
 onRemoveImage:()=>void;fileInputRef:React.RefObject<HTMLInputElement>;
 isDark?:boolean;uploadProgress?:number;error?:string|null;initials?:string;
}

const ClientsImageUpload:React.FC<Props>=({
 imagePreview,uploadingImage,onImageChange,onRemoveImage,fileInputRef,
 isDark:isDarkProp,uploadProgress=0,error=null,initials=''
})=>{
 const{isDark:contextDark}=useTheme(),isDark=isDarkProp!==undefined?isDarkProp:contextDark;
 const theme=isDark?THEME.dark:THEME.light;
 const[dragging,setDragging]=useState(false),[hover,setHover]=useState(false);
 const dropRef=useRef<HTMLDivElement>(null);
 const click=()=>{if(!uploadingImage)fileInputRef.current?.click()};
 const enter=(e:DragEvent<HTMLDivElement>)=>{e.preventDefault();e.stopPropagation();if(!uploadingImage)setDragging(true)};
 const leave=(e:DragEvent<HTMLDivElement>)=>{e.preventDefault();e.stopPropagation();setDragging(false)};
 const over=(e:DragEvent<HTMLDivElement>)=>{e.preventDefault();e.stopPropagation();if(!uploadingImage)setDragging(true)};
 const drop=(e:DragEvent<HTMLDivElement>)=>{
  e.preventDefault();e.stopPropagation();setDragging(false);if(uploadingImage)return;
  const file=e.dataTransfer.files?.[0];
  if(!file||!file.type.startsWith('image/'))return;
  const dt=new DataTransfer();dt.items.add(file);
  if(fileInputRef.current){fileInputRef.current.files=dt.files;fileInputRef.current.dispatchEvent(new Event('change',{bubbles:true}))}
 };
 const Input=()=> <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/gif,image/webp" onChange={onImageChange} className="hidden" disabled={uploadingImage}/>;
 const progress=Math.min(Math.max(uploadProgress,0),100);

 if(imagePreview)return <div ref={dropRef} className="group relative h-full w-full cursor-pointer overflow-hidden rounded-xl" style={{border:`1px solid ${dragging?theme.borderHover:theme.border}`,background:theme.background}} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onDragEnter={enter} onDragLeave={leave} onDragOver={over} onDrop={drop} onClick={click}>
  <img src={imagePreview} alt="Aperçu du client" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"/>
  <div className="pointer-events-none absolute inset-0 bg-black/45 opacity-0 transition-opacity group-hover:opacity-100"/>
  <button type="button" onClick={e=>{e.stopPropagation();onRemoveImage()}} disabled={uploadingImage} className="absolute left-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white" title="Supprimer"><X className="h-3.5 w-3.5"/></button>
  {!uploadingImage&&!error&&<div className="absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-md" style={{background:'rgba(255,255,255,.94)',borderColor:theme.border,color:theme.success}}><CheckCircle className="h-3.5 w-3.5"/>Prête</div>}
  <div className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity ${hover?'opacity-100':'opacity-0'}`}><div className="flex flex-col items-center gap-2 text-white"><div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/15"><Camera className="h-5 w-5"/></div><span className="text-[13px] font-medium">Changer la photo</span><span className="text-[11px] text-white/70">Cliquez ou glissez une image</span></div></div>
  {uploadingImage&&<div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/65 text-white backdrop-blur-sm"><Loader2 className="mb-2 h-7 w-7 animate-spin"/><span className="text-[13px] font-semibold">Téléchargement...</span><div className="mt-3 h-1.5 w-32 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-indigo-400 transition-all" style={{width:`${progress}%`}}/></div><span className="mt-1.5 text-[11px] text-white/70">{progress}%</span></div>}
  <Input/>
 </div>;

 return <div ref={dropRef} className="group relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed px-5 text-center transition-all" onDragEnter={enter} onDragLeave={leave} onDragOver={over} onDrop={drop} onClick={click} style={{borderColor:dragging?theme.borderHover:error?theme.danger:theme.border,background:dragging?theme.primarySoft:theme.background,boxShadow:dragging?`0 0 0 3px ${theme.primarySoft}`:'none'}}>
  {!uploadingImage&&!error&&initials&&<div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-10"><div className="flex h-24 w-24 items-center justify-center rounded-full text-4xl font-bold" style={{background:theme.primarySoft,color:theme.primary}}>{initials}</div></div>}
  {uploadingImage?<div className="relative z-10 flex flex-col items-center"><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full" style={{background:theme.primarySoft}}><Loader2 className="h-5 w-5 animate-spin" style={{color:theme.primary}}/></div><span className="text-[13px] font-semibold" style={{color:theme.text}}>Téléchargement...</span><div className="mt-3 h-1.5 w-36 overflow-hidden rounded-full" style={{background:isDark?'#334155':'#E2E8F0'}}><div className="h-full rounded-full bg-indigo-500 transition-all" style={{width:`${progress}%`}}/></div><span className="mt-1.5 text-[11px]" style={{color:theme.subMuted}}>{progress}%</span></div>:<>
   <div className="relative z-10 mb-3 flex h-11 w-11 items-center justify-center rounded-full transition group-hover:scale-105" style={{background:error?(isDark?'rgba(248,113,113,.10)':'#FEF2F2'):dragging?theme.primarySoft:isDark?'#1E293B':'#F1F5F9'}}>{error?<AlertCircle className="h-5 w-5" style={{color:theme.danger}}/>:dragging?<Upload className="h-5 w-5" style={{color:theme.primary}}/>:<ImageIcon className="h-5 w-5" style={{color:theme.muted}}/>}</div>
   <p className="relative z-10 text-[13px] font-semibold" style={{color:error?theme.danger:dragging?theme.primary:theme.text}}>{error|| (dragging?'Déposez l’image ici':'Ajouter une image')}</p>
   {!error&&<><p className="relative z-10 mt-1 text-[12px]" style={{color:theme.subMuted}}>Cliquez ou glissez-déposez</p><p className="relative z-10 mt-1 text-[11px]" style={{color:theme.subMuted}}>PNG, JPG, WEBP ou GIF · 10 MB max.</p></>}
   {dragging&&<div className="relative z-10 mt-3 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">Relâchez pour importer</div>}
  </>}
  <Input/>
 </div>;
};

export default ClientsImageUpload;