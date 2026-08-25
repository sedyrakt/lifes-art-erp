// ============================================================
// src/types/commandes.ts
// ⭐ TYPES REHETRA HO AN'NY COMMANDES
// ============================================================

export const STATUS = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée'
} as const;

export type StatusType = typeof STATUS[keyof typeof STATUS];

export interface Commande {
  id: number;
  client_nom: string;
  date_commande: string;
  statut: StatusType;
  total_ht: number;
  total_ttc: number;
  total: number;
  created_at: string;
  numero?: string;
  client_telephone?: string;
  client_email?: string;
  observation?: string;
  remise?: number;
  updated_at?: string;
  produits_noms?: string; // ⭐ VAOVAO: Eto no itahirizana ny anaran'ny produit
}

export interface Client {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
}

export interface Produit {
  id: number;
  nom: string;
  code: string;
  prix_vente: number;
  quantite_stock: number;
  unite?: string;
  quantite_minimale: number;
  statut_stock?: string;
}

export interface DetailCommande {
  id: number;
  produit_id: number;
  produit_nom: string;
  produit_code: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
  total_ligne?: number;
}

export interface CommandesStats {
  total: number;
  enAttente: number;
  confirmees: number;
  livrees: number;
  annulees: number;
  totalCA: number;
  totalHT: number;
  moyennePanier: number;
  clientsUniques: number;
}