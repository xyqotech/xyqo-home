# XYQO Contract Reader - Guide de Restauration
**Version sauvegardée** : v3.0 Production  
**Archive** : `xyqo-contract-reader-v3.0-20250823-085254.tar.gz` (488 MB)  
**Date** : 23/08/2025 08:52

## 🔄 Restauration Rapide

### 1. Extraire l'archive
```bash
cd /Users/bassiroudiop
tar -xzf xyqo-contract-reader-v3.0-20250823-085254.tar.gz
```

### 2. Déploiement automatique
```bash
cd xyqo-home
./deploy_xyqo.sh
```

### 3. Vérification
- Backend : http://localhost:8002/health
- Frontend : http://localhost:3000/contract-reader

## 🛠️ Restauration Manuelle

### Backend
```bash
cd /Users/bassiroudiop/autopilot-demo
source venv/bin/activate
pip install openai PyPDF2 reportlab python-dotenv
./start_xyqo_backend.sh
```

### Frontend
```bash
cd /Users/bassiroudiop/xyqo-home
npm install
npm run dev
```

## 🔑 Configuration Critique

### Fichier .env requis
```bash
OPENAI_API_KEY=sk-proj-PE... # OBLIGATOIRE
DATABASE_URL=postgresql://autopilot:autopilot@localhost:5432/autopilot_db
REDIS_URL=redis://localhost:6379
# ... autres variables
```

## ✅ Tests de Validation

```bash
# Health check
curl -s http://localhost:8002/health

# Test analyse
curl -X POST -F "file=@data/samples/contrat_SCF_JAS_WORK4YOU_28022023_01_DIOP_Bassirou.pdf" http://localhost:8002/api/v1/contract/analyze

# Test PDF
curl -s http://localhost:8002/download/[ID].pdf -o test.pdf && file test.pdf
```

## 🆘 Support

En cas de problème :
1. Vérifier les logs : `backend.log` et `frontend.log`
2. Contrôler les ports 3000 et 8002
3. Valider la clé OpenAI dans `.env`
4. Consulter `XYQO_PRODUCTION_BACKUP.md`

---
**Cette version est figée et testée. Utiliser cette archive pour toute restauration.**
