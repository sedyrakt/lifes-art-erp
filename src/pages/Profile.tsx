// src/pages/Profile.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { X, LogOut, User, RefreshCw } from 'lucide-react';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import ProfileForm from '../components/profile/ProfileForm';
import ProfileAvatar from '../components/profile/ProfileAvatar';
import ProfilePasswordModal from '../components/profile/ProfilePasswordModal';
import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
}

const Profile: React.FC = () => {
  const { isDark } = useTheme();
  const { user, logout, setSession } = useAuth();
  const navigate = useNavigate();

  // ⭐ USERLOADING: Mba tsy hifangaro amin'ny saving na uploadingImage
  const [userLoading, setUserLoading] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: ''
  });
  const [originalData, setOriginalData] = useState<FormData>(formData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAQrCode, setTwoFAQrCode] = useState('');
  const [twoFASecret, setTwoFASecret] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFAPending, setTwoFAPending] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    details: '',
    autoClose: 4000
  });
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    details: '',
    autoClose: 4000
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMounted = useRef(true);

  // ==========================================================
  // CHARGEMENT DES DONNÉES UTILISATEUR
  // ==========================================================
  const loadUserData = useCallback(async () => {
    if (!user?.id) {
      setUserLoading(false);
      return;
    }
    try {
      const result = await window.api.users.getById(user.id);
      if (result?.success && result.data) {
        const data = result.data;
        const newFormData = {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          companyName: data.companyName || ''
        };
        setFormData(newFormData);
        setOriginalData(newFormData);
        setTwoFAEnabled(!!data.twoFactorEnabled);
        if (data.image) {
          try {
            const urlResult = await window.api.images.getUrl(data.image);
            if (urlResult?.success && urlResult.data) {
              setProfileImage(urlResult.data);
              setImageError(false);
            } else {
              setProfileImage(null);
            }
          } catch (_) {
            setProfileImage(null);
          }
        }
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      setErrorModal({
        isOpen: true,
        title: 'Erreur de chargement',
        message: 'Impossible de charger les informations de votre profil.',
        details: (error as Error).message || 'Erreur inconnue',
        autoClose: 5000
      });
    } finally {
      if (isMounted.current) setUserLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ==========================================================
  // GESTION DU FORMULAIRE
  // ==========================================================
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Nom requis';
    if (!formData.email.trim()) newErrors.email = 'Email requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Email invalide';
    if (!formData.companyName.trim()) newErrors.companyName = "Nom de l'entreprise requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const updatedData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        companyName: formData.companyName.trim()
      };
      const result = await window.api.users.update(user?.id, updatedData);
      if (result?.success) {
        const updatedUser = { ...user, ...updatedData };
        const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
        if (token) setSession(token, updatedUser);
        setOriginalData(updatedData);
        setIsEditing(false);
        setSuccessModal({
          isOpen: true,
          title: 'Profil mis à jour',
          message: 'Vos informations personnelles ont été enregistrées avec succès.',
          details: `Bonjour ${updatedData.firstName}, vos modifications sont maintenant actives.`,
          autoClose: 4000
        });
      } else {
        throw new Error(result?.error || 'Erreur mise à jour');
      }
    } catch (error: any) {
      setErrorModal({
        isOpen: true,
        title: 'Échec de la mise à jour',
        message: 'Une erreur est survenue lors de l\'enregistrement de vos informations.',
        details: error.message || 'Erreur inconnue',
        autoClose: 5000
      });
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // GESTION DE L'IMAGE DE PROFIL
  // ==========================================================
  const handleImageChange = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorModal({
        isOpen: true,
        title: 'Format invalide',
        message: 'Veuillez sélectionner une image valide.',
        details: 'Les formats acceptés sont : JPG, PNG, WEBP, etc.',
        autoClose: 4000
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorModal({
        isOpen: true,
        title: 'Fichier trop volumineux',
        message: "L'image ne doit pas dépasser 5 Mo.",
        details: 'Veuillez compresser votre image avant de la télécharger.',
        autoClose: 4000
      });
      return;
    }
    setUploadingImage(true);
    setImageError(false);
    const localUrl = URL.createObjectURL(file);
    setProfileImage(localUrl);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const uploadResult = await window.api.images.upload(base64, 'utilisateurs');
      if (!uploadResult?.success) throw new Error(uploadResult?.error || 'Upload échoué');
      const imagePath = uploadResult.data;
      const updateResult = await window.api.users.update(user?.id, { image: imagePath });
      if (!updateResult?.success) throw new Error(updateResult?.error || 'Mise à jour échouée');
      const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
      if (token) {
        const updatedUser = { ...user, image: imagePath };
        setSession(token, updatedUser);
      }
      setProfileImage(localUrl);
      setImageError(false);
      setSuccessModal({
        isOpen: true,
        title: 'Photo de profil mise à jour',
        message: 'Votre photo de profil a été modifiée avec succès.',
        details: "L'image sera visible sur toutes les interfaces de l'application.",
        autoClose: 4000
      });
    } catch (error: any) {
      setImageError(true);
      const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
      if (token && user?.image) {
        try {
          const urlResult = await window.api.images.getUrl(user.image);
          if (urlResult?.success && urlResult.data) setProfileImage(urlResult.data);
          else setProfileImage(null);
        } catch (_) {
          setProfileImage(null);
        }
      } else {
        setProfileImage(null);
      }
      setErrorModal({
        isOpen: true,
        title: 'Erreur de téléchargement',
        message: "Nous n'avons pas pu mettre à jour votre photo de profil.",
        details: error.message || 'Erreur inconnue',
        autoClose: 5000
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    setUploadingImage(true);
    try {
      const result = await window.api.users.update(user?.id, { image: null });
      if (!result?.success) throw new Error(result?.error || 'Erreur suppression');
      setProfileImage(null);
      setImageError(false);
      setSuccessModal({
        isOpen: true,
        title: 'Photo supprimée',
        message: 'Votre photo de profil a été supprimée.',
        details: 'Vous pouvez en télécharger une nouvelle à tout moment.',
        autoClose: 4000
      });
      const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
      if (token) {
        const updatedUser = { ...user, image: null };
        setSession(token, updatedUser);
      }
    } catch (error: any) {
      setErrorModal({
        isOpen: true,
        title: 'Erreur de suppression',
        message: 'Impossible de supprimer la photo.',
        details: error.message || 'Erreur inconnue',
        autoClose: 5000
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // ==========================================================
  // GESTION DU MOT DE PASSE (AVEC DÉCONNEXION AUTOMATIQUE)
  // ==========================================================
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setErrorModal({
        isOpen: true,
        title: 'Session expirée',
        message: 'Votre session semble expirée. Veuillez vous reconnecter.',
        details: "Impossible d'identifier l'utilisateur.",
        autoClose: 5000
      });
      return;
    }
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setErrorModal({
        isOpen: true,
        title: 'Champs incomplets',
        message: 'Veuillez remplir tous les champs du formulaire.',
        details: 'Le mot de passe actuel, le nouveau mot de passe et la confirmation sont obligatoires.',
        autoClose: 4000
      });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorModal({
        isOpen: true,
        title: 'Mots de passe différents',
        message: 'Les champs "Nouveau mot de passe" et "Confirmation" ne correspondent pas.',
        details: 'Veuillez les saisir à nouveau avec attention.',
        autoClose: 4000
      });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setErrorModal({
        isOpen: true,
        title: 'Mot de passe trop court',
        message: 'Le mot de passe doit contenir au moins 8 caractères.',
        details: 'Pour plus de sécurité, utilisez des majuscules, minuscules et chiffres.',
        autoClose: 4000
      });
      return;
    }
    setPasswordLoading(true);
    try {
      const result = await window.api.auth.changePassword({
        userId: user.id,
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (result?.success) {
        setSuccessModal({
          isOpen: true,
          title: 'Mot de passe modifié',
          message: 'Votre mot de passe a été changé avec succès.',
          details: 'Vous serez déconnecté pour des raisons de sécurité.',
          autoClose: 4000
        });
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        // ⭐ DÉCONNEXION AUTOMATIQUE APRÈS 1.5 SECONDES
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 1500);
      } else {
        throw new Error(result?.error || 'Erreur modification');
      }
    } catch (error: any) {
      setErrorModal({
        isOpen: true,
        title: 'Échec du changement',
        message: 'Impossible de modifier votre mot de passe.',
        details: error.message || 'Erreur inconnue',
        autoClose: 5000
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // ==========================================================
  // GESTION 2FA
  // ==========================================================
  const handleEnable2FA = async () => {
    setTwoFALoading(true);
    try {
      const result = await window.api.auth.generate2FA(user?.email);
      if (result?.success) {
        setTwoFAQrCode(result.data.qrCode || '');
        setTwoFASecret(result.data.secret || '');
        setTwoFAPending(true);
        setShow2FAModal(true);
      } else {
        throw new Error(result?.error || 'Erreur génération 2FA');
      }
    } catch (error: any) {
      setErrorModal({
        isOpen: true,
        title: 'Erreur 2FA',
        message: "L'activation de la double authentification a échoué.",
        details: error.message || 'Erreur inconnue',
        autoClose: 5000
      });
      setTwoFALoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (twoFACode.length !== 6) {
      setErrorModal({
        isOpen: true,
        title: 'Code invalide',
        message: 'Le code de vérification doit contenir exactement 6 chiffres.',
        details: "Veuillez regarder votre application d'authentification.",
        autoClose: 4000
      });
      return;
    }
    setTwoFALoading(true);
    try {
      const result = await window.api.auth.verify2FA(user?.id, twoFASecret, twoFACode);
      if (result?.success) {
        setTwoFAEnabled(true);
        setShow2FAModal(false);
        setTwoFACode('');
        setTwoFAPending(false);
        setSuccessModal({
          isOpen: true,
          title: '2FA activé',
          message: 'La double authentification est maintenant active sur votre compte.',
          details: 'Votre compte est désormais protégé par une couche de sécurité supplémentaire.',
          autoClose: 4000
        });
      } else {
        throw new Error(result?.error || 'Code invalide');
      }
    } catch (error: any) {
      setErrorModal({
        isOpen: true,
        title: 'Code incorrect',
        message: "Le code 2FA saisi n'est pas valide.",
        details: error.message || 'Veuillez réessayer avec un nouveau code généré par votre application.',
        autoClose: 5000
      });
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir désactiver la double authentification ?')) return;
    setTwoFALoading(true);
    try {
      const result = await window.api.auth.disable2FA(user?.id);
      if (result?.success) {
        setTwoFAEnabled(false);
        setSuccessModal({
          isOpen: true,
          title: '2FA désactivé',
          message: 'La double authentification a bien été désactivée.',
          details: 'Votre compte est maintenant moins sécurisé. Pensez à le réactiver.',
          autoClose: 4000
        });
      } else {
        throw new Error(result?.error || 'Erreur désactivation');
      }
    } catch (error: any) {
      setErrorModal({
        isOpen: true,
        title: 'Erreur de désactivation',
        message: 'Impossible de désactiver la 2FA actuellement.',
        details: error.message || 'Erreur inconnue',
        autoClose: 5000
      });
    } finally {
      setTwoFALoading(false);
    }
  };

  // ==========================================================
  // GESTION DÉCONNEXION
  // ==========================================================
  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  const role = user?.role || 'Utilisateur';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : 'N/A';

  const bgColor = isDark ? '#0A1222' : '#F8FAFC';

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <div
      className="min-h-screen font-sans transition-colors duration-300 p-4"
      style={{ background: bgColor }}
    >
      {/* ⭐ LOADING STATE */}
      {userLoading ? (
        <div className="flex min-h-[360px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw size={30} className="animate-spin text-indigo-500" />
            <span
              className="text-[14px] font-medium"
              style={{ color: isDark ? '#94A3B8' : '#64748B' }}
            >
              Chargement du profil...
            </span>
          </div>
        </div>
      ) : (
        <>
          <ProfileHeader
            role={role}
            isEditing={isEditing}
            saving={saving}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSave={handleSave}
          />
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[30%_1fr] gap-6 px-4 sm:px-6 lg:px-8 pb-8">
            <div>
              <ProfileSidebar
                role={role}
                memberSince={memberSince}
                companyName={formData.companyName}
                twoFAEnabled={twoFAEnabled}
                twoFALoading={twoFALoading}
                onPasswordChange={() => setShowPasswordModal(true)}
                onEnable2FA={handleEnable2FA}
                onDisable2FA={handleDisable2FA}
                onLogout={handleLogoutClick}
              />
            </div>
            <div className="flex flex-col gap-6">
              <ProfileAvatar
                imagePreview={profileImage}
                uploadingImage={uploadingImage}
                firstName={formData.firstName}
                lastName={formData.lastName}
                onImageUpload={handleImageChange}
                onImageRemove={handleRemoveImage}
                uploadProgress={uploadingImage ? 50 : 0}
                error={imageError ? "Erreur de chargement de l'image" : null}
              />
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleImageChange(e.target.files[0]);
                }}
                className="hidden"
              />
              <div className="w-full">
                <ProfileForm
                  formData={formData}
                  onChange={handleFormChange}
                  errors={errors}
                  isEditing={isEditing}
                  onSubmit={(e) => e.preventDefault()}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODALS */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
        details={successModal.details}
        autoCloseDelay={successModal.autoClose}
        isDark={isDark}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        message={errorModal.message}
        details={errorModal.details}
        autoCloseDelay={errorModal.autoClose}
        isDark={isDark}
      />
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="max-w-sm w-full rounded-xl shadow-2xl border overflow-hidden"
            style={{
              background: isDark ? '#0A1222' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0'
            }}
          >
            <div
              className="px-5 py-4 flex items-center justify-between border-b"
              style={{
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0'
              }}
            >
              <h2
                className="text-[15px] font-bold"
                style={{ color: isDark ? '#F3F4F6' : '#111827' }}
              >
                Déconnexion
              </h2>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="p-1 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <p
                className="text-[15px] font-medium leading-tight"
                style={{ color: isDark ? '#E2E8F0' : '#1E293B' }}
              >
                Êtes-vous sûr de vouloir vous déconnecter ?
              </p>
              <p
                className="text-[13px] mt-1.5 leading-relaxed"
                style={{ color: isDark ? '#94A3B8' : '#64748B' }}
              >
                Vous devrez entrer vos identifiants pour vous reconnecter.
              </p>
            </div>
            <div
              className="flex gap-2.5 px-5 py-3 border-t"
              style={{
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0',
                background: isDark ? '#0A1222' : '#F8FAFC'
              }}
            >
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border text-[14px] font-medium transition-colors"
                style={{
                  borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0',
                  color: isDark ? '#CBD5E1' : '#475569'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-2 rounded-lg text-[14px] font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
      <ProfilePasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }}
        onSubmit={handlePasswordSubmit}
        passwordData={passwordData}
        onPasswordDataChange={setPasswordData}
        passwordLoading={passwordLoading}
        isDark={isDark}
      />
    </div>
  );
};

export default Profile;