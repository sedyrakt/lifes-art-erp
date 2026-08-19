'use strict'; 
const { getDb } = require('../../database/connection.cjs'); 
const { log, error } = require('../../database/utils.cjs');
const { buildEmployesQuery, buildEmployesCountQuery } = require('./queries.cjs');

const stmts = {};

function prepareStatements() {
  const db = getDb(); 
  if (!db) { error('❌ [employes:statements] DB indisponible'); return false; }
  
  try {
    db.prepare('SELECT 1 FROM employes LIMIT 1').get(); // check
    stmts.stmtGetById = db.prepare('SELECT id, nom, prenom, email, telephone, poste, departement, date_embauche, salaire, image, status, created_at, updated_at FROM employes WHERE id = ?');
    stmts.stmtGetByEmail = db.prepare('SELECT id FROM employes WHERE email = ?');
    stmts.stmtGetByDepartement = db.prepare('SELECT id, nom, prenom, email, poste, status FROM employes WHERE departement = ? AND status = ? ORDER BY nom');
    stmts.stmtGetByStatus = db.prepare('SELECT id, nom, prenom, email, poste, status FROM employes WHERE status = ? ORDER BY nom');
    stmts.stmtCreate = db.prepare('INSERT INTO employes (nom, prenom, email, telephone, poste, departement, date_embauche, salaire, image, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(\'now\'))');
    stmts.stmtUpdate = db.prepare('UPDATE employes SET nom = ?, prenom = ?, email = ?, telephone = ?, poste = ?, departement = ?, date_embauche = ?, salaire = ?, image = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmts.stmtSoftDelete = db.prepare('UPDATE employes SET status = ? WHERE id = ?');
    stmts.stmtUpdateStatus = db.prepare('UPDATE employes SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmts.stmtCheckEmail = db.prepare('SELECT id FROM employes WHERE email = ?');
    stmts.stmtCheckEmailExcept = db.prepare('SELECT id FROM employes WHERE email = ? AND id != ?');
    stmts.stmtPaymentCount = db.prepare('SELECT COUNT(*) AS total FROM paiements_employes WHERE employe_id = ?');
    stmts.stmtStats = db.prepare(`SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'actif' THEN 1 ELSE 0 END) AS actifs, SUM(CASE WHEN status = 'inactif' THEN 1 ELSE 0 END) AS inactifs, SUM(CASE WHEN status = 'en_conge' THEN 1 ELSE 0 END) AS en_conge, SUM(CASE WHEN status = 'licencie' THEN 1 ELSE 0 END) AS licencies, SUM(salaire) AS total_salaires, AVG(salaire) AS salaire_moyen, COUNT(DISTINCT departement) AS departements FROM employes`);
    stmts.stmtSearch = db.prepare('SELECT id, nom, prenom, email, poste, departement, status FROM employes WHERE (nom LIKE ? OR prenom LIKE ? OR email LIKE ?) AND status != \'licencie\' ORDER BY nom LIMIT 50');
    stmts.stmtGetAllActifs = db.prepare('SELECT id, nom, prenom, email, poste, departement, status FROM employes WHERE status != \'licencie\' ORDER BY nom, prenom LIMIT 50');
    stmts.stmtGetPaiementCountsBatch = db.prepare(`SELECT employe_id, COUNT(*) AS count FROM paiements_employes WHERE employe_id IN (${Array.from({ length: 50 }, () => '?').join(',')}) GROUP BY employe_id`);
    
    return true;
  } catch (err) { 
    error('❌ [employes:statements] Erreur:', err.message); 
    return false; 
  }
}

function getStatements() {
  return stmts;
}

module.exports = { 
  prepareStatements, 
  getStatements,
  buildEmployesQuery,
  buildEmployesCountQuery
};