// ============================================================
// src/hooks/useProduitsImage.ts
// ⭐ FANITSARA: Tsy misy toast
// ⭐ FANITSARA: MAX_IMAGE_SIZE = 10MB (mifanaraka amin'ny backend)
// ⭐ FANITSARA: Timer type ho an'ny browser
// ============================================================

import { useState, useCallback, useRef } from 'react';

// ⭐ Mampifanaraka amin'ny backend (10MB)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export const useProduitsImage = (invokeApi: (channel: string, ...args: any[]) => Promise<any>) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [imageUrls, setImageUrls] = useState<Record<number, string | null>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ⭐ Reset ny state ary manafaka ny blob URL
  const resetImageState = useCallback(() => {
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImagePath(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [imagePreview]);

  // ⭐ Maka ny sary URL miaraka amin'ny cache busting
  const loadImageUrl = useCallback(async (produit: { id: number; image: string }) => {
    try {
      if (!produit.image) {
        setImageUrls(prev => ({ ...prev, [produit.id]: null }));
        return;
      }
      const result = await invokeApi('images:get-url', produit.image);
      const url = result?.success ? result.data : (typeof result === 'string' ? result : null);
      if (url) {
        const cacheBustedUrl = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;
        setImageUrls(prev => ({ ...prev, [produit.id]: cacheBustedUrl }));
      } else {
        setImageUrls(prev => ({ ...prev, [produit.id]: null }));
      }
    } catch (_) {
      setImageUrls(prev => ({ ...prev, [produit.id]: null }));
    }
  }, [invokeApi]);

  // ⭐ Fikarakarana ny fandraisana sary vaovao
  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      if (file.size > MAX_IMAGE_SIZE) {
        throw new Error(`L'image ne doit pas dépasser ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`);
      }
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      setImagePreview(base64);
      setImagePath(null);

      const result = await invokeApi('images:upload', base64, 'produits');
      const path = result?.success ? result.data : (typeof result === 'string' ? result : null);
      if (!path) {
        throw new Error('Upload échoué');
      }
      setImagePath(path);
    } catch (error) {
      console.error('❌ Erreur upload image:', error);
      throw error; // Avoaka miakatra mba hisambotra any ambony
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [invokeApi]);

  // ⭐ Fanafoanana ny sary
  const handleRemoveImage = useCallback(async () => {
    if (imagePath) {
      try {
        await invokeApi('images:delete', imagePath);
      } catch (_) {
        // Aza manakana ny fahafoanana raha tsy tafita ny delete
      }
    }
    resetImageState();
  }, [imagePath, resetImageState, invokeApi]);

  // ⭐ Fikarakarana ny hadisoana sary (rehefa tsy mandeha ny image)
  const handleImageError = useCallback((id: number) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  }, []);

  return {
    imagePreview,
    imagePath,
    uploadingImage,
    imageErrors,
    imageUrls,
    fileInputRef,
    resetImageState,
    loadImageUrl,
    handleImageChange,
    handleRemoveImage,
    handleImageError,
    setImageUrls,
    setImageErrors,
  };
};