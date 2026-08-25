// ============================================================
// src/components/company/CompanySettingsModal/hooks/useCompanySettings.ts
// ⭐ FIX: Nampiana fanamarinana mba tsy hiverina erreur rehefa vita ny génération
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { CompanyData } from '../types';
import { useCompany } from '../../../../contexts/CompanyContext';

const cleanText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/[''']/g, "'")
    .replace(/[«»"]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[éèêë]/g, 'e')
    .replace(/[àâä]/g, 'a')
    .replace(/[ôö]/g, 'o')
    .replace(/[ûü]/g, 'u')
    .replace(/[îï]/g, 'i')
    .replace(/[ç]/g, 'c')
    .normalize('NFKC')
    .trim();
};

export const useCompanySettings = (
  initialData?: CompanyData,
  onSave?: (data: CompanyData) => void,
  onGenerate?: (data: CompanyData) => Promise<{ canceled?: boolean; success?: boolean; error?: string; filePath?: string }>
) => {
  const { company, updateCompany } = useCompany();
  
  const [formData, setFormData] = useState<CompanyData>({
    name: cleanText(initialData?.name || company?.name || ''),
    address: cleanText(initialData?.address || company?.address || ''),
    phone: cleanText(initialData?.phone || company?.phone || ''),
    email: cleanText(initialData?.email || company?.email || ''),
    logo: initialData?.logo || company?.logo || '',
    image: initialData?.image || company?.image || '',
    siret: cleanText(initialData?.siret || company?.siret || ''),
    website: cleanText(initialData?.website || company?.website || ''),
    taxId: cleanText(initialData?.taxId || company?.taxId || ''),
    rcs: cleanText(initialData?.rcs || company?.rcs || ''),
    vatNumber: cleanText(initialData?.vatNumber || company?.vatNumber || ''),
    paymentMethod: cleanText(initialData?.paymentMethod || company?.paymentMethod || 'Espèces'),
    paymentTerms: cleanText(initialData?.paymentTerms || company?.paymentTerms || 'Sous 30 jours')
  });
  
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageId, setImageId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingImage, setSavingImage] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const clearMessages = useCallback(() => {
    setSuccessMessage('');
    setErrorMessage('');
  }, []);

  useEffect(() => {
    const load = async () => {
      if (initialData) {
        setFormData({
          name: cleanText(initialData.name || ''),
          address: cleanText(initialData.address || ''),
          phone: cleanText(initialData.phone || ''),
          email: cleanText(initialData.email || ''),
          logo: initialData.logo || '',
          image: initialData.image || '',
          siret: cleanText(initialData.siret || ''),
          website: cleanText(initialData.website || ''),
          taxId: cleanText(initialData.taxId || ''),
          rcs: cleanText(initialData.rcs || ''),
          vatNumber: cleanText(initialData.vatNumber || ''),
          paymentMethod: cleanText(initialData.paymentMethod || 'Espèces'),
          paymentTerms: cleanText(initialData.paymentTerms || 'Sous 30 jours')
        });
        
        if (initialData.image) {
          setImageId(initialData.image);
          if (initialData.image.startsWith('data:image')) {
            setImagePreview(initialData.image);
          } else {
            setImagePreview('');
          }
        }
      }
    };
    load();
  }, [initialData]);

  useEffect(() => {
    const load = async () => {
      if (company?.image && !imageId) {
        setImageId(company.image);
        setFormData(prev => ({ ...prev, image: company.image || '' }));
      }
    };
    load();
  }, [company, imageId]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const cleanedValue = cleanText(value);
    setFormData(prev => ({ ...prev, [name]: cleanedValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (successMessage || errorMessage) clearMessages();
  }, [errors, successMessage, errorMessage, clearMessages]);

  const handleImageChange = useCallback(async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("L'image ne doit pas dépasser 5MB");
      return;
    }
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Veuillez sélectionner une image valide');
      return;
    }

    try {
      setSavingImage(true);
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = (event) => {
          if (event.target?.result) {
            resolve(event.target.result as string);
          } else {
            reject(new Error('Erreur de lecture'));
          }
        };
        reader.onerror = () => reject(new Error('Erreur de lecture'));
        reader.readAsDataURL(file);
      });
      
      const uploadResult = await window.api.images.upload(base64Data, 'company');
      if (!uploadResult?.success) {
        throw new Error(uploadResult?.error || 'Échec upload');
      }
      const uploadedPath = uploadResult.data;
      const urlResult = await window.api.images.getUrl(uploadedPath);
      const url = urlResult?.success ? urlResult.data : null;
      
      if (isMounted.current) {
        setImagePreview(url || '');
        setImageId(uploadedPath);
        setFormData(prev => ({ ...prev, image: uploadedPath }));
        setSuccessMessage('✅ Image sauvegardée avec succès');
      }
    } catch (error: any) {
      console.error('❌ Erreur upload image:', error);
      setErrorMessage(`Erreur: ${error.message}`);
    } finally {
      if (isMounted.current) {
        setSavingImage(false);
      }
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImagePreview('');
    setImageId('');
    setFormData(prev => ({ ...prev, image: '' }));
    setSuccessMessage('Image supprimée');
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleImageChange(file);
    }
  }, [handleImageChange]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.address.trim()) newErrors.address = "L'adresse est requise";
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSaveOnly = useCallback(async () => {
    if (!validate()) {
      setErrorMessage('Veuillez corriger les erreurs');
      return;
    }
    setLoading(true);
    try {
      const dataToSave: CompanyData = {
        ...formData,
        image: imageId || formData.image || ''
      };
      if (onSave) {
        onSave(dataToSave);
      } else {
        await updateCompany(dataToSave);
        setSuccessMessage("Informations de l'entreprise mises à jour");
      }
      return dataToSave;
    } catch (error: any) {
      setErrorMessage(`Erreur: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [formData, imageId, validate, onSave, updateCompany]);

  // ⭐ FIX: Nampiana fanamarinana mba tsy hiverina erreur rehefa vita ny génération
  const handleGenerate = useCallback(async () => {
    console.log('🔄 useCompanySettings: handleGenerate appelé');
    
    if (!validate()) {
      console.error('❌ Validation échouée');
      return { error: 'Veuillez corriger les erreurs' };
    }
    
    setLoading(true);
    try {
      const dataToSave: CompanyData = {
        ...formData,
        image: imageId || formData.image || ''
      };
      
      // Enregistrer les données de l'entreprise
      if (onSave) {
        onSave(dataToSave);
      } else {
        await updateCompany(dataToSave);
      }
      
      // Générer la facture
      let generateResult: any = null;
      if (onGenerate) {
        console.log('🔄 Appel de onGenerate...');
        generateResult = await onGenerate(dataToSave);
        console.log('📄 Résultat de onGenerate:', generateResult);
      }

      // ⭐ FIX: Vérifier si la génération a réussi
      if (generateResult && generateResult.canceled) {
        console.log('📄 Génération annulée par l\'utilisateur');
        return { canceled: true };
      }
      
      // ⭐ FIX: Si onGenerate n'a pas été appelé ou a réussi sans erreur
      if (!onGenerate) {
        console.log('✅ Pas de onGenerate, retour success');
        return { success: true };
      }
      
      // ⭐ FIX: Vérifier si la génération a réussi
      if (generateResult && generateResult.success) {
        console.log('✅ Génération réussie');
        return { success: true, filePath: generateResult.filePath };
      }
      
      // ⭐ FIX: Si generateResult est undefined mais onGenerate existe, considérer comme réussi
      if (generateResult === undefined) {
        console.log('✅ onGenerate a retourné undefined, considéré comme réussi');
        return { success: true };
      }
      
      // ⭐ Erreur si generateResult n'est pas success
      console.error('❌ Erreur lors de la génération:', generateResult?.error || 'Erreur inconnue');
      return { error: generateResult?.error || 'Erreur lors de la génération de la facture' };
    } catch (error: any) {
      console.error('❌ Erreur inattendue lors de la génération:', error);
      return { error: error.message || 'Erreur lors de la génération de la facture' };
    } finally {
      setLoading(false);
    }
  }, [formData, imageId, validate, onSave, onGenerate, updateCompany]);

  return {
    formData,
    imagePreview,
    imageId,
    loading,
    errors,
    savingImage,
    successMessage,
    errorMessage,
    clearMessages,
    handleChange,
    handleImageChange,
    handleRemoveImage,
    handleDrop,
    handleDragOver,
    handleSaveOnly,
    handleGenerate
  };
};