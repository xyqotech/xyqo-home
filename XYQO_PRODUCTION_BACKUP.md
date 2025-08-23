# XYQO Contract Reader - Version Production Stable
**Date de sauvegarde** : 23/08/2025 08:51  
**Version** : v3.0 - Production Ready  
**Status** : ✅ Entièrement opérationnel avec IA OpenAI

## 🏗️ Architecture Système

### Frontend Next.js
- **Localisation** : `/Users/bassiroudiop/xyqo-home/`
- **Port** : 3000
- **Framework** : Next.js 14.1.0
- **Pages** : 
  - `/` - Page d'accueil XYQO
  - `/contract-reader` - Interface d'analyse contractuelle
  - `/api/sample-contract` - API route pour contrat exemple

### Backend Python
- **Localisation** : `/Users/bassiroudiop/autopilot-demo/`
- **Port** : 8002
- **Fichier principal** : `xyqo_backend.py`
- **Script de démarrage** : `start_xyqo_backend.sh`

## 🔑 Configuration Critique

### Variables d'environnement (.env)
```bash
# OpenAI Configuration - CRITIQUE
OPENAI_API_KEY=sk-proj-PE... # Clé API valide et fonctionnelle

# Database Configuration
DATABASE_URL=postgresql://autopilot:autopilot@localhost:5432/autopilot_db

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true

# Jira Cloud Configuration
JIRA_URL=https://xyqo.atlassian.net
JIRA_EMAIL=admin@xyqo.ai
JIRA_API_TOKEN=ATATT3xFfGF0G5ZDrkZW1EBL...
JIRA_PROJECT_KEY=SCRUM

# Application Configuration
SECRET_KEY=autopilot-secret-key-demo-2024
ENVIRONMENT=development
DEBUG=true

# Security Configuration
CORS_ORIGINS=http://localhost:3000,https://xyqo.ai
```

## 📦 Dépendances Python (requirements.txt)
```
openai>=1.0.0
PyPDF2>=3.0.0
reportlab>=4.0.0
python-dotenv>=1.0.0
```

## 📦 Dépendances Node.js (package.json)
```json
{
  "dependencies": {
    "next": "14.1.0",
    "react": "^18",
    "react-dom": "^18",
    "framer-motion": "^10.16.16",
    "tailwindcss": "^3.4.0",
    "typescript": "^5"
  }
}
```

## 🚀 Commandes de Démarrage

### Backend
```bash
cd /Users/bassiroudiop/autopilot-demo
source venv/bin/activate
./start_xyqo_backend.sh
# OU
python3 xyqo_backend.py
```

### Frontend
```bash
cd /Users/bassiroudiop/xyqo-home
npm run dev
```

## 🧪 Tests de Validation

### Health Check Backend
```bash
curl -s http://localhost:8002/health
# Réponse attendue: {"status": "healthy", "openai_available": true, "version": "3.0"}
```

### Test Analyse Complète
```bash
curl -X POST -F "file=@/Users/bassiroudiop/autopilot-demo/data/samples/contrat_SCF_JAS_WORK4YOU_28022023_01_DIOP_Bassirou.pdf" http://localhost:8002/api/v1/contract/analyze
```

### Test PDF Generation
```bash
# Après analyse, tester le téléchargement PDF
curl -s http://localhost:8002/download/[ANALYSIS_ID].pdf -o test.pdf
file test.pdf
# Réponse attendue: PDF document, version 1.4
```

## 🔧 Fonctionnalités Validées

### ✅ Analyse IA OpenAI
- Extraction PDF avec PyPDF2
- Analyse GPT-4o-mini (12-15 secondes)
- Génération JSON UniversalContractV3
- Identification parties, obligations, risques

### ✅ Génération PDF Professionnelle
- ReportLab intégré
- Format PDF 1.4, multi-pages
- Mise en page avec styles et couleurs
- Sections structurées

### ✅ Interface Utilisateur
- Drag & drop fonctionnel
- Timeout 30 secondes
- Double action PDF (téléchargement + ouverture)
- Gestion d'erreurs complète

## 🗂️ Fichiers Critiques à Sauvegarder

### Backend
- `xyqo_backend.py` - Serveur principal
- `start_xyqo_backend.sh` - Script de démarrage
- `.env` - Configuration environnement
- `requirements.txt` - Dépendances Python
- `data/samples/` - Contrats de test

### Frontend
- `app/contract-reader/page.tsx` - Interface principale
- `app/api/sample-contract/route.ts` - API route
- `package.json` - Configuration Next.js
- `tailwind.config.js` - Configuration styles

## 🔒 Points de Sécurité

1. **Clé OpenAI** : Stockée dans .env, ne jamais commiter
2. **CORS** : Configuré pour localhost:3000
3. **Validation fichiers** : PDF uniquement
4. **Timeout** : 30 secondes pour éviter blocages

## 📊 Métriques de Performance

- **Temps d'analyse** : 12-15 secondes
- **Taille PDF générée** : ~2 pages
- **Extraction texte** : 29k-38k caractères
- **Format sortie** : JSON 3k+ caractères

## 🆘 Procédure de Restauration

1. **Cloner les répertoires** :
   - `/Users/bassiroudiop/xyqo-home/` (Frontend)
   - `/Users/bassiroudiop/autopilot-demo/` (Backend)

2. **Installer les dépendances** :
   ```bash
   # Backend
   cd autopilot-demo
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # Frontend
   cd xyqo-home
   npm install
   ```

3. **Configurer l'environnement** :
   - Copier le fichier `.env` avec la clé OpenAI
   - Vérifier les ports 3000 et 8002 libres

4. **Démarrer les services** :
   - Backend : `./start_xyqo_backend.sh`
   - Frontend : `npm run dev`

5. **Valider le fonctionnement** :
   - Health check : http://localhost:8002/health
   - Interface : http://localhost:3000/contract-reader

## 🏷️ Tags de Version
- `XYQO-v3.0-PRODUCTION`
- `OpenAI-GPT4o-mini-INTEGRATED`
- `PDF-ReportLab-PROFESSIONAL`
- `Frontend-NextJS-MODERN`
- `Backend-Python-STABLE`

---
**⚠️ IMPORTANT** : Cette version est stable et testée. Ne pas modifier sans sauvegarde préalable.
