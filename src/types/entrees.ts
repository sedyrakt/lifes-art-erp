// src/types/entrees.ts

export interface EntreeStock {
  id: number;
  produit_id: number;
  produit_nom?: string;
  produit_code?: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
  reference: string;
  fournisseur_id: number;
  fournisseur_nom?: string;
  date_entree: string;
  observation: string;
  created_at: string;
}

export interface EntreesStats {
  totalEntrees: number;
  totalQuantite: number;
  totalValeur: number;
  nbFournisseurs: number;
}

export interface EntreesFilters {
  searchTerm: string;
  filterFournisseur: string;
  sortOption: string;
}