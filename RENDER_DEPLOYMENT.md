# 🚀 CONFIGURATION RENDER POUR XYQO PRODUCTION

## Variables d'Environnement Requises sur Render

### **Frontend (xyqo-home)**
```bash
NEXT_PUBLIC_API_URL=https://xyqo.ai
NODE_ENV=production
```

### **Backend (xyqo-backend)**
```bash
OPENAI_API_KEY=sk-proj-VOTRE_CLE_PRODUCTION
NODE_ENV=production
PORT=8000
```

## Configuration Build

### **Frontend Build Settings**
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18+
- **Auto-Deploy**: Activé sur push main

### **Backend Build Settings**
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python xyqo_backend.py`
- **Python Version**: 3.11+
- **Port**: 8000 (ou variable PORT)

## Domaines et URLs

### **Configuration DNS**
- **Frontend**: xyqo.ai → Service Render Frontend
- **Backend**: api.xyqo.ai → Service Render Backend
- **HTTPS**: Automatique via Render

### **CORS Configuration Backend**
```python
# Dans xyqo_backend.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://xyqo.ai"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Checklist Déploiement

- [ ] Variables d'environnement configurées sur Render
- [ ] DNS pointant vers les services Render
- [ ] CORS configuré pour xyqo.ai
- [ ] Certificats SSL activés
- [ ] Auto-deploy activé sur push main
- [ ] Tests post-déploiement validés

## Commandes de Test Post-Déploiement

```bash
# Test health backend
curl https://api.xyqo.ai/health

# Test frontend
curl https://xyqo.ai

# Test API complète
curl -X POST https://api.xyqo.ai/api/v1/contract/analyze \
  -F "file=@test.pdf" \
  -H "Accept: application/json"
```

Cette configuration garantit un environnement de production stable et sécurisé.
