// src/types/depenses.ts

export interface Depense {
  id: number;
  categorie: string;
  description: string;
  montant: number;
  date_depense: string;
  mode_paiement: string;
  reference: string;
  fournisseur_id: number;
  fournisseur_nom?: string;
  observation: string;
  created_at: string;
}

export interface DepensesStats {
  total: number;
  nb: number;
  moyenne: number;
  parCategorie: Record<string, number>;
  parMois: Record<number, number>;
  parMode: Record<string, number>;
  plusGrande: number;
  plusPetite: number;
  nbFournisseurs: number;
}

export interface DepensesFilters {
  searchTerm: string;
  filterCategorie: string;
  filterDate: string;
  filterMode: string;
  sortOption: string;
}

export const CATEGORIES = ['Achat stock', 'Transport', 'Maintenance', 'Utilités', 'Salaire', 'Marketing', 'Loyer', 'Autre'];
export const MODES_PAIEMENT = ['Espèces', 'Virement', 'Chèque', 'Carte', 'Mobile Money'];