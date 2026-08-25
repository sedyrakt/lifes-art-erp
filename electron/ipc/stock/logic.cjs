// ============================================================
// electron/ipc/stock/logic.cjs
// ⭐ STOCK BUSINESS LOGIC
// ============================================================

const { log, error } = require('./logger.cjs');

// ⭐ Fonction pour mettre à jour le statut du stock
function updateProduitStatutStock(db, produitId) {
  try {
    if (!db) {
      throw new Error('Database indisponible');
    }

    const id = Number(produitId);

    if (!Number.isInteger(id) || id <= 0) {
      return false;
    }

    const produit = db.prepare(`
      SELECT
        id,
        quantite_stock,
        quantite_minimale,
        status,
        statut_stock
      FROM produits
      WHERE id = ?
      LIMIT 1
    `).get(id);

    if (!produit) {
      return false;
    }

    const stock = Number(produit.quantite_stock || 0);
    const minimum = Number(produit.quantite_minimale || 0);

    let statutStock = 'disponible';

    if (stock <= 0) {
      statutStock = 'rupture';
    } else if (stock <= minimum) {
      statutStock = 'alerte';
    }

    const stmt = db.prepare(`
      UPDATE produits
      SET
        statut_stock = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(statutStock, id);

    log(
      `📊 [stock] Produit ${id}: statut_stock=${statutStock}`
    );

    return true;
  } catch (err) {
    error(
      '❌ [stock/logic] updateProduitStatutStock:',
      err.message
    );

    return false;
  }
}

// ⭐ Fonction pour créer une entrée de stock (Achats)
function createEntree(db, data = {}) {
  try {
    if (!db) {
      throw new Error('Database indisponible');
    }

    const produitId = Number(data.produit_id);
    const quantite = Number(data.quantite);

    if (!produitId || !quantite || quantite <= 0) {
      return { success: false, error: 'Produit et quantité invalides' };
    }

    const produit = db.prepare('SELECT * FROM produits WHERE id = ?').get(produitId);
    if (!produit) {
      return { success: false, error: 'Produit non trouvé' };
    }

    const ancienStock = Number(produit.quantite_stock || 0);
    const nouveauStock = ancienStock + quantite;

    // Insérer l'entrée (mampiasa ny table entrees_stock efa misy)
    db.prepare(`
      INSERT INTO entrees_stock (produit_id, quantite, prix_unitaire, reference, fournisseur_id, observation, date_entree)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(produitId, quantite, data.prix_unitaire || 0, data.reference || '', data.fournisseur_id || null, data.observation || '');

    // Mettre à jour le stock
    db.prepare('UPDATE produits SET quantite_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(nouveauStock, produitId);

    // Mettre à jour le statut
    updateProduitStatutStock(db, produitId);

    // Insérer le mouvement (mampiasa ny table mouvements_stock efa misy)
    db.prepare(`
      INSERT INTO mouvements_stock (produit_id, type_mouvement, quantite, ancien_stock, nouveau_stock, reference, observation, date_mouvement)
      VALUES (?, 'ENTREE', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(produitId, quantite, ancienStock, nouveauStock, data.reference || '', data.observation || `Entrée de stock`);

    log(`✅ [stock/logic] Entrée créée pour le produit ${produitId}: +${quantite}`);
    return { success: true, data: { produitId, quantite, ancienStock, nouveauStock } };
  } catch (err) {
    error('❌ [stock/logic] createEntree:', err.message);
    return { success: false, error: err.message };
  }
}

// ⭐ Fonction pour créer une sortie de stock (Ventes)
function createSortie(db, data = {}) {
  try {
    if (!db) {
      throw new Error('Database indisponible');
    }

    const produitId = Number(data.produit_id);
    const quantite = Number(data.quantite);

    if (!produitId || !quantite || quantite <= 0) {
      return { success: false, error: 'Produit et quantité invalides' };
    }

    const produit = db.prepare('SELECT * FROM produits WHERE id = ?').get(produitId);
    if (!produit) {
      return { success: false, error: 'Produit non trouvé' };
    }

    const ancienStock = Number(produit.quantite_stock || 0);
    if (quantite > ancienStock) {
      return { success: false, error: `Stock insuffisant! Disponible: ${ancienStock}, demandé: ${quantite}` };
    }

    const nouveauStock = ancienStock - quantite;

    // Insérer la sortie (mampiasa ny table sorties_stock efa misy)
    db.prepare(`
      INSERT INTO sorties_stock (produit_id, quantite, prix_unitaire, reference, destination, observation, date_sortie)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(produitId, quantite, data.prix_unitaire || 0, data.reference || '', data.destination || '', data.observation || '');

    // Mettre à jour le stock
    db.prepare('UPDATE produits SET quantite_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(nouveauStock, produitId);

    // Mettre à jour le statut
    updateProduitStatutStock(db, produitId);

    // Insérer le mouvement (mampiasa ny table mouvements_stock efa misy)
    db.prepare(`
      INSERT INTO mouvements_stock (produit_id, type_mouvement, quantite, ancien_stock, nouveau_stock, reference, observation, date_mouvement)
      VALUES (?, 'SORTIE', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(produitId, quantite, ancienStock, nouveauStock, data.reference || '', data.observation || `Sortie de stock`);

    log(`✅ [stock/logic] Sortie créée pour le produit ${produitId}: -${quantite}`);
    return { success: true, data: { produitId, quantite, ancienStock, nouveauStock } };
  } catch (err) {
    error('❌ [stock/logic] createSortie:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  updateProduitStatutStock,
  createEntree,
  createSortie,
};