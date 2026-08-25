// ============================================================
// src/components/company/CompanySettingsModal/CompanySettingsForm.tsx
// ⭐ PRODUCTION READY - COMPACT / UNIFIED DESIGN
// ⭐ FIX: Adjacent JSX elements wrapped
// ============================================================

import React,{useRef,useState}from'react';
import{Building2,MapPin,Phone,Mail,FileText,Shield,Globe,Building,CreditCard,Clock,Hash,Coins,Landmark,Receipt,Smartphone,Upload,Image as ImageIcon,Trash2,Loader2,Check,ChevronDown}from'lucide-react';

const COLORS={
 light:{card:'#FFF',border:'#E2E8F0',input:'#FFF',text:'#202124',muted:'#5F6368',subMuted:'#80868B',primary:'#6366F1',primarySoft:'#E8F0FE',danger:'#D93025'},
 dark:{card:'#0F172A',border:'#334155',input:'#0F172A',text:'#F8FAFC',muted:'#CBD5E1',subMuted:'#94A3B8',primary:'#6366F1',primarySoft:'rgba(138,180,248,.12)',danger:'#F28B82'}
};

const inputBase='w-full h-10 px-3 rounded-lg border text-[14px] font-medium outline-none transition-all duration-150 focus:ring-2';

interface CompanySettingsFormProps{
 formData:any;
 errors:Record<string,string>;
 isDark:boolean;
 onChange:(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>)=>void;
 imagePreview:string|null;
 savingImage:boolean;
 onImageChange:(file:File)=>void;
 onRemoveImage:()=>void;
 onDrop:(e:React.DragEvent<HTMLDivElement>)=>void;
 onDragOver:(e:React.DragEvent<HTMLDivElement>)=>void;
}

interface FormFieldProps{
 label:string;
 children:React.ReactNode;
 icon?:React.ReactNode;
 required?:boolean;
 className?:string;
 isDark:boolean;
 style?:React.CSSProperties;
}

const FormField:React.FC<FormFieldProps>=({label,children,icon,required,className='',isDark,style})=>{
 const theme=isDark?COLORS.dark:COLORS.light;
 return(
  <div className={`flex flex-col gap-1.5 ${className}`} style={style}>
   <label className="flex items-center gap-1.5 text-[14px] font-medium" style={{color:theme.muted}}>
    {icon&&<span style={{color:theme.subMuted}}>{icon}</span>}
    <span>{label}{required&&<span className="ml-1" style={{color:theme.danger}}>*</span>}</span>
   </label>
   {children}
  </div>
 );
};

const CompanySettingsForm:React.FC<CompanySettingsFormProps>=({
 formData,errors,isDark,onChange,imagePreview,savingImage,onImageChange,onRemoveImage,onDrop,onDragOver
})=>{
 const theme=isDark?COLORS.dark:COLORS.light;
 const fileInputRef=useRef<HTMLInputElement>(null);
 const[isPaymentMethodOpen,setIsPaymentMethodOpen]=useState(false);

 const paymentMethods=[
  {value:'Espèces',icon:Coins,label:'Espèces'},
  {value:'Virement',icon:Landmark,label:'Virement bancaire'},
  {value:'Chèque',icon:Receipt,label:'Chèque'},
  {value:'Mobile Money',icon:Smartphone,label:'Mobile Money'},
  {value:'Carte',icon:CreditCard,label:'Carte bancaire'},
  {value:'Orange Money',icon:Smartphone,label:'Orange Money'},
  {value:'MVola',icon:Smartphone,label:'MVola'}
 ];

 const selectedPayment=paymentMethods.find(m=>m.value===formData.paymentMethod);
 const SelectedPaymentIcon=selectedPayment?.icon;

 const selectPaymentMethod=(value:string)=>{
  onChange({target:{name:'paymentMethod',value}} as React.ChangeEvent<HTMLInputElement>);
  setIsPaymentMethodOpen(false);
 };

 const handleFileChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
  const file=e.target.files?.[0];
  if(!file)return;
  onImageChange(file);
  if(fileInputRef.current)fileInputRef.current.value='';
 };

 const inputClass=(field?:string)=>`${inputBase} ${
  isDark
   ?'border-slate-700 bg-[#0F172A] text-slate-100 placeholder:text-slate-600 focus:border-[#8AB4F8] focus:ring-[#8AB4F8]/15'
   :'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#6366F1] focus:ring-[#6366F1]/15'
 } ${errors[field||'']?'border-red-500 focus:border-red-500':''}`;

 const inputStyle={background:theme.input,color:theme.text};
 const isValidImage=Boolean(imagePreview?.trim());

 return(
  <div className="flex flex-col gap-5 lg:flex-row">
   <aside className="w-full shrink-0 lg:w-[220px]">
    <div className="overflow-hidden rounded-xl border" style={{background:theme.card,borderColor:theme.border}}>
     <div className="border-b px-4 py-3" style={{borderColor:theme.border,background:isDark?'#0F172A':'#F8FAFC'}}>
      <div className="text-[14px] font-medium" style={{color:theme.text}}>Logo entreprise</div>
      <div className="mt-0.5 text-[12px]" style={{color:theme.subMuted}}>PNG, JPG ou WEBP · 5 MB max.</div>
     </div>

     <div className="p-3">
      {isValidImage?(
       <div className="group relative flex h-[145px] items-center justify-center overflow-hidden rounded-lg border" style={{background:theme.input,borderColor:theme.border}}>
        <img src={imagePreview!} alt="Logo entreprise" className="h-full w-full object-contain p-4"/>
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/55 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
         <label className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg transition-transform hover:scale-105" title="Changer l'image">
          <Upload size={16}/>
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleFileChange} className="hidden"/>
         </label>
         <button type="button" onClick={onRemoveImage} disabled={savingImage} className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-600 text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-50" title="Supprimer">
          <Trash2 size={16}/>
         </button>
        </div>
        {savingImage&&(
         <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 backdrop-blur-sm dark:bg-slate-950/85">
          <Loader2 size={20} className="animate-spin text-indigo-600 dark:text-indigo-400"/>
          <span className="text-[12px] font-medium" style={{color:theme.muted}}>Sauvegarde...</span>
         </div>
        )}
       </div>
      ):(
       <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={()=>fileInputRef.current?.click()}
        className="group flex h-[145px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/5"
        style={{borderColor:theme.border,background:isDark?'rgba(255,255,255,.015)':'#FAFAFA'}}
       >
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-105" style={{background:theme.primarySoft,color:theme.primary}}>
         <ImageIcon size={20}/>
        </div>
        <div className="text-[14px] font-medium" style={{color:theme.text}}>Ajouter un logo</div>
        <div className="mt-0.5 text-[12px]" style={{color:theme.subMuted}}>Cliquez ou glissez-déposez</div>
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleFileChange} className="hidden"/>
       </div>
      )}
     </div>
    </div>
   </aside>

   <section className="min-w-0 flex-1 overflow-hidden rounded-xl border" style={{background:theme.card,borderColor:theme.border}}>
    <div className="flex items-center gap-3 border-b px-5 py-3.5" style={{borderColor:theme.border,background:isDark?'#0F172A':'#F8FAFC'}}>
     <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{background:theme.primarySoft,color:theme.primary}}>
      <Building2 size={17}/>
     </div>
     <div>
      <h3 className="text-[14px] font-semibold" style={{color:theme.text}}>Informations de l'entreprise</h3>
      <p className="text-[12px]" style={{color:theme.subMuted}}>Coordonnées et informations administratives</p>
     </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2">
     <FormField label="Nom" required icon={<Building2 size={14}/>} isDark={isDark} className="border-r border-b px-4 py-3.5" style={{borderColor:theme.border}}>
      <input type="text" name="name" value={formData.name||''} onChange={onChange} placeholder="Nom de l'entreprise" className={inputClass('name')} style={inputStyle}/>
     </FormField>

     <FormField label="Adresse" icon={<MapPin size={14}/>} isDark={isDark} className="border-b px-4 py-3.5" style={{borderColor:theme.border}}>
      <input type="text" name="address" value={formData.address||''} onChange={onChange} placeholder="Adresse de l'entreprise" className={inputClass('address')} style={inputStyle}/>
     </FormField>

     <FormField label="Téléphone" icon={<Phone size={14}/>} isDark={isDark} className="border-r border-b px-4 py-3.5" style={{borderColor:theme.border}}>
      <input type="tel" name="phone" value={formData.phone||''} onChange={onChange} placeholder="+261 34 00 000 00" className={inputClass('phone')} style={inputStyle}/>
     </FormField>

     <FormField label="Email" icon={<Mail size={14}/>} isDark={isDark} className="border-b px-4 py-3.5" style={{borderColor:theme.border}}>
      <input type="email" name="email" value={formData.email||''} onChange={onChange} placeholder="contact@entreprise.com" className={inputClass('email')} style={inputStyle}/>
     </FormField>

     <FormField label="Site web" icon={<Globe size={14}/>} isDark={isDark} className="sm:col-span-2 border-b px-4 py-3.5" style={{borderColor:theme.border}}>
      <input type="text" name="website" value={formData.website||''} onChange={onChange} placeholder="www.entreprise.com" className={inputClass('website')} style={inputStyle}/>
     </FormField>

     <FormField label="SIRET" icon={<FileText size={14}/>} isDark={isDark} className="border-r border-b px-4 py-3.5" style={{borderColor:theme.border}}>
      <input type="text" name="siret" value={formData.siret||''} onChange={onChange} placeholder="SIRET" className={inputClass('siret')} style={inputStyle}/>
     </FormField>

     <FormField label="NIF / STAT" icon={<Hash size={14}/>} isDark={isDark} className="border-b px-4 py-3.5" style={{borderColor:theme.border}}>
      <input type="text" name="taxId" value={formData.taxId||''} onChange={onChange} placeholder="NIF / STAT" className={inputClass('taxId')} style={inputStyle}/>
     </FormField>

     <FormField label="RCS" icon={<Building size={14}/>} isDark={isDark} className="border-r border-b px-4 py-3.5" style={{borderColor:theme.border}}>
      <input type="text" name="rcs" value={formData.rcs||''} onChange={onChange} placeholder="Numéro RCS" className={inputClass('rcs')} style={inputStyle}/>
     </FormField>

     <FormField label="N° TVA" icon={<Shield size={14}/>} isDark={isDark} className="border-b px-4 py-3.5" style={{borderColor:theme.border}}>
      <input type="text" name="vatNumber" value={formData.vatNumber||''} onChange={onChange} placeholder="N° TVA intracommunautaire" className={inputClass('vatNumber')} style={inputStyle}/>
     </FormField>

     <FormField label="Mode de paiement" icon={<CreditCard size={14}/>} isDark={isDark} className="border-r border-b px-4 py-3.5" style={{borderColor:theme.border}}>
      <div className="relative">
       <button type="button" onClick={()=>setIsPaymentMethodOpen(v=>!v)} className="flex h-10 w-full items-center justify-between rounded-lg border px-3 text-left text-[14px] font-medium outline-none transition-all" style={{background:theme.input,color:theme.text,borderColor:isPaymentMethodOpen?theme.primary:theme.border}}>
        <span className="flex min-w-0 items-center gap-2">
          {SelectedPaymentIcon ? (
            <>
              <SelectedPaymentIcon size={16} style={{color:theme.primary}} />
              <span className="truncate">{selectedPayment?.label||'Espèces'}</span>
            </>
          ) : (
            <span className="truncate">Espèces</span>
          )}
        </span>
        <ChevronDown size={15} className={`shrink-0 transition-transform ${isPaymentMethodOpen?'rotate-180':''}`} style={{color:theme.subMuted}}/>
       </button>

       {isPaymentMethodOpen&&(
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border p-1 shadow-xl" style={{background:isDark?'#0F172A':'#FFF',borderColor:theme.border}}>
         {paymentMethods.map(method=>{
          const Icon=method.icon;
          const selected=formData.paymentMethod===method.value;
          return(
           <button key={method.value} type="button" onClick={()=>selectPaymentMethod(method.value)} className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[14px] transition-colors hover:bg-slate-100 dark:hover:bg-slate-800" style={{color:selected?theme.primary:theme.text,background:selected?theme.primarySoft:'transparent'}}>
            <Icon size={15} style={{color:selected?theme.primary:theme.subMuted}}/>
            <span className="flex-1">{method.label}</span>
            {selected&&<Check size={14} strokeWidth={2.5} style={{color:theme.primary}}/>}
           </button>
          );
         })}
        </div>
       )}
      </div>
     </FormField>

     <FormField label="Conditions de paiement" icon={<Clock size={14}/>} isDark={isDark} className="border-b px-4 py-3.5" style={{borderColor:theme.border}}>
      <div className="relative">
       <select name="paymentTerms" value={formData.paymentTerms||'Sous 30 jours'} onChange={onChange} className="h-10 w-full appearance-none rounded-lg border px-3 pr-9 text-[14px] font-medium outline-none" style={{background:theme.input,color:theme.text,borderColor:theme.border}}>
        <option value="Sous 30 jours">Sous 30 jours</option>
        <option value="Sous 45 jours">Sous 45 jours</option>
        <option value="Sous 60 jours">Sous 60 jours</option>
        <option value="À réception">À réception</option>
        <option value="Comptant">Comptant</option>
        <option value="À 30 jours fin de mois">À 30 jours fin de mois</option>
       </select>
       <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{color:theme.subMuted}}/>
      </div>
     </FormField>
    </div>
   </section>
  </div>
 );
};

export default CompanySettingsForm;