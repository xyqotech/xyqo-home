# 🧪 WORKFLOW DE TEST XYQO - OBLIGATOIRE

## 🎯 RÈGLE ABSOLUE : TESTS LOCAUX D'ABORD

**TOUJOURS tester en local avant déploiement :**
1. ✅ **Frontend local** + **Backend local**
2. ✅ **Validation complète** avant tout push
3. ✅ **Après déploiement** : Tests production

---

## 📋 PROCÉDURE DE TEST LOCAL OBLIGATOIRE

### **Étape 1 : Démarrage Local**

#### Backend (Port 8002)
```bash
cd /Users/bassiroudiop/xyqo-backend
source venv/bin/activate
python3 xyqo_backend.py
```
✅ Vérifier : `curl http://localhost:8002/health`

#### Frontend (Port 3003)
```bash
cd /Users/bassiroudiop/xyqo-home
npm run dev
```
✅ Accès : http://localhost:3003/contract-reader

---

### **Étape 2 : Tests Bout en Bout Local**

#### Test 1 : Upload et Analyse
- [ ] Upload contrat PDF via interface locale
- [ ] Vérification analyse IA complète
- [ ] Validation structure JSON UniversalContractV3
- [ ] Contrôle mapping `summary_plain`

#### Test 2 : Génération PDF
- [ ] Test téléchargement PDF backend
- [ ] Validation résumé Board-Ready V2.3
- [ ] Vérification 9 rubriques universelles
- [ ] Contrôle formatage structuré

#### Test 3 : Intégration Frontend/Backend
- [ ] Communication API locale fonctionnelle
- [ ] Gestion erreurs et timeouts
- [ ] Affichage résultats dans l'interface
- [ ] Fallback PDF si backend indisponible

---

### **Étape 3 : Validation Avant Déploiement**

#### Checklist Obligatoire
- [ ] **Tous les tests locaux passent** ✅
- [ ] **Aucune erreur console** ✅
- [ ] **Performance acceptable** (< 30s analyse) ✅
- [ ] **PDF généré lisible** ✅
- [ ] **Données sensibles masquées** ✅

#### Documentation
- [ ] Résultats de test documentés
- [ ] Screenshots des PDFs générés
- [ ] Logs d'erreur analysés
- [ ] Performance mesurée

---

### **Étape 4 : Tests Production Post-Déploiement**

#### Frontend Production → Backend Production
- [ ] Test upload contrat réel
- [ ] Validation analyse IA production
- [ ] Contrôle génération PDF
- [ ] Monitoring performances
- [ ] Vérification logs erreur

#### Environnements de Test
- **Local** : http://localhost:3003 → http://localhost:8002
- **Production** : https://xyqo.ai → https://api.xyqo.ai

---

## ⚠️ RÈGLES STRICTES

### ❌ INTERDICTIONS
- **JAMAIS déployer** sans tests locaux complets
- **JAMAIS pousser** de données de test en production
- **JAMAIS ignorer** les erreurs de test local

### ✅ OBLIGATIONS
- **TOUJOURS** tester frontend + backend ensemble
- **TOUJOURS** valider les PDFs générés
- **TOUJOURS** documenter les résultats

---

## 🚀 COMMANDES RAPIDES

### Démarrage Complet Local
```bash
# Terminal 1 - Backend
cd /Users/bassiroudiop/xyqo-backend && source venv/bin/activate && python3 xyqo_backend.py

# Terminal 2 - Frontend  
cd /Users/bassiroudiop/xyqo-home && npm run dev
```

### Tests API Rapides
```bash
# Health check
curl http://localhost:8002/health

# Test analyse
curl -X POST http://localhost:8002/api/v1/contract/analyze \
  -F "file=@test_contract.pdf" \
  -H "Content-Type: multipart/form-data"
```

---

**Cette procédure garantit la stabilité et évite les régressions en production.**
