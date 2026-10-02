#!/usr/bin/env bash
# =========================================================
# MA PLACE — Lanceur de tous les tests
#
# Démarre le serveur si nécessaire, exécute chaque script
# de test, puis arrête le serveur qu'il a lancé.
#
# Usage : cd backend && npm test
# =========================================================

set -u
cd "$(dirname "$0")/.."

BASE_URL="${BASE_URL:-http://localhost:3000}"
LOG_FILE="/tmp/maplace-test-server.log"

# Retourne le status HTTP du serveur (000 = injoignable).
server_status() {
    curl -s -m 2 -o /dev/null -w '%{http_code}' "$BASE_URL/" || true
}

CODE=0

if [ "$(server_status)" != "000" ]; then
    # Un serveur tourne déjà : on l'utilise tel quel.
    echo "Serveur déjà actif sur $BASE_URL — tests exécutés dessus."
    echo ""
else
    # Démarre un serveur dédié aux tests.
    echo "Démarrage du serveur pour les tests..."
    node app.js > "$LOG_FILE" 2>&1 &
    SERVER_PID=$!
    trap 'kill "$SERVER_PID" 2>/dev/null' EXIT

    for _ in $(seq 1 20); do
        [ "$(server_status)" != "000" ] && break
        sleep 0.5
    done

    if [ "$(server_status)" = "000" ]; then
        echo "ERREUR : le serveur n'a pas démarré. Journal :"
        cat "$LOG_FILE"
        exit 1
    fi

    echo "Serveur prêt."
    echo ""
fi

# Exécution de tous les scripts de tests.
bash tests/auth.test.sh
CODE=$?

echo ""
bash tests/users.test.sh
USERS_CODE=$?

# Échec global si au moins un script a échoué.
if [ "$USERS_CODE" -ne 0 ]; then
    CODE=1
fi

# Arrête uniquement le serveur lancé par ce script.
if [ -n "${SERVER_PID:-}" ]; then
    kill "$SERVER_PID" 2>/dev/null
    trap - EXIT
    echo ""
    echo "Serveur de test arrêté."
fi

exit "$CODE"
