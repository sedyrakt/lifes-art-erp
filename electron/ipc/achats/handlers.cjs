'use strict';

const { getDb } = require('../../database/connection.cjs');
const { log, error, emitAchatsChanged } = require('./utils.cjs');
const { buildAchatsQuery, buildAchatsCountQuery } = require('./queries.cjs');
const { prepareStatements, getStatements } = require('./statements.cjs');
const { validateAchat } = require('./validation.cjs');

function normalizeId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizeIds(ids, max = 50) {
  if (!Array.isArray(ids)) return [];
  return [...new Set(ids.map(normalizeId).filter(Boolean))].slice(0, max);
}

function dbReady() {
  const db = getDb();
  return db && db.open ? db : null;
}

function fail(message, extra = {}) {
  return { success: false, error: message, ...extra };
}

function registerAchatsHandlers(ipcMain) {
  console.log('🛒 [achats.handlers] ENREGISTREMENT');

  if (!ipcMain) {
    console.error('❌ [achats.handlers] ipcMain null');
    return false;
  }

  const channels = [
    'achats:get-all',
    'achats:get-by-id',
    'achats:get-details',
    'achats:create',
    'achats:update',
    'achats:update-status',
    'achats:delete',
    'achats:bulk-delete'
  ];

  for (const channel of channels) {
    try { ipcMain.removeHandler(channel); } catch (_) {}
  }

  if (!prepareStatements()) {
    console.error('❌ [achats.handlers] Impossible de préparer les statements');
    return false;
  }

  // ============================================================
  // GET ALL
  // ============================================================
  try {
    ipcMain.handle('achats:get-all', async (_event, options = {}) => {
      try {
        const db = dbReady();
        if (!db) return fail('Database connection is not open');

        const query = buildAchatsQuery(options);
        const count = buildAchatsCountQuery(options);

        const data = db.prepare(query.query).all(...query.params);
        const totalRow = db.prepare(count.query).get(...count.params);
        const total = Number(totalRow?.total || 0);
        const limit = Number(query.limit || 8);
        const page = Number(query.page || 1);
        const totalPages = Math.max(1, Math.ceil(total / limit));

        return {
          success: true,
          data,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasMore: page < totalPages,
            hasPrevious: page > 1
          }
        };
      } catch (err) {
        error('❌ [achats:get-all]', err.message);
        return fail(err.message);
      }
    });
    console.log('✅ [achats:get-all] enregistré');
  } catch (err) {
    console.error('❌ Impossible enregistrer achats:get-all:', err.message);
  }

  // ============================================================
  // GET BY ID
  // ============================================================
  try {
    ipcMain.handle('achats:get-by-id', async (_event, id) => {
      try {
        const achatId = normalizeId(id);
        if (!achatId) return fail('ID achat invalide');

        const db = dbReady();
        if (!db) return fail('Database connection is not open');

        const stmts = getStatements();
        const achat = stmts.stmtGetById.get(achatId);
        if (!achat) return fail('Achat non trouvé');

        return { success: true, data: achat };
      } catch (err) {
        console.error('❌ [achats:get-by-id]', err.message);
        return fail(err.message);
      }
    });
    console.log('✅ [achats:get-by-id] enregistré');
  } catch (err) {
    console.error('❌ Impossible enregistrer achats:get-by-id:', err.message);
  }

  // ============================================================
  // GET DETAILS
  // ============================================================
  try {
    ipcMain.handle('achats:get-details', async (_event, achatId) => {
      try {
        const id = normalizeId(achatId);
        if (!id) return fail('ID achat invalide');

        const db = dbReady();
        if (!db) return fail('Database connection is not open');

        const stmts = getStatements();
        const achat = stmts.stmtGetById.get(id);
        if (!achat) return fail('Achat non trouvé');

        const details = stmts.stmtGetDetails.all(id);

        return { success: true, data: { achat, details } };
      } catch (err) {
        console.error('❌ [achats:get-details]', err.message);
        return fail(err.message);
      }
    });
    console.log('✅ [achats:get-details] enregistré');
  } catch (err) {
    console.error('❌ Impossible enregistrer achats:get-details:', err.message);
  }

  // ============================================================
  // CREATE (AUTOMATIQUE STOCK + MOUVEMENT + PRIX)
  // ============================================================
  try {
    ipcMain.handle('achats:create', async (_event, data) => {
      try {
        if (!data || typeof data !== 'object') {
          return fail('Données achat manquantes');
        }

        const validation = validateAchat(data);
        if (!validation.valid) {
          return fail(validation.errors.join(', '));
        }

        const db = dbReady();
        if (!db) return fail('Database connection is not open');

        const stmts = getStatements();

        let finalReference = validation.data.reference;
        if (!finalReference || finalReference.trim() === '') {
          const countResult = db.prepare('SELECT COUNT(*) as total FROM achats').get();
          const nextNumber = (countResult?.total || 0) + 1;
          finalReference = `ACH-${String(nextNumber).padStart(4, '0')}`;
        }

        const createStmt = stmts.stmtCreate;
        const params = [];
        const dataMap = {
          fournisseur_id: validation.data.fournisseur_id,
          reference: finalReference,
          date_achat: validation.data.date_achat,
          total_ht: validation.data.total_ht,
          total_ttc: validation.data.total_ttc,
          designation: validation.data.designation,
          nombre_produits: validation.data.nombre_produits,
          statut: 'Livré',
          observation: validation.data.observation
        };

        const source = createStmt.source;
        if (source.includes('fournisseur_id')) params.push(dataMap.fournisseur_id);
        if (source.includes('reference')) params.push(dataMap.reference);
        if (source.includes('date_achat')) params.push(dataMap.date_achat);
        if (source.includes('total_ht')) params.push(dataMap.total_ht);
        if (source.includes('total_ttc')) params.push(dataMap.total_ttc);
        if (source.includes('designation')) params.push(dataMap.designation);
        if (source.includes('nombre_produits')) params.push(dataMap.nombre_produits);
        if (source.includes('statut')) params.push(dataMap.statut);
        if (source.includes('observation')) params.push(dataMap.observation);

        const transaction = db.transaction(() => {
          const result = createStmt.run(...params);

          const achatId = Number(result.lastInsertRowid);
          if (!Number.isInteger(achatId) || achatId <= 0) {
            throw new Error('ID achat invalide');
          }

          if (Array.isArray(validation.data.details) && validation.data.details.length > 0) {
            for (const detail of validation.data.details) {
              const produit = stmts.stmtCheckProduit.get(detail.produit_id);
              if (!produit) {
                throw new Error(`Produit ${detail.produit_id} introuvable`);
              }

              // 1. Mampitombo ny stock
              db.prepare(`UPDATE produits SET quantite_stock = quantite_stock + ? WHERE id = ?`)
                .run(detail.quantite, detail.produit_id);

              // 2. Entrée de stock (miaraka amin'ny prix_unitaire)
              db.prepare(`
                INSERT INTO entrees_stock (produit_id, quantite, prix_unitaire, reference, fournisseur_id, observation)
                VALUES (?, ?, ?, ?, ?, ?)
              `).run(
                detail.produit_id,
                detail.quantite,
                detail.prix_unitaire,
                finalReference,
                validation.data.fournisseur_id,
                `Achat ${finalReference} validé`
              );

              // 3. Mouvement de stock (ENTREE) - ⭐ FIX: Mampiditra prix_unitaire
              try {
                const produitAfter = db.prepare(`SELECT quantite_stock FROM produits WHERE id = ?`).get(detail.produit_id);
                const ancienStock = Number(produitAfter.quantite_stock) - Number(detail.quantite);
                const nouveauStock = Number(produitAfter.quantite_stock);

                db.prepare(`
                  INSERT INTO mouvements_stock (produit_id, type_mouvement, quantite, ancien_stock, nouveau_stock, reference, observation, prix_unitaire)
                  VALUES (?, 'ENTREE', ?, ?, ?, ?, ?, ?)
                `).run(
                  detail.produit_id,
                  detail.quantite,
                  ancienStock,
                  nouveauStock,
                  finalReference,
                  `Entrée de stock - Achat ${finalReference}`,
                  detail.prix_unitaire
                );
              } catch (mvtErr) {
                console.warn('⚠️ Mouvement stock tsy vita:', mvtErr.message);
              }

              // 4. Detail achat
              stmts.stmtInsertDetail.run(
                achatId,
                detail.produit_id,
                detail.quantite,
                detail.prix_unitaire,
                detail.total
              );
            }
          }

          return achatId;
        });

        const newId = transaction();
        emitAchatsChanged({ type: 'create', id: newId });

        return { success: true, data: { id: newId, reference: finalReference } };
      } catch (err) {
        console.error('❌ [achats:create]', err.message);
        return fail(err.message);
      }
    });
    console.log('✅ [achats:create] enregistré');
  } catch (err) {
    console.error('❌ Impossible enregistrer achats:create:', err.message);
  }

  // ============================================================
  // UPDATE (AUTOMATIQUE STOCK + MOUVEMENT + PRIX)
  // ============================================================
  try {
    ipcMain.handle('achats:update', async (_event, id, data) => {
      try {
        const achatId = normalizeId(id);
        if (!achatId) return fail('ID achat invalide');

        if (!data || typeof data !== 'object') {
          return fail('Données achat manquantes');
        }

        const validation = validateAchat(data);
        if (!validation.valid) {
          return fail(validation.errors.join(', '));
        }

        const db = dbReady();
        if (!db) return fail('Database connection is not open');

        const stmts = getStatements();
        const existing = stmts.stmtGetById.get(achatId);
        if (!existing) return fail('Achat non trouvé');

        const updateStmt = stmts.stmtUpdate;
        const params = [];
        const source = updateStmt.source;

        let finalReference = validation.data.reference;
        if (!finalReference || finalReference.trim() === '') {
          finalReference = existing.reference;
        }

        if (source.includes('fournisseur_id')) params.push(validation.data.fournisseur_id);
        if (source.includes('reference')) params.push(finalReference);
        if (source.includes('date_achat')) params.push(validation.data.date_achat);
        if (source.includes('total_ht')) params.push(validation.data.total_ht);
        if (source.includes('total_ttc')) params.push(validation.data.total_ttc);
        if (source.includes('designation')) params.push(validation.data.designation);
        if (source.includes('nombre_produits')) params.push(validation.data.nombre_produits);
        if (source.includes('statut')) params.push('Livré');
        if (source.includes('observation')) params.push(validation.data.observation || existing.observation || null);

        params.push(achatId);

        const transaction = db.transaction(() => {
          const oldDetails = stmts.stmtGetDetails.all(achatId);
          for (const oldDetail of oldDetails) {
            db.prepare(`UPDATE produits SET quantite_stock = quantite_stock - ? WHERE id = ?`)
              .run(oldDetail.quantite, oldDetail.produit_id);
          }

          updateStmt.run(...params);

          stmts.stmtDeleteDetails.run(achatId);

          if (Array.isArray(validation.data.details) && validation.data.details.length > 0) {
            for (const detail of validation.data.details) {
              const produit = stmts.stmtCheckProduit.get(detail.produit_id);
              if (!produit) {
                throw new Error(`Produit ${detail.produit_id} introuvable`);
              }

              // 1. Mampitombo ny stock
              db.prepare(`UPDATE produits SET quantite_stock = quantite_stock + ? WHERE id = ?`)
                .run(detail.quantite, detail.produit_id);

              // 2. Entrée de stock
              db.prepare(`
                INSERT INTO entrees_stock (produit_id, quantite, prix_unitaire, reference, fournisseur_id, observation)
                VALUES (?, ?, ?, ?, ?, ?)
              `).run(
                detail.produit_id,
                detail.quantite,
                detail.prix_unitaire,
                finalReference,
                validation.data.fournisseur_id,
                `Achat ${finalReference} modifié`
              );

              // 3. Mouvement de stock - ⭐ FIX: Mampiditra prix_unitaire
              try {
                const produitAfter = db.prepare(`SELECT quantite_stock FROM produits WHERE id = ?`).get(detail.produit_id);
                const ancienStock = Number(produitAfter.quantite_stock) - Number(detail.quantite);
                const nouveauStock = Number(produitAfter.quantite_stock);

                db.prepare(`
                  INSERT INTO mouvements_stock (produit_id, type_mouvement, quantite, ancien_stock, nouveau_stock, reference, observation, prix_unitaire)
                  VALUES (?, 'ENTREE', ?, ?, ?, ?, ?, ?)
                `).run(
                  detail.produit_id,
                  detail.quantite,
                  ancienStock,
                  nouveauStock,
                  finalReference,
                  `Entrée de stock - Achat ${finalReference} modifié`,
                  detail.prix_unitaire
                );
              } catch (mvtErr) {
                console.warn('⚠️ Mouvement stock tsy vita:', mvtErr.message);
              }

              // 4. Detail achat
              stmts.stmtInsertDetail.run(
                achatId,
                detail.produit_id,
                detail.quantite,
                detail.prix_unitaire,
                detail.total
              );
            }
          }
        });

        transaction();
        emitAchatsChanged({ type: 'update', id: achatId });

        return { success: true, data: { id: achatId } };
      } catch (err) {
        console.error('❌ [achats:update]', err.message);
        return fail(err.message);
      }
    });
    console.log('✅ [achats:update] enregistré');
  } catch (err) {
    console.error('❌ Impossible enregistrer achats:update:', err.message);
  }

  // ============================================================
  // UPDATE STATUS
  // ============================================================
  try {
    ipcMain.handle('achats:update-status', async (_event, id, statut) => {
      try {
        const achatId = normalizeId(id);
        if (!achatId) return fail('ID achat invalide');

        const db = dbReady();
        if (!db) return fail('Database connection is not open');

        const stmts = getStatements();
        const existing = stmts.stmtGetById.get(achatId);
        if (!existing) return fail('Achat non trouvé');

        const validStatuses = ['En attente', 'Validé', 'Livré', 'Annulé'];
        if (!validStatuses.includes(statut)) {
          return fail('Statut invalide');
        }

        const result = db.prepare('UPDATE achats SET statut = ? WHERE id = ?').run(statut, achatId);

        return { success: true, data: { changes: result.changes } };
      } catch (err) {
        console.error('❌ [achats:update-status]', err.message);
        return fail(err.message);
      }
    });
    console.log('✅ [achats:update-status] enregistré');
  } catch (err) {
    console.error('❌ Impossible enregistrer achats:update-status:', err.message);
  }

  // ============================================================
  // DELETE
  // ============================================================
  try {
    ipcMain.handle('achats:delete', async (_event, id) => {
      try {
        const achatId = normalizeId(id);
        if (!achatId) return fail('ID achat invalide');

        const db = dbReady();
        if (!db) return fail('Database connection is not open');

        const stmts = getStatements();
        const existing = stmts.stmtGetById.get(achatId);
        if (!existing) return fail('Achat non trouvé');

        const transaction = db.transaction(() => {
          const details = stmts.stmtGetDetails.all(achatId);
          for (const detail of details) {
            db.prepare(`UPDATE produits SET quantite_stock = quantite_stock - ? WHERE id = ?`)
              .run(detail.quantite, detail.produit_id);
          }

          stmts.stmtDeleteDetails.run(achatId);
          stmts.stmtDelete.run(achatId);
        });

        transaction();
        emitAchatsChanged({ type: 'delete', id: achatId });

        return { success: true, data: { id: achatId } };
      } catch (err) {
        console.error('❌ [achats:delete]', err.message);
        return fail(err.message);
      }
    });
    console.log('✅ [achats:delete] enregistré');
  } catch (err) {
    console.error('❌ Impossible enregistrer achats:delete:', err.message);
  }

  // ============================================================
  // BULK DELETE
  // ============================================================
  try {
    ipcMain.handle('achats:bulk-delete', async (_event, ids) => {
      try {
        const safeIds = normalizeIds(ids);
        if (safeIds.length === 0) {
          return fail('Aucun ID achat valide');
        }

        const db = dbReady();
        if (!db) return fail('Database connection is not open');

        const stmts = getStatements();

        const transaction = db.transaction(() => {
          for (const id of safeIds) {
            const existing = stmts.stmtGetById.get(id);
            if (!existing) continue;

            const details = stmts.stmtGetDetails.all(id);
            for (const detail of details) {
              db.prepare(`UPDATE produits SET quantite_stock = quantite_stock - ? WHERE id = ?`)
                .run(detail.quantite, detail.produit_id);
            }

            stmts.stmtDeleteDetails.run(id);
            stmts.stmtDelete.run(id);
          }
        });

        transaction();
        emitAchatsChanged({ type: 'bulk_delete', ids: safeIds });

        return { success: true, deleted: safeIds.length };
      } catch (err) {
        console.error('❌ [achats:bulk-delete]', err.message);
        return fail(err.message);
      }
    });
    console.log('✅ [achats:bulk-delete] enregistré');
  } catch (err) {
    console.error('❌ Impossible enregistrer achats:bulk-delete:', err.message);
  }

  console.log('✅ [achats.handlers] Tous les handlers enregistrés');
  console.log('📋 Channels:', channels.join(', '));

  return true;
}

module.exports = {
  registerAchatsHandlers
};