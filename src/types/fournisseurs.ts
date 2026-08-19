// src/types/fournisseurs.ts

export interface Fournisseur {
  id: number;
  nom: string;
  contact: string;
  telephone: string;
  email: string;
  adresse: string;
  created_at: string;
}

export interface FournisseursStats {
  total: number;
  avecContact: number;
  avecEmail: number;
  tauxContact: number;
}

export interface FournisseursFilters {
  searchTerm: string;
  sortOption: string;
}

export const SORT_OPTIONS = [
  { value: 'nom', label: 'Nom (A-Z)', direction: 'ASC' },
  { value: 'nom', label: 'Nom (Z-A)', direction: 'DESC' },
  { value: 'created_at', label: 'Plus récent', direction: 'DESC' },
  { value: 'created_at', label: 'Plus ancien', direction: 'ASC' },
] as const;