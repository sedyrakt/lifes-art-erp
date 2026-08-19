'use strict';

const { getDb } = require('../../database/connection.cjs');
const { BrowserWindow } = require('electron');
const { log, error } = require('../../database/utils.cjs');
const { ORDER_STATUS, VALID_STATUSES, normalizeStatus, validateOrder } = require('./validation.cjs');
const { buildOrdersQuery, buildOrdersCountQuery } = require('./queries.cjs');
const { logAudit } = require('./audit.cjs');
const { prepareStatements, getStatements } = require('./statements.cjs');
const { validateLimit } = require('../stock/validation.cjs');

function withDbCheck(fn) {
  return (event, ...args) => {
    const db = getDb();
    if (!db || !db.open) { error('❌ [orders] Database connection is not open'); return { success: false, error: 'Database connection is not open' }; }
    if (!prepareStatements()) return { success: false, error: 'Failed to prepare order statements' };
    const stmts = getStatements(); if (!stmts) return { success: false, error: 'Statements not available' };
    return fn(db, stmts, event, ...args);
  };
}

function emitOrdersChanged(data) { const windows = BrowserWindow.getAllWindows(); if (!windows.length) return; for (const win of windows) { if (!win.isDestroyed()) { try { win.webContents.send('orders:changed', data); } catch (err) { error('❌ orders:changed:', err.message); } } } }
function emitProductsChangedDirect(data) { const windows = BrowserWindow.getAllWindows(); if (!windows.length) return; for (const win of windows) { if (!win.isDestroyed()) { try { win.webContents.send('products:changed', data); } catch (err) { error('❌ products:changed:', err.message); } } } }

function restoreStockForCommande(commandeId, userId = null, reason = 'Restauration commande') {
  const db = getDb(); if (!db) return false; const stmts = getStatements();
  const order = stmts.stmtGetById.get(commandeId); if (!order) throw new Error(`Commande ${commandeId} introuvable`);
  if (order.stock_restaure === 1) return false; const details = stmts.stmtGetDetailsForRestore.all(commandeId);
  if (!details || details.length === 0) return false;
  for (const detail of details) {
    const produit = stmts.stmtCheckStock.get(detail.produit_id); if (!produit) throw new Error(`Produit ${detail.produit_id} introuvable`);
    const ancienStock = Number(produit.quantite_stock); const quantite = Number(detail.quantite); const nouveauStock = ancienStock + quantite;
    const result = stmts.stmtRestoreStock.run(quantite, detail.produit_id); if (result.changes !== 1) throw new Error(`Erreur restauration stock produit ${detail.produit_id}`);
    stmts.stmtInsertMouvementRestore.run(detail.produit_id, quantite, ancienStock, nouveauStock, `REST-${commandeId}`, reason, userId);
  } stmts.stmtMarkStockRestored.run(commandeId); return true;
}

function registerOrdersHandlers(ipcMain) {
  log('📦 [orders.handlers] REGISTRE');
  if (!ipcMain) { error('❌ ipcMain null'); return false; }
  const channels = ['orders:get-all','orders:get-by-id','orders:create','orders:update','orders:delete','orders:get-details','orders:get-by-client','orders:get-by-status','orders:get-by-date-range','orders:get-stats','orders:get-products','orders:update-status','orders:get-with-details','orders:get-total','orders:get-by-number','orders:get-journalieres','orders:bulk-update-status','orders:bulk-delete'];
  for (const ch of channels) { try { ipcMain.removeHandler(ch); } catch (_) {} }

  ipcMain.handle('orders:get-all', withDbCheck((db, stmts, event, options = {}) => {
    try {
      const limit = validateLimit(options.limit, 50); const page = Number(options.page) || 1;
      const { query, params } = buildOrdersQuery({ ...options, limit, page });
      const data = db.prepare(query).all(...params);
      const { query: countQuery, params: countParams } = buildOrdersCountQuery(options);
      const countResult = db.prepare(countQuery).get(...countParams);
      const total = countResult?.total || 0; const totalPages = Math.ceil(total / limit);
      return { success: true, data, pagination: { total, limit, page, totalPages } };
    } catch (err) { error('❌ [orders:get-all]', err.message); return { success: false, error: err.message }; }
  }));

  ipcMain.handle('orders:get-by-id', withDbCheck((db, stmts, event, id) => { try { const data = stmts.stmtGetById.get(id); return { success: true, data }; } catch (err) { error('❌ [orders:get-by-id]', err.message); return { success: false, error: err.message }; } }));
  ipcMain.handle('orders:create', withDbCheck((db, stmts, event, data) => {
    try {
      const validation = validateOrder(data); if (!validation.valid) return { success: false, error: validation.errors.join(', ') };
      const { client_id, client_nom, products, total_ht, total_ttc, statut } = validation.data; const userId = event.sender?.user?.id ?? null;
      const transaction = db.transaction(() => {
        const result = stmts.stmtCreate.run(client_id, client_nom, total_ht, total_ttc, total_ttc, statut);
        const commandeId = Number(result.lastInsertRowid); if (!Number.isInteger(commandeId) || commandeId <= 0) throw new Error('ID commande invalide');
        for (const item of products) {
          const produit = stmts.stmtCheckStock.get(item.id); if (!produit) throw new Error(`Produit ${item.id} introuvable`);
          const quantity = Number(item.quantity); if (!Number.isInteger(quantity) || quantity <= 0) throw new Error(`Quantité invalide pour ${produit.nom}`);
          const ancienStock = Number(produit.quantite_stock); if (ancienStock < quantity) throw new Error(`Stock insuffisant pour ${item.name || produit.nom}`);
          const nouveauStock = ancienStock - quantity;
          stmts.stmtInsertDetail.run(commandeId, item.id, quantity, item.price, item.price * quantity);
          const stockResult = stmts.stmtUpdateStock.run(quantity, item.id, quantity); if (stockResult.changes !== 1) throw new Error(`Conflit stock produit ${item.id}`);
          stmts.stmtInsertMouvement.run(item.id, quantity, ancienStock, nouveauStock, `CMD-${String(commandeId).padStart(6,'0')}`, `Vente ${item.name || produit.nom}`, userId);
        }
        logAudit('create', commandeId, `CMD-${String(commandeId).padStart(6,'0')}`, userId, `Création commande pour ${client_nom}`);
        return commandeId;
      });
      const newId = transaction(); emitOrdersChanged({ type: 'create', id: newId }); emitProductsChangedDirect({ type: 'refresh' });
      return { success: true, data: { id: newId } };
    } catch (err) { error('❌ [orders:create]', err.message); return { success: false, error: err.message }; }
  }));
  ipcMain.handle('orders:update', withDbCheck((db, stmts, event, id, data) => { try { const validation = validateOrder(data); if (!validation.valid) return { success: false, error: validation.errors.join(', ') }; const { client_id, client_nom, total_ht, total_ttc, statut } = validation.data; stmts.stmtUpdate.run(client_id, client_nom, total_ht, total_ttc, total_ttc, statut, id); emitOrdersChanged({ type: 'update', id }); return { success: true }; } catch (err) { error('❌ [orders:update]', err.message); return { success: false, error: err.message }; } }));
  ipcMain.handle('orders:delete', withDbCheck((db, stmts, event, id) => {
    try {
      const order = stmts.stmtGetById.get(id); if (!order) return { success: false, error: 'Commande introuvable' }; const userId = event.sender?.user?.id ?? null;
      const transaction = db.transaction(() => {
        if (order.statut !== ORDER_STATUS.CANCELLED && order.statut !== ORDER_STATUS.DELIVERED) restoreStockForCommande(id, userId, `Suppression commande #${id}`);
        stmts.stmtDeleteDetails.run(id); stmts.stmtDelete.run(id); logAudit('delete', id, `CMD-${String(id).padStart(6,'0')}`, userId, 'Suppression commande');
      });
      transaction(); emitOrdersChanged({ type: 'delete', id }); emitProductsChangedDirect({ type: 'refresh' });
      return { success: true };
    } catch (err) { error('❌ [orders:delete]', err.message); return { success: false, error: err.message }; }
  }));
  ipcMain.handle('orders:get-details', withDbCheck((db, stmts, event, commandeId) => { try { const data = stmts.stmtGetDetails.all(commandeId); return { success: true, data }; } catch (err) { error('❌ [orders:get-details]', err.message); return { success: false, error: err.message }; } }));
  ipcMain.handle('orders:get-by-client', withDbCheck((db, stmts, event, clientId, limit = 50) => { try { const sql = `SELECT * FROM commandes WHERE client_id = ? ORDER BY id DESC LIMIT ?`; const data = db.prepare(sql).all(clientId, limit); return { success: true, data }; } catch (err) { error('❌ [orders:get-by-client]', err.message); return { success: false, error: err.message }; } }));
  ipcMain.handle('orders:get-by-status', withDbCheck((db, stmts, event, status, limit = 50) => { try { const normalized = normalizeStatus(status); const sql = `SELECT * FROM commandes WHERE statut = ? ORDER BY id DESC LIMIT ?`; const data = db.prepare(sql).all(normalized, limit); return { success: true, data }; } catch (err) { error('❌ [orders:get-by-status]', err.message); return { success: false, error: err.message }; } }));
  ipcMain.handle('orders:get-by-date-range', withDbCheck((db, stmts, event, startDate, endDate, limit = 50) => { try { const sql = `SELECT * FROM commandes WHERE date_commande BETWEEN ? AND ? ORDER BY id DESC LIMIT ?`; const data = db.prepare(sql).all(startDate, endDate, limit); return { success: true, data }; } catch (err) { error('❌ [orders:get-by-date-range]', err.message); return { success: false, error: err.message }; } }));
  ipcMain.handle('orders:get-stats', withDbCheck((db, stmts, event) => { try { const data = stmts.stmtGetStats.get(); return { success: true, data }; } catch (err) { error('❌ [orders:get-stats]', err.message); return { success: false, error: err.message }; } }));
  ipcMain.handle('orders:get-products', withDbCheck((db, stmts, event, commandeId) => { try { const data = stmts.stmtGetProducts.all(commandeId); return { success: true, data }; } catch (err) { error('❌ [orders:get-products]', err.message); return { success: false, error: err.message }; } }));
  ipcMain.handle('orders:get-total', withDbCheck((db, stmts, event) => { try { const result = db.prepare(`SELECT COUNT(*) as total, SUM(total_ttc) as ca FROM commandes`).get(); return { success: true, data: { total: result.total || 0, ca: result.ca || 0 } }; } catch (err) { error('❌ [orders:get-total]', err.message); return { success: false, error: err.message }; } }));
  ipcMain.handle('orders:get-by-number', withDbCheck((db, stmts, event, numero) => { try { const id = parseInt(numero.replace('CMD-', ''), 10); if (isNaN(id)) return { success: false, error: 'Numéro de commande invalide' }; const data = stmts.stmtGetById.get(id); return { success: true, data }; } catch (err) { error('❌ [orders:get-by-number]', err.message); return { success: false, error: err.message }; } }));
  ipcMain.handle('orders:get-journalieres', withDbCheck((db, stmts, event, limit = 30) => { try { const sql = `SELECT DATE(date_commande) as jour, COUNT(*) as nb, SUM(total_ttc) as ca FROM commandes GROUP BY DATE(date_commande) ORDER BY jour DESC LIMIT ?`; const data = db.prepare(sql).all(limit); return { success: true, data }; } catch (err) { error('❌ [orders:get-journalieres]', err.message); return { success: false, error: err.message }; } }));
  ipcMain.handle('orders:update-status', withDbCheck((db, stmts, event, id, newStatus) => {
    try {
      const normalized = normalizeStatus(newStatus); if (!normalized) return { success: false, error: 'Statut invalide' };
      const order = stmts.stmtGetById.get(id); if (!order) return { success: false, error: 'Commande introuvable' };
      if (order.statut === normalized) return { success: true, changes: 0 };
      const userId = event.sender?.user?.id ?? null;
      const transaction = db.transaction(() => {
        if (normalized === ORDER_STATUS.CANCELLED && order.statut !== ORDER_STATUS.CANCELLED) restoreStockForCommande(id, userId, `Annulation commande #${id}`);
        const result = stmts.stmtUpdateStatus.run(normalized, id); logAudit('update_status', id, `CMD-${String(id).padStart(6,'0')}`, userId, `${order.statut} → ${normalized}`);
        return result.changes;
      });
      const changes = transaction(); emitOrdersChanged({ type: 'update_status', id, status: normalized });
      if (normalized === ORDER_STATUS.CANCELLED && order.statut !== ORDER_STATUS.CANCELLED) emitProductsChangedDirect({ type: 'refresh' });
      return { success: true, changes };
    } catch (err) { error('❌ [orders:update-status]', err.message); return { success: false, error: err.message }; }
  }));
  ipcMain.handle('orders:bulk-update-status', withDbCheck((db, stmts, event, ids, newStatus) => {
    try {
      if (!Array.isArray(ids) || ids.length === 0) return { success: false, error: 'Liste ID vide' };
      const normalized = normalizeStatus(newStatus); if (!normalized) return { success: false, error: 'Statut invalide' };
      const userId = event.sender?.user?.id ?? null;
      const transaction = db.transaction(() => {
        for (const id of ids) {
          const order = stmts.stmtGetById.get(id); if (!order) continue;
          if (order.statut === normalized) continue;
          if (normalized === ORDER_STATUS.CANCELLED && order.statut !== ORDER_STATUS.CANCELLED) restoreStockForCommande(id, userId, `Annulation en lot #${id}`);
          stmts.stmtUpdateStatus.run(normalized, id);
        }
      });
      transaction(); emitOrdersChanged({ type: 'bulk_update_status', ids, status: normalized });
      if (normalized === ORDER_STATUS.CANCELLED) emitProductsChangedDirect({ type: 'refresh' });
      return { success: true, changes: ids.length };
    } catch (err) { error('❌ [orders:bulk-update-status]', err.message); return { success: false, error: err.message }; }
  }));
  ipcMain.handle('orders:bulk-delete', withDbCheck((db, stmts, event, ids) => {
    try {
      if (!Array.isArray(ids) || ids.length === 0) return { success: false, error: 'Liste ID vide' };
      const userId = event.sender?.user?.id ?? null;
      const transaction = db.transaction(() => {
        for (const id of ids) {
          const order = stmts.stmtGetById.get(id); if (!order) continue;
          if (order.statut !== ORDER_STATUS.CANCELLED && order.statut !== ORDER_STATUS.DELIVERED) restoreStockForCommande(id, userId, `Suppression en lot #${id}`);
          stmts.stmtDeleteDetails.run(id); stmts.stmtDelete.run(id);
        }
      });
      transaction(); emitOrdersChanged({ type: 'bulk_delete', ids }); emitProductsChangedDirect({ type: 'refresh' });
      return { success: true, deleted: ids.length };
    } catch (err) { error('❌ [orders:bulk-delete]', err.message); return { success: false, error: err.message }; }
  }));

  log('✅ [orders.handlers] Enregistrés');
  return true; // ⭐ FIX: Mamerina true
}

module.exports = { registerOrdersHandlers };