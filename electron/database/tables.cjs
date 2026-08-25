'use strict';

const { getDb } = require('./connection.cjs');

const log = (...args) => console.log('[tables]', ...args);
const error = (...args) => console.error('[tables]', ...args);
const warn = (...args) => console.warn('[tables]', ...args);

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

function ensureTables() {
  const db = getDb();
  if (!db || !db.open) {
    error('[tables] Base de données indisponible');
    return false;
  }

  try {
    log('🔄 Création/vérification du schéma database...');

    // ==========================================================
    // 1. CRÉATION DES TABLES
    // ==========================================================

    db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

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

    db.exec(`
      CREATE TABLE IF NOT EXISTS security_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        action TEXT,
        ip TEXT,
        userAgent TEXT,
        status INTEGER,
        details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

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

    // ⭐ FIX: NAMPIANA NY prix_unitaire ao amin'ny mouvements_stock
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
        prix_unitaire REAL DEFAULT 0,
        created_by INTEGER,
        date_mouvement TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE RESTRICT,
        FOREIGN KEY (created_by) REFERENCES utilisateurs(id) ON DELETE SET NULL
      );
    `);

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
    // ⭐ MODULES ERP: COMPTABILITÉ
    // ==========================================================

    db.exec(`
      CREATE TABLE IF NOT EXISTS comptes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero TEXT NOT NULL UNIQUE,
        nom TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('actif','passif','produit','charge')),
        solde_initial REAL DEFAULT 0,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS ecritures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        compte_id INTEGER NOT NULL,
        libelle TEXT NOT NULL,
        debit REAL DEFAULT 0,
        credit REAL DEFAULT 0,
        reference TEXT,
        date_ecriture TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (compte_id) REFERENCES comptes(id) ON DELETE RESTRICT
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS journaux (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        nom TEXT NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ==========================================================
    // ⭐ MODULES ERP: ACHATS
    // ==========================================================

    db.exec(`
      CREATE TABLE IF NOT EXISTS achats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fournisseur_id INTEGER NOT NULL,
        reference TEXT,
        date_achat TEXT DEFAULT CURRENT_TIMESTAMP,
        total_ht REAL DEFAULT 0,
        total_ttc REAL DEFAULT 0,
        designation TEXT,
        nombre_produits INTEGER DEFAULT 0,
        statut TEXT DEFAULT 'En attente',
        observation TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE RESTRICT
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS details_achats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        achat_id INTEGER NOT NULL,
        produit_id INTEGER NOT NULL,
        quantite INTEGER NOT NULL,
        prix_unitaire REAL NOT NULL,
        total REAL NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (achat_id) REFERENCES achats(id) ON DELETE CASCADE,
        FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE RESTRICT
      );
    `);

    // ==========================================================
    // ⭐ MODULES ERP: VENTES (Devis & Factures) - NAMPIANA
    // ==========================================================

    db.exec(`
      CREATE TABLE IF NOT EXISTS devis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        client_nom TEXT NOT NULL,
        reference TEXT,
        total_ht REAL DEFAULT 0,
        total_ttc REAL DEFAULT 0,
        validite_jours INTEGER DEFAULT 30,
        statut TEXT DEFAULT 'En attente',
        observation TEXT,
        date_devis TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS details_devis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        devis_id INTEGER NOT NULL,
        produit_id INTEGER NOT NULL,
        quantite INTEGER NOT NULL,
        prix_unitaire REAL NOT NULL,
        total REAL NOT NULL,
        FOREIGN KEY (devis_id) REFERENCES devis(id) ON DELETE CASCADE,
        FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE RESTRICT
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS factures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        client_nom TEXT NOT NULL,
        reference TEXT,
        total_ht REAL DEFAULT 0,
        total_ttc REAL DEFAULT 0,
        observation TEXT,
        date_facture TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS details_factures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        facture_id INTEGER NOT NULL,
        produit_id INTEGER NOT NULL,
        quantite INTEGER NOT NULL,
        prix_unitaire REAL NOT NULL,
        total REAL NOT NULL,
        FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE CASCADE,
        FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE RESTRICT
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
      addColumnIfMissing(db, 'produits', 'unite', "TEXT DEFAULT 'pièce'");
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

    if (tableExists(db, 'achats')) {
      addColumnIfMissing(db, 'achats', 'designation', 'TEXT');
      addColumnIfMissing(db, 'achats', 'nombre_produits', 'INTEGER DEFAULT 0');
      addColumnIfMissing(db, 'achats', 'updated_at', 'TEXT DEFAULT CURRENT_TIMESTAMP');
    }

    if (tableExists(db, 'details_achats')) {
      addColumnIfMissing(db, 'details_achats', 'created_at', 'TEXT DEFAULT CURRENT_TIMESTAMP');
    }

    // ⭐ FIX: NAMPIANA NY MIGRATION HO AN'NY mouvements_stock
    if (tableExists(db, 'mouvements_stock')) {
      addColumnIfMissing(db, 'mouvements_stock', 'prix_unitaire', 'REAL DEFAULT 0');
    }

    // ==========================================================
    // 3. INDEXES
    // ==========================================================
    log('🔧 Création des indexes...');

    if (tableExists(db, 'achats')) {
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_achats_fournisseur ON achats(fournisseur_id)`, 'idx_achats_fournisseur');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_achats_date ON achats(date_achat)`, 'idx_achats_date');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_achats_statut ON achats(statut)`, 'idx_achats_statut');
    }
    if (tableExists(db, 'details_achats')) {
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_details_achats_achat ON details_achats(achat_id)`, 'idx_details_achats_achat');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_details_achats_produit ON details_achats(produit_id)`, 'idx_details_achats_produit');
    }

    if (tableExists(db, 'devis')) {
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_devis_client ON devis(client_id)`, 'idx_devis_client');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_devis_date ON devis(date_devis)`, 'idx_devis_date');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_devis_statut ON devis(statut)`, 'idx_devis_statut');
    }
    if (tableExists(db, 'details_devis')) {
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_details_devis_devis ON details_devis(devis_id)`, 'idx_details_devis_devis');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_details_devis_produit ON details_devis(produit_id)`, 'idx_details_devis_produit');
    }
    if (tableExists(db, 'factures')) {
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_factures_client ON factures(client_id)`, 'idx_factures_client');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_factures_date ON factures(date_facture)`, 'idx_factures_date');
    }
    if (tableExists(db, 'details_factures')) {
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_details_factures_facture ON details_factures(facture_id)`, 'idx_details_factures_facture');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_details_factures_produit ON details_factures(produit_id)`, 'idx_details_factures_produit');
    }

    // Comptabilité indexes
    if (tableExists(db, 'comptes')) {
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_comptes_numero ON comptes(numero)`, 'idx_comptes_numero');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_comptes_type ON comptes(type)`, 'idx_comptes_type');
    }
    if (tableExists(db, 'ecritures')) {
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_ecritures_compte ON ecritures(compte_id)`, 'idx_ecritures_compte');
      createIndex(db, `CREATE INDEX IF NOT EXISTS idx_ecritures_date ON ecritures(date_ecriture)`, 'idx_ecritures_date');
    }

    createIndex(db, `CREATE INDEX IF NOT EXISTS idx_produits_code ON produits(code)`, 'idx_produits_code');
    createIndex(db, `CREATE INDEX IF NOT EXISTS idx_produits_status ON produits(status)`, 'idx_produits_status');
    createIndex(db, `CREATE INDEX IF NOT EXISTS idx_produits_categorie ON produits(categorie_id)`, 'idx_produits_categorie');
    createIndex(db, `CREATE INDEX IF NOT EXISTS idx_produits_fournisseur ON produits(fournisseur_id)`, 'idx_produits_fournisseur');

    createIndex(db, `CREATE INDEX IF NOT EXISTS idx_utilisateurs_email ON utilisateurs(email)`, 'idx_utilisateurs_email');
    createIndex(db, `CREATE INDEX IF NOT EXISTS idx_utilisateurs_status ON utilisateurs(status)`, 'idx_utilisateurs_status');
    createIndex(db, `CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`, 'idx_sessions_token');
    createIndex(db, `CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId)`, 'idx_sessions_userId');

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
    // FIN
    // ==========================================================
    log('================================================');
    log('✅ DATABASE SCHEMA INITIALISÉ');
    log('✅ Tables vérifiées');
    log('✅ Migrations vérifiées');
    log('✅ Index vérifiés');
    log('✅ FTS5 vérifié');
    log('✅ Triggers vérifiés');
    log('✅ Modules ERP: Comptabilité, Achats, Ventes');
    log('================================================');
    return true;

  } catch (err) {
    error('[tables] ❌ Erreur lors de la création du schéma:', err.message);
    if (err.stack) error(err.stack);
    return false;
  }
}

module.exports = { ensureTables, tableExists, columnExists, addColumnIfMissing };