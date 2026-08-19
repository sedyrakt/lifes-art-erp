import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CompanyInfo {
  id?: number; name: string; image?: string; address: string; phone: string; email: string;
  siret?: string; website?: string; taxId?: string; rcs?: string; vatNumber?: string;
  paymentMethod?: string; paymentTerms?: string;
}

interface CompanyContextType {
  company: CompanyInfo | null; loading: boolean;
  updateCompany: (data: Partial<CompanyInfo>) => Promise<void>;
  getCompany: () => CompanyInfo | null;
  getImageUrl: () => Promise<string | null>;
  clearCompany: () => void; refreshCompany: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);
const STORAGE_KEY = 'tantana_company_info';

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompany = async () => {
      try {
        console.log('💾 [CompanyContext] Chargement depuis localStorage...');
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          console.log('✅ [CompanyContext] Company chargé:', parsed);
          if (parsed.image && typeof parsed.image === 'string') {
            let cleanImage = parsed.image;
            if (cleanImage.startsWith('local-image://')) {
              cleanImage = cleanImage.replace(/^local-image:\/\/\/?/, '');
              const uploadsMatch = cleanImage.match(/uploads\/(.+)$/);
              if (uploadsMatch) cleanImage = uploadsMatch[1];
            }
            if (cleanImage.startsWith('file://')) {
              cleanImage = cleanImage.replace(/^file:\/\/\/?/, '');
              const uploadsMatch = cleanImage.match(/uploads\/(.+)$/);
              if (uploadsMatch) cleanImage = uploadsMatch[1];
            }
            cleanImage = cleanImage.replace(/^\//, '');
            if (!cleanImage.includes('/') && !cleanImage.startsWith('data:image')) cleanImage = `company/${cleanImage}`;
            if (cleanImage !== parsed.image) {
              console.log('🖼️ [CompanyContext] Image nettoyée:', cleanImage);
              parsed.image = cleanImage;
              localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            }
          }
          setCompany(parsed);
        } else {
          console.log('⚠️ [CompanyContext] Aucune company trouvée');
          setCompany(null);
        }
      } catch (error) {
        console.error('❌ [CompanyContext] Erreur chargement:', error);
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };
    loadCompany();
  }, []);

  const updateCompany = async (data: Partial<CompanyInfo>) => {
    try {
      console.log('💾 [CompanyContext] Mise à jour:', data);
      const current = company || { name: '', address: '', phone: '', email: '', image: '', siret: '', website: '', taxId: '', rcs: '', vatNumber: '', paymentMethod: 'Espèces', paymentTerms: 'Sous 30 jours' };
      let imageToSave = data.image !== undefined ? data.image : current.image;
      if (imageToSave && typeof imageToSave === 'string') {
        console.log('🖼️ [CompanyContext] Traitement de l\'image:', imageToSave.substring(0, 50));
        if (imageToSave.startsWith('data:image')) {
          try {
            console.log('🖼️ [CompanyContext] Upload de l\'image base64...');
            const result = await window.api.images.upload(imageToSave, 'company');
            const uploadedPath = result?.success ? result.data : null;
            console.log('🖼️ [CompanyContext] Image uploadée:', uploadedPath);
            if (uploadedPath) {
              if (!uploadedPath.startsWith('company/')) imageToSave = `company/${uploadedPath}`;
              else imageToSave = uploadedPath;
              console.log('🖼️ [CompanyContext] Chemin final:', imageToSave);
            } else throw new Error('Échec upload image');
          } catch (error) {
            console.error('❌ [CompanyContext] Erreur upload:', error);
          }
        }
        if (imageToSave.startsWith('file://')) {
          imageToSave = imageToSave.replace(/^file:\/\/\/?/, '');
          const uploadsMatch = imageToSave.match(/uploads\/(.+)$/);
          if (uploadsMatch) imageToSave = uploadsMatch[1];
        }
        if (imageToSave.startsWith('local-image://')) {
          imageToSave = imageToSave.replace(/^local-image:\/\/\/?/, '');
          const uploadsMatch = imageToSave.match(/uploads\/(.+)$/);
          if (uploadsMatch) imageToSave = uploadsMatch[1];
        }
        imageToSave = imageToSave.replace(/^\//, '');
        if (!imageToSave.includes('/') && !imageToSave.startsWith('data:image')) imageToSave = `company/${imageToSave}`;
        if (imageToSave.startsWith('uploads/')) imageToSave = imageToSave.replace('uploads/', '');
      }
      const updated: CompanyInfo = { ...current, ...data, image: imageToSave || current.image || '' };
      console.log('💾 [CompanyContext] Sauvegarde avec image:', updated.image);
      setCompany(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      console.log('✅ [CompanyContext] Mise à jour réussie');
    } catch (error) {
      console.error('❌ [CompanyContext] Erreur mise à jour:', error);
      throw error;
    }
  };

  const getImageUrl = async (): Promise<string | null> => {
    if (!company?.image) { console.log('🖼️ [CompanyContext] Aucune image à charger'); return null; }
    try {
      console.log('🖼️ [CompanyContext] Récupération URL pour:', company.image);
      const result = await window.api.images.getUrl(company.image);
      const url = result?.success ? result.data : null;
      console.log('🖼️ [CompanyContext] URL obtenue:', url);
      return url;
    } catch (error) {
      console.error('❌ [CompanyContext] Erreur récupération URL:', error);
      return null;
    }
  };

  const refreshCompany = async () => {
    try {
      console.log('🔄 [CompanyContext] Rafraîchissement...');
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { const parsed = JSON.parse(saved); console.log('✅ [CompanyContext] Company rafraîchi:', parsed); setCompany(parsed); }
    } catch (error) { console.error('❌ [CompanyContext] Erreur rafraîchissement:', error); }
  };

  const getCompany = () => company;
  const clearCompany = () => { try { localStorage.removeItem(STORAGE_KEY); setCompany(null); console.log('🗑️ [CompanyContext] Company effacé'); } catch (error) { console.error('❌ [CompanyContext] Erreur effacement:', error); } };

  return (
    <CompanyContext.Provider value={{ company, loading, updateCompany, getCompany, getImageUrl, clearCompany, refreshCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (context === undefined) throw new Error('❌ useCompany doit être utilisé à l\'intérieur de CompanyProvider.\nVérifiez que votre composant est bien entouré par <CompanyProvider>.');
  return context;
};

export default CompanyContext;