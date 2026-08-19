// ============================================================
// electron/ipc/orders/validation.cjs
// ⭐ 20M READY
// ============================================================
'use strict';
const ORDER_STATUS = Object.freeze({ PENDING: 'En attente', CONFIRMED: 'Confirmée', DELIVERED: 'Livrée', CANCELLED: 'Annulée' });
const VALID_STATUSES = Object.freeze(Object.values(ORDER_STATUS));

function normalizeStatus(statut) {
  if (!statut) return ORDER_STATUS.PENDING;
  const value = String(statut).trim();
  const map = { 'En attente': ORDER_STATUS.PENDING, pending: ORDER_STATUS.PENDING, 'Confirmée': ORDER_STATUS.CONFIRMED, confirmed: ORDER_STATUS.CONFIRMED, 'Livrée': ORDER_STATUS.DELIVERED, delivered: ORDER_STATUS.DELIVERED, 'Annulée': ORDER_STATUS.CANCELLED, cancelled: ORDER_STATUS.CANCELLED };
  return map[value] || null;
}

function validateOrder(data = {}) {
  const errors = [];
  const clientNom = typeof data.client_nom === 'string' ? data.client_nom.trim() : '';
  if (!clientNom) errors.push('Le nom du client est obligatoire');
  if (!Array.isArray(data.products) || data.products.length === 0) errors.push('Au moins un produit est requis');
  const totalHT = Number(data.total_ht ?? 0);
  const totalTTC = Number(data.total_ttc ?? 0);
  if (!Number.isFinite(totalHT) || totalHT < 0) errors.push('Le total HT doit être un nombre positif');
  if (!Number.isFinite(totalTTC) || totalTTC < 0) errors.push('Le total TTC doit être un nombre positif');
  const statut = normalizeStatus(data.statut);
  if (!statut) errors.push(`Statut invalide: ${data.statut}`);
  const products = Array.isArray(data.products) ? data.products.map(item => ({ id: Number(item.id), name: String(item.name || ''), price: Number(item.price), quantity: Number(item.quantity) })) : [];
  for (const item of products) {
    if (!Number.isInteger(item.id) || item.id <= 0) errors.push('Produit invalide');
    if (!Number.isFinite(item.price) || item.price < 0) errors.push(`Prix invalide pour le produit ${item.id}`);
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) errors.push(`Quantité invalide pour le produit ${item.id}`);
  }
  return { valid: errors.length === 0, errors, data: { client_nom: clientNom, client_id: data.client_id ? Number(data.client_id) : null, products, total_ht: totalHT, total_ttc: totalTTC, statut } };
}

module.exports = { ORDER_STATUS, VALID_STATUSES, normalizeStatus, validateOrder };