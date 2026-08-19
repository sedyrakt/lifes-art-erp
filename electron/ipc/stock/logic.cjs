// ============================================================
// electron/ipc/stock/logic.cjs
// ⭐ STOCK BUSINESS LOGIC
// ============================================================

const { log, error } = require('./logger.cjs');

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

    /*
     * Tsy ovaina ho inactif eto intsony ny status.
     *
     * Antony:
     * `status` = état métier du produit
     * `statut_stock` = état du stock
     *
     * Tsy tokony hifangaro ireo.
     */

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

module.exports = {
  updateProduitStatutStock,
};