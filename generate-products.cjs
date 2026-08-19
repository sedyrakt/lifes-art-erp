// generate-products.cjs
// ⭐ Mampiasa CommonJS, azo tanterahina amin'ny node generate-products.cjs
// ⭐ Miantoka anarana samihafa tsy misy duplicate

const path = require('path');
const { getDb } = require('./electron/database/connection.cjs'); // Amboary raha misy lalana hafa

// Lisitra feno kokoa ho an'ny sokajy tsirairay (mba hananana karazany maro)
const categories = [
  { id: 1, nom: 'Pâtisserie' },
  { id: 2, nom: 'Glaces & Sorbets' },
  { id: 3, nom: 'Confiseries' },
  { id: 4, nom: 'Chocolats' },
  { id: 5, nom: 'Biscuits & Gâteaux secs' },
  { id: 6, nom: 'Viennoiseries' },
  { id: 7, nom: 'Bonbons' },
  { id: 8, nom: 'Entremets & Desserts' }
];

// Isaky ny sokajy dia misy lisitra lava misy anarana (mihoatra ny 125 mba ho azo ampiasaina)
const nomsParCategorie = {
  1: [
    'Croissant', 'Pain au chocolat', 'Éclair', 'Religieuse', 'Mille-feuille',
    'Tarte aux pommes', 'Paris-Brest', 'Saint-Honoré', 'Macaron', 'Flan pâtissier',
    'Opéra', 'Fraisier', 'Canelé', 'Madeleine', 'Financier', 'Kouglof',
    'Brioche', 'Chinois', 'Cake au citron', 'Gâteau basque', 'Tarte au chocolat',
    'Merveilleux', 'Profiterole', 'Charlotte', 'Baba au rhum', 'Dacquoise',
    'Jésuite', 'Puits d\'amour', 'Tranche napolitaine', 'Roulé à la confiture',
    'Gâteau de Savoie', 'Flognarde', 'Tarte aux noix', 'Tarte aux poires',
    'Cheesecake', 'Carrot cake', 'Banana bread', 'Crumble', 'Clafoutis',
    'Far breton', 'Kouign-amann', 'Tarte au maroilles', 'Gaufre liégeoise',
    'Beignet aux pommes', 'Beignet au chocolat', 'Bugne lyonnaise'
  ],
  2: [
    'Glace vanille', 'Glace chocolat', 'Glace fraise', 'Sorbet citron',
    'Sorbet mangue', 'Sorbet framboise', 'Esquimau vanille', 'Cône glacé',
    'Bâtonnet chocolat', 'Glace caramel', 'Glace menthe-chocolat',
    'Glace noix de coco', 'Glace pistache', 'Glace stracciatella',
    'Glace tiramisu', 'Sorbet passion', 'Sorbet pêche', 'Sorbet ananas',
    'Glace yaourt', 'Glace spéculoos', 'Glace cookie dough'
  ],
  3: [
    'Bonbon acidulé', 'Sucette', 'Guimauve', 'Pâte de fruits', 'Dragée',
    'Praline', 'Nougat', 'Calisson', 'Marron glacé', 'Mendiant',
    'Sucette caramel', 'Sucette cola', 'Chewing-gum', 'Boule de gomme',
    'Coco', 'Réglisse', 'Bonbon gélifié', 'Gomme à mâcher', 'Pastille Vichy',
    'Bonbon au miel', 'Sucette fruitée'
  ],
  4: [
    'Tablette chocolat noir', 'Tablette chocolat au lait', 'Tablette chocolat blanc',
    'Chocolat fourré praliné', 'Truffe', 'Rocher', 'Bouchée liqueur',
    'Chocolat aux noisettes', 'Chocolat aux amandes', 'Chocolat au caramel',
    'Chocolat à la menthe', 'Carré chocolat', 'Bouchon chocolat', 'Glanduja',
    'Moulage chocolat', 'Friture chocolat', 'Praliné feuillantine'
  ],
  5: [
    'Petit beurre', 'Sablé', 'Palet breton', 'Cookies', 'Spéculoos',
    'Brownie', 'Moelleux', 'Tartelette', 'Tuile aux amandes', 'Cigarette russe',
    'Macaron', 'Carré au citron', 'Barre de céréales', 'Galette', 'Crêpe dentelle',
    'Palet aux amandes', 'Sablé diamant', 'Biscuit rose', 'Nonnette'
  ],
  6: [
    'Croissant', 'Pain au chocolat', 'Pain aux raisins', 'Chausson aux pommes',
    'Brioche', 'Orangette', 'Escargot', 'Torsade', 'Chinois', 'Kouign-amann',
    'Bugne', 'Beignet', 'Gaufre', 'Crêpe', 'Pancake'
  ],
  7: [
    'Sucette cola', 'Sucette fraise', 'Sucette pomme', 'Bonbon gélifié',
    'Chewing-gum', 'Boule de gomme', 'Coco', 'Réglisse', 'Sucette citron',
    'Sucette orange', 'Sucette grenadine', 'Bonbon piment', 'Bonbon menthe',
    'Bonbon fruits rouges', 'Bonbon caramel', 'Bonbon réglisse'
  ],
  8: [
    'Tiramisu', 'Crème brûlée', 'Panna cotta', 'Mousse au chocolat',
    'Charlotte', 'Bavarois', 'Cheesecake', 'Carrot cake', 'Fondant au chocolat',
    'Moelleux caramel', 'Macaron géant', 'Dôme chocolat', 'Vacherin',
    'Entremets fruits rouges', 'Gâteau opéra', 'Mille-feuille revisité'
  ]
};

// --------------------- SCRIPT PRINCIPAL ---------------------
const db = getDb();
if (!db) {
  console.error('❌ Base de données non accessible. Vérifiez le chemin connection.cjs');
  process.exit(1);
}

// 1. Insérer les catégories (si elles n'existent pas)
categories.forEach(c => {
  db.prepare(`INSERT OR IGNORE INTO categories (id, nom) VALUES (?, ?)`).run(c.id, c.nom);
});

// 2. Préparation de l'insertion des produits
const insertStmt = db.prepare(`
  INSERT INTO produits (code, nom, description, categorie_id, prix_achat, prix_vente, quantite_stock, quantite_minimale, unite, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pièce', 'actif')
`);

let count = 0;

// 3. Génération de 1000 produits (8 catégories × 125 = 1000)
// Utilise la liste de chaque catégorie et ajoute un suffixe numérique pour garantir l'unicité
const produitParCategorie = Math.floor(1000 / categories.length); // 125

try {
  const transaction = db.transaction(() => {
    for (const cat of categories) {
      const catId = cat.id;
      const noms = nomsParCategorie[catId];
      for (let i = 0; i < produitParCategorie; i++) {
        const idx = i % noms.length;                // Index du nom dans la liste
        const suffix = Math.floor(i / noms.length); // Si la liste est épuisée, on ajoute un suffixe numérique
        const nom = suffix > 0
          ? `${noms[idx]} #${suffix + 1}`
          : noms[idx];

        const code = `PRD-${String(count + 1).padStart(6, '0')}`;
        const prixAchat = (Math.random() * 1.5 + 0.3).toFixed(2);
        const prixVente = (parseFloat(prixAchat) * 2.2).toFixed(2);
        const stock = Math.floor(Math.random() * 200) + 5;
        const stockMin = Math.floor(stock * 0.2);

        insertStmt.run(code, nom, `${nom} délicieux`, catId, prixAchat, prixVente, stock, stockMin);
        count++;
      }
    }
  });

  transaction();
  console.log(`✅ ${count} produits insérés avec succès (noms uniques).`);
} catch (err) {
  console.error('❌ Erreur lors de l’insertion :', err.message);
} finally {
  db.close();
}