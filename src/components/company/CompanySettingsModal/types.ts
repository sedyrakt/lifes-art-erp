// src/components/company/CompanySettingsModal/types.ts

export interface CompanyData {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  image?: string;
  siret?: string;
  website?: string;
  taxId?: string;
  rcs?: string;
  vatNumber?: string;
  paymentMethod?: string;
  paymentTerms?: string;
}

export interface CompanySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: CompanyData) => void;
  onGenerate?: (data: CompanyData) => void;
  initialData?: CompanyData;
  isDark?: boolean;
  mode?: 'save' | 'generate';
}

export interface CompanySettingsHeaderProps {
  isGenerateMode: boolean;
  isDark: boolean;
  theme: any;
  onClose: () => void;
}

export interface CompanySettingsImageProps {
  imagePreview: string;
  savingImage: boolean;
  isDark: boolean;
  theme: any;
  onImageChange: (file: File) => Promise<void>;
  onRemoveImage: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  label?: string;
}

export interface CompanySettingsFormProps {
  formData: CompanyData;
  errors: Record<string, string>;
  isDark: boolean;
  theme: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export interface CompanySettingsActionsProps {
  isGenerateMode: boolean;
  loading: boolean;
  savingImage: boolean;
  isDark: boolean;
  theme: any;
  onClose: () => void;
  onSave: () => void;
  onGenerate: () => void;
}