const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'app-node', 'public')));

// Base de données SQLite
const db = new sqlite3.Database(path.join(__dirname, 'app-node', 'data.db'), (err) => {
    if (err) console.error('Erreur de connexion DB:', err);
    else console.log('Connecté à la base de données SQLite');
});

// Créer les tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL
    )`);

    // Insérer les services par défaut
    db.get("SELECT COUNT(*) as count FROM services", (err, row) => {
        if (row.count === 0) {
            const services = [
                ['Développement Web', 'Création de sites web modernes et performants', 5000],
                ['Applications Mobiles', 'Développement d\'applications iOS et Android', 8000],
                ['Consulting IT', 'Audit et stratégie technologique', 3000],
                ['Cloud & DevOps', 'Migration cloud et automatisation', 6000],
                ['Data & IA', 'Analyse de données et machine learning', 7000],
                ['Maintenance', 'Support technique 24/7', 1500]
            ];

            services.forEach(s => {
                db.run("INSERT INTO services (name, description, price) VALUES (?, ?, ?)", s);
            });
        }
    });
});

// Routes HTML
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>TechCorp - API Node.js</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #333; min-height: 100vh; padding: 2rem; }
                .container { max-width: 1200px; margin: 0 auto; }
                h1 { color: white; text-align: center; margin-bottom: 2rem; }
                .info-box { background: white; padding: 2rem; border-radius: 8px; margin-bottom: 2rem; box-shadow: 0 5px 20px rgba(0,0,0,0.2); }
                .endpoints { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
                .endpoint { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .endpoint h3 { color: #667eea; margin-bottom: 0.5rem; }
                .method { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 4px; font-weight: bold; color: white; margin-bottom: 0.5rem; }
                .get { background: #61affe; }
                .post { background: #49cc90; }
                .code { background: #f4f4f4; padding: 0.5rem 1rem; border-radius: 4px; font-family: 'Courier New', monospace; margin: 0.5rem 0; overflow-x: auto; font-size: 0.9rem; }
                .link { color: #667eea; text-decoration: none; }
                .link:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1> API Node.js - TechCorp</h1>
                
                <div class="info-box">
                    <h2>Bienvenue sur l'API Node.js</h2>
                    <p>Cette API gère les données de l'entreprise TechCorp. Elle est connectée à une base de données SQLite et exposée via Express.js.</p>
                    <p style="margin-top: 1rem;"><strong>Sous-domaine:</strong> node.localhost</p>
                </div>

                <h2 style="color: white; margin: 2rem 0 1rem;">Endpoints Disponibles</h2>
                
                <div class="endpoints">
                    <div class="endpoint">
                        <h3>Services</h3>
                        <div class="method get">GET</div>
                        <div class="code">/api/services</div>
                        <p>Récupère la liste des services</p>
                    </div>

                    <div class="endpoint">
                        <h3>Service Détail</h3>
                        <div class="method get">GET</div>
                        <div class="code">/api/services/:id</div>
                        <p>Récupère un service spécifique</p>
                    </div>

                    <div class="endpoint">
                        <h3>Contacts</h3>
                        <div class="method get">GET</div>
                        <div class="code">/api/contacts</div>
                        <p>Récupère tous les contacts reçus</p>
                    </div>

                    <div class="endpoint">
                        <h3>Ajouter Contact</h3>
                        <div class="method post">POST</div>
                        <div class="code">/api/contact</div>
                        <p>Crée un nouveau message de contact</p>
                    </div>

                    <div class="endpoint">
                        <h3>Statistiques</h3>
                        <div class="method get">GET</div>
                        <div class="code">/api/stats</div>
                        <p>Obtient les statistiques du site</p>
                    </div>

                    <div class="endpoint">
                        <h3>Santé API</h3>
                        <div class="method get">GET</div>
                        <div class="code">/api/health</div>
                        <p>Vérifie l'état de l'API</p>
                    </div>
                </div>

                <div class="info-box" style="margin-top: 3rem;">
                    <h2>Tests Rapides</h2>
                    <p><a href="/api/services" class="link">Voir les services →</a></p>
                    <p><a href="/api/stats" class="link">Voir les statistiques →</a></p>
                    <p><a href="/api/health" class="link">Vérifier la santé de l'API →</a></p>
                </div>
            </div>
        </body>
        </html>
    `);
});

// API Routes

// GET - Récupérer tous les services
app.get('/api/services', (req, res) => {
    db.all("SELECT * FROM services", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// GET - Récupérer un service par ID
app.get('/api/services/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM services WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Service non trouvé' });
            return;
        }
        res.json(row);
    });
});

// GET - Récupérer tous les contacts
app.get('/api/contacts', (req, res) => {
    db.all("SELECT * FROM contacts ORDER BY created_at DESC", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST - Créer un nouveau contact
app.post('/api/contact', (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        res.status(400).json({ error: 'Champs obligatoires manquants' });
        return;
    }

    db.run(
        "INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)",
        [name, email, phone, subject, message],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({ 
                id: this.lastID, 
                message: 'Contact créé avec succès' 
            });
        }
    );
});

// GET - Statistiques
app.get('/api/stats', (req, res) => {
    db.all("SELECT COUNT(*) as total FROM contacts", (err, contactStats) => {
        db.all("SELECT COUNT(*) as total FROM services", (err, serviceStats) => {
            res.json({
                totalContacts: contactStats[0].total,
                totalServices: serviceStats[0].total,
                lastUpdate: new Date().toISOString()
            });
        });
    });
});

// GET - Vérification de santé
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: 'Node.js API'
    });
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrer le serveur
db.close((err) => {
    if (err) console.error(err);
    db = new sqlite3.Database(path.join(__dirname, 'app-node', 'data.db'));
    
    app.listen(PORT, () => {
        console.log(`Serveur Node.js démarré sur http://localhost:${PORT}`);
        console.log(`API disponible sur http://localhost:${PORT}/api`);
        console.log(`Sous-domaine: node.localhost`);
    });
});