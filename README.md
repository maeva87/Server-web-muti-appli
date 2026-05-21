# Serveur Web Multi-Application - TechCorp

Architecture Docker simple avec site statique (Nginx) et API Node.js avec base de données SQLite.

## Applications

| App | Technologie | URL | Description |
|-----|-----------|-----|-------------|
| Site Statique | Nginx + HTML/CSS/JS | http://localhost:8080 | Site d'entreprise complet |
| API | Node.js + Express + SQLite | http://localhost:3000 | API REST avec gestion des services |

## Contenu

### Site Statique (Nginx)
- 4 pages : Accueil, Services, À Propos, Contact
- Design responsif : CSS moderne avec gradient et animations
- Navigation dynamique : SPA sans rechargement
- Formulaire de contact : Intégré avec l'API Node.js
- 6 services présentés

Fichiers : app-static/index.html, css/style.css, js/app.js

### API Node.js
- 6 endpoints REST :
  - GET /api/services - Liste des services
  - GET /api/services/:id - Service détail
  - POST /api/contact - Créer un contact
  - GET /api/contacts - Tous les contacts
  - GET /api/stats - Statistiques
  - GET /api/health - Vérifier l'état

- Base de données SQLite : Auto-créée avec services pré-remplis
- Interface web : Dashboard pour découvrir l'API
- CORS activé : Connexion avec le site statique

Fichiers : app-node/serve.js, package.json

## Démarrage Rapide

### 1 - Installer les dépendances Node.js

```bash
npm install app-node/
```

### 2 - Démarrer avec Docker Compose

```bash
docker-compose up -d
```

### 3 - Accéder aux applications

```
Site Statique : http://localhost:8080
API Node.js   : http://localhost:3000
```

## Endpoints API

### GET - Récupérer les services
```bash
curl http://localhost:3000/api/services
```

Réponse:
```json
[
  {
    "id": 1,
    "name": "Développement Web",
    "description": "Création de sites web modernes...",
    "price": 5000
  }
]
```

### POST - Créer un contact
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "phone": "+33612345678",
    "subject": "Devis",
    "message": "Je suis intéressé"
  }'
```

### GET - Voir les statistiques
```bash
curl http://localhost:3000/api/stats
```

## Base de Données

Créée automatiquement avec :
- Table services : 6 services pré-remplis
- Table contacts : Messages de contact reçus

Fichier : app-node/data.db

Fichier : `app-node/data.db`

## Structure

```
server-web-muti-appli/
├── app-static/              # Site Nginx
│   ├── index.html          # 4 pages intégrées
│   ├── css/style.css       # Design complet
│   └── js/app.js           # Navigation + appels API
├── app-node/                # API Node.js
│   ├── serve.js            # API Express
│   ├── Dockerfile
│   ├── package.json
│   └── data.db             # Base de données (créée auto)
├── nginx/conf.d/           # Config Nginx
├── docker-compose.yml      # Orchestration
└── README.md               # Cette doc
```

## Commandes Utiles

```bash
# Voir les logs
docker-compose logs -f app-node

# Arrêter les services
docker-compose stop

# Redémarrer
docker-compose restart

# Supprimer et nettoyer
docker-compose down
```

## Tests Rapides

```bash
# Health check
curl http://localhost:3000/api/health

# Services
curl http://localhost:3000/api/services

# Site statique
curl http://localhost:8080
```

## Technologies

- Frontend : HTML5, CSS3, JavaScript vanilla
- Backend : Node.js, Express.js, SQLite3
- Serveur Web : Nginx
- Docker : Docker Compose

---

Projet YNOV - B1 | Sujet 4