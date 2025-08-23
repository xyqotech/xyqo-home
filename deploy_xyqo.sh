#!/bin/bash
# XYQO Contract Reader - Script de Déploiement Automatisé
# Version: v3.0 Production
# Date: 23/08/2025

set -e  # Arrêter en cas d'erreur

echo "🚀 XYQO Contract Reader - Déploiement Automatisé v3.0"
echo "=================================================="

# Variables de configuration
FRONTEND_DIR="/Users/bassiroudiop/xyqo-home"
BACKEND_DIR="/Users/bassiroudiop/autopilot-demo"
FRONTEND_PORT=3000
BACKEND_PORT=8002

# Fonction de vérification des prérequis
check_prerequisites() {
    echo "🔍 Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js non trouvé. Installation requise."
        exit 1
    fi
    
    # Vérifier Python3
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python3 non trouvé. Installation requise."
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        echo "❌ npm non trouvé. Installation requise."
        exit 1
    fi
    
    echo "✅ Prérequis validés"
}

# Fonction de vérification des ports
check_ports() {
    echo "🔍 Vérification des ports..."
    
    if lsof -ti:$FRONTEND_PORT > /dev/null; then
        echo "⚠️  Port $FRONTEND_PORT occupé. Arrêt du processus..."
        kill -9 $(lsof -ti:$FRONTEND_PORT) 2>/dev/null || true
    fi
    
    if lsof -ti:$BACKEND_PORT > /dev/null; then
        echo "⚠️  Port $BACKEND_PORT occupé. Arrêt du processus..."
        kill -9 $(lsof -ti:$BACKEND_PORT) 2>/dev/null || true
    fi
    
    echo "✅ Ports libérés"
}

# Fonction de déploiement du backend
deploy_backend() {
    echo "🔧 Déploiement du backend..."
    
    cd "$BACKEND_DIR"
    
    # Créer l'environnement virtuel si nécessaire
    if [ ! -d "venv" ]; then
        echo "📦 Création de l'environnement virtuel Python..."
        python3 -m venv venv
    fi
    
    # Activer l'environnement virtuel
    source venv/bin/activate
    
    # Installer les dépendances
    echo "📦 Installation des dépendances Python..."
    pip install -q openai PyPDF2 reportlab python-dotenv
    
    # Vérifier la clé OpenAI
    if [ ! -f ".env" ]; then
        echo "❌ Fichier .env manquant. Configuration requise."
        exit 1
    fi
    
    if ! grep -q "OPENAI_API_KEY=sk-" .env; then
        echo "❌ Clé OpenAI manquante dans .env. Configuration requise."
        exit 1
    fi
    
    # Démarrer le backend en arrière-plan
    echo "🚀 Démarrage du backend sur port $BACKEND_PORT..."
    nohup python3 xyqo_backend.py > backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Attendre que le backend soit prêt
    echo "⏳ Attente du démarrage du backend..."
    for i in {1..30}; do
        if curl -s http://localhost:$BACKEND_PORT/health > /dev/null; then
            echo "✅ Backend démarré avec succès (PID: $BACKEND_PID)"
            break
        fi
        sleep 1
    done
    
    # Vérifier le statut OpenAI
    HEALTH_RESPONSE=$(curl -s http://localhost:$BACKEND_PORT/health)
    if echo "$HEALTH_RESPONSE" | grep -q '"openai_available": true'; then
        echo "✅ OpenAI intégration validée"
    else
        echo "⚠️  OpenAI non disponible - vérifier la clé API"
    fi
}

# Fonction de déploiement du frontend
deploy_frontend() {
    echo "🎨 Déploiement du frontend..."
    
    cd "$FRONTEND_DIR"
    
    # Installer les dépendances
    echo "📦 Installation des dépendances Node.js..."
    npm install --silent
    
    # Démarrer le frontend en arrière-plan
    echo "🚀 Démarrage du frontend sur port $FRONTEND_PORT..."
    nohup npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Attendre que le frontend soit prêt
    echo "⏳ Attente du démarrage du frontend..."
    for i in {1..60}; do
        if curl -s http://localhost:$FRONTEND_PORT > /dev/null; then
            echo "✅ Frontend démarré avec succès (PID: $FRONTEND_PID)"
            break
        fi
        sleep 1
    done
}

# Fonction de tests de validation
run_tests() {
    echo "🧪 Tests de validation..."
    
    # Test health check backend
    echo "🔍 Test health check backend..."
    HEALTH_RESPONSE=$(curl -s http://localhost:$BACKEND_PORT/health)
    if echo "$HEALTH_RESPONSE" | grep -q '"status": "healthy"'; then
        echo "✅ Backend health check OK"
    else
        echo "❌ Backend health check FAILED"
        exit 1
    fi
    
    # Test frontend
    echo "🔍 Test frontend..."
    if curl -s http://localhost:$FRONTEND_PORT > /dev/null; then
        echo "✅ Frontend accessible OK"
    else
        echo "❌ Frontend FAILED"
        exit 1
    fi
    
    # Test contract reader page
    echo "🔍 Test Contract Reader page..."
    if curl -s http://localhost:$FRONTEND_PORT/contract-reader > /dev/null; then
        echo "✅ Contract Reader page OK"
    else
        echo "❌ Contract Reader page FAILED"
        exit 1
    fi
}

# Fonction d'affichage du statut final
show_status() {
    echo ""
    echo "🎉 DÉPLOIEMENT XYQO TERMINÉ AVEC SUCCÈS!"
    echo "========================================"
    echo ""
    echo "📊 Services actifs:"
    echo "  🔧 Backend:  http://localhost:$BACKEND_PORT"
    echo "  🎨 Frontend: http://localhost:$FRONTEND_PORT"
    echo ""
    echo "🔗 Accès utilisateur:"
    echo "  📄 Contract Reader: http://localhost:$FRONTEND_PORT/contract-reader"
    echo "  🏠 Page d'accueil:   http://localhost:$FRONTEND_PORT"
    echo ""
    echo "📋 Logs:"
    echo "  Backend: $BACKEND_DIR/backend.log"
    echo "  Frontend: $FRONTEND_DIR/frontend.log"
    echo ""
    echo "🛑 Pour arrêter les services:"
    echo "  pkill -f xyqo_backend"
    echo "  pkill -f 'npm run dev'"
    echo ""
    echo "✅ Système XYQO v3.0 opérationnel!"
}

# Fonction principale
main() {
    check_prerequisites
    check_ports
    deploy_backend
    deploy_frontend
    sleep 5  # Attendre stabilisation
    run_tests
    show_status
}

# Gestion des erreurs
trap 'echo "❌ Erreur durant le déploiement. Vérifiez les logs."; exit 1' ERR

# Exécution
main "$@"
