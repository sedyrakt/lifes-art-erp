// ============================================================
// database/tables.cjs - SCHEMA COMPLET (CORRIGÉ)
// ⭐ Version finale A-Z
// ============================================================
'use strict';

const { getDb } = require('./connection.cjs');

const log = (...args) => console.log('[tables]', ...args);
const error = (...args) => console.error('[tables]', ...args);
const warn = (...args) => console.warn('[tables]', ...args);

// ============================================================
// HELPERS
// ============================================================

function tableExists(db, tableName) {
  try {
    const stmt = db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=? LIMIT 1`);
    return !!stmt.get(tableName);
  } catch (err) {
    warn(`[tables] Impossible de vérifier ${tableName}:`, err.message);
    return false;
  }
}

function columnExists(db, table, column) {
  try {
    if (!tableExists(db, table)) return false;
    const stmt = db.prepare(`PRAGMA table_info("${table}")`);
    return stmt.all().some(c => c.name === column);
  } catch (err) {
    warn(`[tables] Impossible de vérifier ${table}.${column}:`, err.message);
    return false;
  }
}

function addColumnIfMissing(db, table, column, definition) {
  if (!tableExists(db, table) || columnExists(db, table, column)) return false;
  try {
    db.exec(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${definition}`);
    log(`✅ [migration] ${table}.${column} ajoutée`);
    return true;
  } catch (err) {
    error(`❌ [migration] Impossible d'ajouter ${table}.${column}:`, err.message);
    return false;
  }
}

function createIndex(db, sql, name) {
  try { db.exec(sql); return true; } catch (err) {
    warn(`⚠️ [index] ${name}: ${err.message}`);
    return false;
  }
}

// ============================================================
// CRÉATION DES TABLES + INDEX + FTS + TRIGGERS
// ============================================================

function ensureTables() {
  const db = getDb();
  if (!db || !db.open) {
    error('[tables] Base de données indisponible');
    return false;
  }

  try {
    log('🔄 Création/vérification du schéma database...');

    // ==========================================================
    // 1. TABLES PRINCIPALES
    // ==========================================================

    // ---------- CATEGORIES ----------
    db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ---------- FOURNISSEURS ----------
    db.exec(`
      CREATE TABLE IF NOT EXISTS fournisseurs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        contact TEXT,
        telephone TEXT,
        email TEXT,
        adresse TEXT,
        image TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ---------- PRODUITS ----------
    db.exec(`
      CREATE TABLE IF NOT EXISTS produits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        nom TEXT NOT NULL,
        description TEXT,
        categorie_id INTEGER,
        fournisseur_id INTEGER,
        prix_achat REAL DEFAULT 0,
        prix_vente REAL DEFAULT 0,
        quantite_stock INTEGER DEFAULT 0,
        quantite_minimale INTEGER DEFAULT 5,
        unite TEXT DEFAULT 'pièce',
        image TEXT,
        status TEXT DEFAULT 'actif',
        statut_stock TEXT DEFAULT 'disponible',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE SET NULL
      );
    `);

    // ---------- CLIENTS ----------
    db.exec(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        email TEXT UNIQUE,
        telephone TEXT,
        adresse TEXT,
        ville TEXT,
        code_postal TEXT,
        pays TEXT,
        type TEXT DEFAULT 'Particulier',
        image TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ---------- COMMANDES ----------
    db.exec(`
      CREATE TABLE IF NOT EXISTS commandes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        client_nom TEXT NOT NULL,
        total_ht REAL DEFAULT 0,
        total_ttc REAL DEFAULT 0,
        total REAL DEFAULT 0,
        statut TEXT DEFAULT 'En attente',
        stock_restaure INTEGER NOT NULL DEFAULT 0,
        date_commande TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
      );
    `);

    // ---------- DETAILS COMMANDES ----------
    db.exec(`
      CREATE TABLE IF NOT EXISTS details_commandes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        commande_id INTEGER NOT NULL,
        produit_id INTEGER NOT NULL,
        quantite INTEGER NOT NULL,
        prix_unitaire REAL NOT NULL,
        total REAL NOT NULL,
        FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
        FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE RESTRICT
      );
    `);

    // ---------- UTILISATEURS ----------
    db.exec(`
      CREATE TABLE IF NOT EXISTS utilisateurs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        firstName TEXT,
        lastName TEXT,
        role TEXT DEFAULT 'user',
        companyName TEXT,
        phone TEXT,
        image TEXT,
        status TEXT DEFAULT 'actif',
        twoFactorEnabled INTEGER DEFAULT 0,
        twoFactorSecret TEXT,
        lastLogin TEXT,
        loginAttempts INTEGER DEFAULT 0,
        lockedUntil TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ---------- SESSIONS ----------
    db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT NOT NULL UNIQUE,
        userId INTEGER NOT NULL,
        expiresAt TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES utilisateurs(id) ON DELETE CASCADE
      );
    `);

    // ---------- AUDIT LOGS ----------
    db.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT,
        entity TEXT,
        entity_id INTEGER,
        entity_name TEXT,
        user_id INTEGER,
        details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ---------- ENTREES STOCK ----------
    db.exec(`
      CREATE TABLE IF NOT EXISTS entrees_stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        produit_id INTEGER NOT NULL,
        quantite INTEGER NOT NULL,
        prix_unitaire REAL DEFAULT 0,
        reference TEXT,
        fournisseur_id INTEGER,
        observation TEXT,
        date_entree TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE RESTRICT,
        FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE SET NULL
      );
    `);

    // ---------- SORTIES STOCK ----------
    db.exec(`
      CREATE TABLE IF NOT EXISTS sorties_stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        produit_id INTEGER NOT NULL,
        quantite INTEGER NOT NULL,
        prix_unitaire REAL DEFAULT 0,
        reference TEXT,
        destination TEXT,
        observation TEXT,
        date_sortie TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE RESTRICT
      );
    `);

    // ---------- MOUVEMENTS STOCK ----------
    db.exec(`
      CREATE TABLE IF NOT EXISTS mouvements_stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        produit_id INTEGER NOT NULL,
        type_mouvement TEXT NOT NULL CHECK (type_mouvement IN ('ENTREE','SORTIE')),
        quantite INTEGER NOT NULL,
        ancien_stock INTEGER NOT NULL,
        nouveau_stock INTEGER NOT NULL,
        reference TEXT,
        observation TEXT,
        created_by INTEGER,
        date_mouvement TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE RESTRICT,
        FOREIGN KEY (created_by) REFERENCES utilisateurs(id) ON DELETE SET NULL
      );
    `);

    // ---------- EMPLOYES ----------
    db.exec(`
      CREATE TABLE IF NOT EXISTS employes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        prenom TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        telephone TEXT,
        poste TEXT NOT NULL,
        departement TEXT,
        date_embauche TEXT,
        salaire REAL DEFAULT 0,
        image TEXT,
        status TEXT DEFAULT 'actif',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ---------- PAIEMENTS EMPLOYES ----------
    db.exec(`
      CREATE TABLE IF NOT EXISTS paiements_employes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employe_id INTEGER NOT NULL,
        mois INTEGER NOT NULL,
        annee INTEGER NOT NULL,
        montant REAL NOT NULL,
        mode_paiement TEXT DEFAULT 'Espèces',
        reference TEXT,
        observation TEXT,
        date_paiement TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE
      );
    `);

    // ---------- DEPENSES ----------
    db.exec(`
      CREATE TABLE IF NOT EXISTS depenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fournisseur_id INTEGER,
        description TEXT NOT NULL,
        montant REAL NOT NULL DEFAULT 0,
        categorie TEXT,
        date_depense TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE SET NULL
      );
    `);

    // ==========================================================
    // 2. MIGRATIONS
    // ==========================================================
    log('🔧 Vérification des migrations...');

    if (tableExists(db, 'fournisseurs')) {
      addColumnIfMissing(db, 'fournisseurs', 'image', 'TEXT');
      addColumnIfMissing(db, 'fournisseurs', 'updated_at', 'TEXT DEFAULT CURRENT_TIMESTAMP');
    }
    if (tableExists(db, 'utilisateurs')) {
      addColumnIfMissing(db, 'utilisateurs', 'companyName', 'TEXT');
      addColumnIfMissing(db, 'utilisateurs', 'phone', 'TEXT');
      addColumnIfMissing(db, 'utilisateurs', 'image', 'TEXT');
      addColumnIfMissing(db, 'utilisateurs', 'status', "TEXT DEFAULT 'actif'");
      addColumnIfMissing(db, 'utilisateurs', 'twoFactorEnabled', 'INTEGER DEFAULT 0');
      addColumnIfMissing(db, 'utilisateurs', 'twoFactorSecret', 'TEXT');
      addColumnIfMissing(db, 'utilisateurs', 'lastLogin', 'TEXT');
      addColumnIfMissing(db, 'utilisateurs', 'loginAttempts', 'INTEGER DEFAULT 0');
      addColumnIfMissing(db, 'utilisateurs', 'lockedUntil', 'TEXT');
      addColumnIfMissing(db, 'utilisateurs', 'updated_at', 'TEXT DEFAULT CURRENT_TIMESTAMP');
    }
    if (tableExists(db, 'produits')) {
      addColumnIfMissing(db, 'produits', 'image', 'TEXT');
      addColumnIfMissing(db, 'produits', 'status', "TEXT DEFAULT 'actif'");
      addColumnIfMissing(db, 'produits', 'statut_stock', "TEXT DEFAULT 'disponible'");
      addColumnIfMissing(db, 'produits', 'updated_at', 'TEXT DEFAULT CURRENT_TIMESTAMP');
    }
    if (tableExists(db, 'clients')) {
      addColumnIfMissing(db, 'clients', 'image', 'TEXT');
      addColumnIfMissing(db, 'clients', 'updated_at', 'TEXT DEFAULT CURRENT_TIMESTAMP');
      addColumnIfMissing(db, 'clients', 'ville', 'TEXT');
      addColumnIfMissing(db, 'clients', 'code_postal', 'TEXT');
      addColumnIfMissing(db, 'clients', 'pays', 'TEXT');
      addColumnIfMissing(db, 'clients', 'type', "TEXT DEFAULT 'Particulier'");
    }
    if (tableExists(db, 'commandes')) {
      addColumnIfMissing(db, 'commandes', 'client_id', 'INTEGER');
      addColumnIfMissing(db, 'commandes', 'client_nom', 'TEXT');
      addColumnIfMissing(db, 'commandes', 'total_ht', 'REAL DEFAULT 0');
      addColumnIfMissing(db, 'commandes', 'total_ttc', 'REAL DEFAULT 0');
      addColumnIfMissing(db, 'commandes', 'total', 'REAL DEFAULT 0');
      addColumnIfMissing(db, 'commandes', 'statut', "TEXT DEFAULT 'En attente'");
      addColumnIfMissing(db, 'commandes', 'stock_restaure', 'INTEGER NOT NULL DEFAULT 0');
      addColumnIfMissing(db, 'commandes', 'date_commande', 'TEXT DEFAULT CURRENT_TIMESTAMP');
      addColumnIfMissing(db, 'commandes', 'created_at', 'TEXT DEFAULT CURRENT_TIMESTAMP');
    }
    if (tableExists(db, 'employes')) {
      addColumnIfMissing(db, 'employes', 'image', 'TEXT');
      addColumnIfMissing(db, 'employes', 'status', "TEXT DEFAULT 'actif'");
      addColumnIfMissing(db, 'employes', 'updated_at', 'TEXT DEFAULT CURRENT_TIMESTAMP');
    }

    // ==========================================================
    // 3. INDEXES
    // ==========================================================
    const productIndexes = [
      [`CREATE INDEX IF NOT EXISTS idx_produits_status_id ON produits(status, id)`, 'idx_produits_status_id'],
      [`CREATE INDEX IF NOT EXISTS idx_produits_status_created_id ON produits(status, created_at, id)`, 'idx_produits_status_created_id'],
      [`CREATE INDEX IF NOT EXISTS idx_produits_status_nom_id ON produits(status, nom COLLATE NOCASE, id)`, 'idx_produits_status_nom_id'],
      [`CREATE INDEX IF NOT EXISTS idx_produits_status_prix_id ON produits(status, prix_vente, id)`, 'idx_produits_status_prix_id'],
      [`CREATE INDEX IF NOT EXISTS idx_produits_status_stock_id ON produits(status, quantite_stock, id)`, 'idx_produits_status_stock_id'],
      [`CREATE INDEX IF NOT EXISTS idx_produits_categorie_status_id ON produits(categorie_id, status, id)`, 'idx_produits_categorie_status_id'],
      [`CREATE INDEX IF NOT EXISTS idx_produits_categorie_status_nom_id ON produits(categorie_id, status, nom COLLATE NOCASE, id)`, 'idx_produits_categorie_status_nom_id'],
      [`CREATE INDEX IF NOT EXISTS idx_produits_fournisseur_id ON produits(fournisseur_id)`, 'idx_produits_fournisseur_id'],
      [`CREATE INDEX IF NOT EXISTS idx_produits_code ON produits(code)`, 'idx_produits_code'],
      [`CREATE INDEX IF NOT EXISTS idx_produits_stock_min ON produits(quantite_stock, quantite_minimale, id)`, 'idx_produits_stock_min'],
    ];
    for (const [sql, name] of productIndexes) createIndex(db, sql, name);

    const stockIndexes = [
      [`CREATE INDEX IF NOT EXISTS idx_entrees_date_id ON entrees_stock(date_entree DESC, id DESC)`, 'idx_entrees_date_id'],
      [`CREATE INDEX IF NOT EXISTS idx_entrees_produit_date ON entrees_stock(produit_id, date_entree DESC, id DESC)`, 'idx_entrees_produit_date'],
      [`CREATE INDEX IF NOT EXISTS idx_entrees_fournisseur ON entrees_stock(fournisseur_id)`, 'idx_entrees_fournisseur'],
      [`CREATE INDEX IF NOT EXISTS idx_sorties_date_id ON sorties_stock(date_sortie DESC, id DESC)`, 'idx_sorties_date_id'],
      [`CREATE INDEX IF NOT EXISTS idx_sorties_produit_date ON sorties_stock(produit_id, date_sortie DESC, id DESC)`, 'idx_sorties_produit_date'],
      [`CREATE INDEX IF NOT EXISTS idx_mouvements_date_id ON mouvements_stock(date_mouvement DESC, id DESC)`, 'idx_mouvements_date_id'],
      [`CREATE INDEX IF NOT EXISTS idx_mouvements_produit_date ON mouvements_stock(produit_id, date_mouvement DESC, id DESC)`, 'idx_mouvements_produit_date'],
      [`CREATE INDEX IF NOT EXISTS idx_mouvements_type_date ON mouvements_stock(type_mouvement, date_mouvement DESC, id DESC)`, 'idx_mouvements_type_date'],
    ];
    for (const [sql, name] of stockIndexes) createIndex(db, sql, name);

    if (tableExists(db, 'commandes')) {
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_commandes_client_id ON commandes(client_id)`, 'idx_commandes_client_id');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_commandes_date ON commandes(date_commande DESC)`, 'idx_commandes_date');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_commandes_statut ON commandes(statut)`, 'idx_commandes_statut');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_commandes_id_desc ON commandes(id DESC)`, 'idx_commandes_id_desc');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_commandes_date_id ON commandes(date_commande DESC, id DESC)`, 'idx_commandes_date_id');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_commandes_statut_id ON commandes(statut, id DESC)`, 'idx_commandes_statut_id');
    }
    if (tableExists(db, 'details_commandes')) {
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_details_commandes_commande ON details_commandes(commande_id)`, 'idx_details_commandes_commande');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_details_commandes_produit ON details_commandes(commande_id, produit_id)`, 'idx_details_commandes_produit');
    }
    if (tableExists(db, 'clients')) {
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_clients_nom ON clients(nom COLLATE NOCASE)`, 'idx_clients_nom');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email)`, 'idx_clients_email');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(type)`, 'idx_clients_type');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_clients_ville ON clients(ville)`, 'idx_clients_ville');
    }
    if (tableExists(db, 'fournisseurs')) {
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_fournisseurs_nom ON fournisseurs(nom COLLATE NOCASE)`, 'idx_fournisseurs_nom');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_fournisseurs_email ON fournisseurs(email)`, 'idx_fournisseurs_email');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_fournisseurs_telephone ON fournisseurs(telephone)`, 'idx_fournisseurs_telephone');
    }
    createIndex(db, `CREATE INDEX IF NOT EXISTS idx_utilisateurs_email ON utilisateurs(email)`, 'idx_utilisateurs_email');
    createIndex(db, `CREATE INDEX IF NOT EXISTS idx_utilisateurs_status ON utilisateurs(status)`, 'idx_utilisateurs_status');
    createIndex(db, `CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`, 'idx_sessions_token');
    createIndex(db, `CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId)`, 'idx_sessions_userId');
    if (tableExists(db, 'employes')) {
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_employes_email ON employes(email)`, 'idx_employes_email');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_employes_status ON employes(status)`, 'idx_employes_status');
    }
    if (tableExists(db, 'paiements_employes')) {
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_paiements_employes_employe ON paiements_employes(employe_id)`, 'idx_paiements_employes_employe');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_paiements_employes_period ON paiements_employes(mois, annee)`, 'idx_paiements_employes_period');
    }

    // ==========================================================
    // 4. FTS5 PRODUITS
    // ==========================================================
    try {
      db.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS produits_fts USING fts5(nom, code, description, content='produits', content_rowid='id');`);
      db.exec(`CREATE TRIGGER IF NOT EXISTS produits_ai AFTER INSERT ON produits BEGIN INSERT INTO produits_fts(rowid, nom, code, description) VALUES (new.id, new.nom, new.code, new.description); END;`);
      db.exec(`CREATE TRIGGER IF NOT EXISTS produits_ad AFTER DELETE ON produits BEGIN INSERT INTO produits_fts(produits_fts, rowid, nom, code, description) VALUES ('delete', old.id, old.nom, old.code, old.description); END;`);
      db.exec(`CREATE TRIGGER IF NOT EXISTS produits_au AFTER UPDATE ON produits BEGIN INSERT INTO produits_fts(produits_fts, rowid, nom, code, description) VALUES ('delete', old.id, old.nom, old.code, old.description); INSERT INTO produits_fts(rowid, nom, code, description) VALUES (new.id, new.nom, new.code, new.description); END;`);
      log('✅ FTS5 produits configuré');
    } catch (ftsErr) { warn('⚠️ FTS5 produits non disponible/configuré:', ftsErr.message); }

    // ==========================================================
    // 5. TRIGGER STOCK
    // ==========================================================
    try {
      db.exec(`CREATE TRIGGER IF NOT EXISTS update_statut_stock_after_stock_change AFTER UPDATE OF quantite_stock ON produits BEGIN UPDATE produits SET statut_stock = CASE WHEN NEW.quantite_stock <= 0 THEN 'rupture' WHEN NEW.quantite_stock <= NEW.quantite_minimale THEN 'alerte' ELSE 'disponible' END WHERE id = NEW.id; END;`);
      log('✅ Trigger statut_stock configuré');
    } catch (triggerErr) { warn('⚠️ Trigger statut_stock non configuré:', triggerErr.message); }

    // ==========================================================
    // 6. SYNCHRONISATION INITIALE
    // ==========================================================
    try {
      db.exec(`UPDATE produits SET statut_stock = CASE WHEN quantite_stock <= 0 THEN 'rupture' WHEN quantite_stock <= quantite_minimale THEN 'alerte' ELSE 'disponible' END;`);
    } catch (err) { warn('⚠️ Synchronisation statut_stock ignorée:', err.message); }

    // ==========================================================
    // FIN
    // ==========================================================
    log('================================================');
    log('✅ DATABASE SCHEMA INITIALISÉ');
    log('✅ Tables vérifiées');
    log('✅ Migrations vérifiées');
    log('✅ Index vérifiés');
    log('✅ FTS5 vérifié');
    log('✅ Triggers vérifiés');
    log('================================================');
    return true;

  } catch (err) {
    error('[tables] ❌ Erreur lors de la création du schéma:', err.message);
    if (err.stack) error(err.stack);
    return false;
  }
}

module.exports = { ensureTables, tableExists, columnExists, addColumnIfMissing };