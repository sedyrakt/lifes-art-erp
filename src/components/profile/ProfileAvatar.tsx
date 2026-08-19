// ============================================================
// src/components/profile/ProfileAvatar.tsx - SYNCED FONTS
// ⭐ FIX: Font Size mifanaraka amin'ny Sidebar (14px/15px)
// ============================================================

import React, { useRef, useEffect } from 'react';
import { Camera, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ProfileAvatarProps {
  imagePreview: string | null;
  uploadingImage: boolean;
  firstName: string;
  lastName: string;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
  uploadProgress: number;
  error: string | null;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  imagePreview,
  uploadingImage,
  firstName,
  lastName,
  onImageUpload,
  onImageRemove,
  uploadProgress,
  error,
}) => {
  const { isDark } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || '?';

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  // Manadio ny Object URL rehefa tsy ilaina intsony
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="rounded-xl border overflow-hidden shadow-sm transition-all bg-white dark:bg-[#0F172A] border-gray-200 dark:border-[#334155]">
      <div className="p-5 flex flex-col items-center sm:flex-row sm:items-center gap-5">
        
        {/* AVATAR CIRCLE / PHOTO */}
        <div className="relative group flex-shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 dark:border-[#334155] bg-gray-100 dark:bg-[#1E293B] flex items-center justify-center relative shadow-md">
            {uploadingImage ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            ) : imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-xl font-bold text-gray-400 dark:text-gray-500">{initials}</span>
            )}
          </div>

          {/* Hover Upload Button */}
          <div
            onClick={handleFileClick}
            className="absolute bottom-0 right-0 p-1.5 rounded-full cursor-pointer shadow-lg transition-all hover:scale-105 bg-[#6366F1] hover:bg-[#4F46E5] text-white border-2 border-white dark:border-[#0F172A]"
          >
            <Camera size={16} />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onImageUpload(e.target.files[0]);
              }
            }}
          />
        </div>

        {/* TEXTE & CONTROLE - FONT SIZE UPDATED TO 15px & 14px */}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-[15px] font-bold text-gray-900 dark:text-gray-100">
            {firstName} {lastName}
          </h3>
          <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-0.5">
            {imagePreview ? 'Photo de profil personnalisée' : 'Aucune photo de profil'}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {uploadingImage ? (
              <div className="flex items-center gap-2 text-[14px] font-medium text-indigo-600 dark:text-indigo-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Téléchargement en cours...
              </div>
            ) : (
              <>
                <button
                  onClick={handleFileClick}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[14px] font-bold transition-all bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                >
                  <UploadCloud size={14} />
                  Changer de photo
                </button>
                
                {imagePreview && !uploadingImage && (
                  <button
                    onClick={onImageRemove}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[14px] font-bold transition-all bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/30"
                  >
                    <Trash2 size={14} />
                    Supprimer
                  </button>
                )}
              </>
            )}
          </div>
          {error && <p className="text-[14px] font-medium text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfileAvatar;