# B2B Shop Integration - Documentation

## ✅ Intégration Complétée

### Modifications effectuées

#### 1. Submodule Git
- Repository `xyqotech/lovable-nexus-commerce` ajouté comme submodule dans `apps/b2bShop/`
- Commit dans submodule: configuration `base: '/b2bShop/'` et `basename="/b2bShop"`

#### 2. Configuration Vite (`apps/b2bShop/vite.config.ts`)
```typescript
export default defineConfig(({ mode }) => ({
  base: '/b2bShop/',  // ← CRITIQUE pour servir sous /b2bShop
  // ... reste de la config
}));
```

#### 3. Configuration React Router (`apps/b2bShop/src/App.tsx`)
```typescript
<BrowserRouter basename="/b2bShop">
  {/* Routes */}
</BrowserRouter>
```

#### 4. Pipeline de build (`package.json`)
```json
{
  "scripts": {
    "prebuild": "npm run build:b2bshop",
    "build:b2bshop": "npm --prefix apps/b2bShop ci && npm --prefix apps/b2bShop run build && rm -rf public/b2bShop && mkdir -p public/b2bShop && cp -R apps/b2bShop/dist/* public/b2bShop/"
  }
}
```

#### 5. Next.js Configuration (`next.config.js`)
- **Security Headers** : X-Frame-Options, CSP, Referrer-Policy, etc.
- **CSP élargi** : Support `unsafe-eval` pour Vite, `blob:` pour images, Supabase wildcard
- **Cache immutable** : Assets `/b2bShop/*.{js,css,woff2,png,jpg,svg}`
- **Redirect 301** : `/b2bshop/*` → `/b2bShop/*` (normalisation casse)

#### 6. TypeScript (`tsconfig.json`)
```json
{
  "exclude": ["node_modules", "apps/b2bShop"]
}
```
→ Évite conflits de types entre Next.js et le submodule Vite

### Fichiers modifiés
- ✅ `.gitmodules` - Configuration submodule
- ✅ `apps/b2bShop/vite.config.ts` - Base path
- ✅ `apps/b2bShop/src/App.tsx` - Router basename
- ✅ `package.json` - Scripts build
- ✅ `next.config.js` - Headers/CSP/Redirects
- ✅ `tsconfig.json` - Exclusions
- ✅ `.gitignore` - Ajustements

### Build vérifié
```bash
✓ npm run build:b2bshop  # Vite build → public/b2bShop/
✓ npm run build          # Next.js build réussi
✓ public/b2bShop/ peuplé avec index.html + assets/
```

## 📋 Variables d'environnement Vercel

Configurer dans **Vercel Dashboard → Settings → Environment Variables (Production)** :

| Variable | Valeur |
|----------|--------|
| `VITE_SUPABASE_URL` | `https://oyepmayyvoblfwjsoxcg.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `<VOTRE_ANON_KEY>` ⚠️ Anon key uniquement |
| `VITE_SUPABASE_FN_URL` | `https://oyepmayyvoblfwjsoxcg.supabase.co/functions/v1` |

## 🔧 Configuration Supabase

Dashboard Supabase → **Authentication → URL Configuration** :

- **Allowed Origins (CORS)** : `https://www.xyqo.ai`
- **Redirect URLs** : `https://www.xyqo.ai/b2bShop/*` (si Magic Link/OAuth)

## 🚀 Déploiement

### Push vers Vercel
```bash
git add .
git commit -m "feat(b2bShop): integrate Lovable under /b2bShop with enterprise headers"
git push origin feat/b2bshop-integrate
```

### Build Vercel
Vercel exécutera automatiquement :
1. `prebuild` → Construit le SPA Vite dans `public/b2bShop/`
2. `next build` → Construit Next.js
3. Déploiement sur `https://www.xyqo.ai`

### Tests post-déploiement

```bash
# URLs doivent répondre 200
curl -I https://www.xyqo.ai/b2bShop
curl -I https://www.xyqo.ai/b2bShop/checkout
curl -I https://www.xyqo.ai/b2bShop/products

# Redirect minuscule → camelCase (301)
curl -I https://www.xyqo.ai/b2bshop

# Contract Reader intact
curl -I https://www.xyqo.ai/contract-reader
```

### Vérifications navigateur
- Ouvrir https://www.xyqo.ai/b2bShop en navigation privée
- DevTools → Console : **0 erreur CORS/CSP**
- DevTools → Network → Assets `/b2bShop/assets/*` :  
  `Cache-Control: public, max-age=31536000, immutable`
- Routes SPA (checkout, products, etc.) fonctionnent sans 404

## 📝 Notes techniques

### Pourquoi submodule ?
- Garde lovable-nexus-commerce indépendant
- Permet updates du shop sans toucher xyqo-home
- Option "vendored" disponible si Vercel refuse submodules

### Gestion routing SPA
- **Vite** génère les assets avec `base: '/b2bShop/'`
- **React Router** gère les routes avec `basename="/b2bShop"`
- **Vercel** sert automatiquement `public/b2bShop/*` comme fichiers statiques
- Le SPA gère son propre routing client-side (pas de rewrites Next.js nécessaires)

### CSP stricte mais permissive
- `unsafe-eval` requis pour Vite/React HMR et runtime
- `unsafe-inline` pour styles inline (Tailwind, emotion, etc.)
- `blob:` pour images générées dynamiquement
- Wildcard Supabase (`*.supabase.co`, `*.supabase.in`) pour tous les services

## ⚠️ Troubleshooting

### 404 sur routes profondes
→ Vérifier `base: '/b2bShop/'` dans vite.config.ts  
→ Vérifier `basename="/b2bShop"` dans App.tsx  
→ Rebuilder : `npm run build:b2bshop`

### Erreurs CORS
→ Ajouter `https://www.xyqo.ai` dans Supabase Allowed Origins

### Assets non trouvés
→ Vérifier que `public/b2bShop/assets/` existe après build  
→ Vérifier chemins dans `public/b2bShop/index.html` commencent par `/b2bShop/`

### Submodule vide après clone
```bash
git submodule update --init --recursive
```

## 🎯 Résumé

- ✅ **Branche** : `feat/b2bshop-integrate`
- ✅ **Build** : Réussi (Vite → 692kB bundle, Next.js optimisé)
- ✅ **Structure** : SPA dans `public/b2bShop/`, submodule `apps/b2bShop/`
- ✅ **Config** : CSP enterprise-grade, headers sécurité, redirects 301
- ✅ **Backward compat** : `/contract-reader` intact, aucun changement

**Status** : Prêt pour merge et déploiement Vercel 🚀
