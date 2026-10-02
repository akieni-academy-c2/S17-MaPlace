#!/usr/bin/env bash
# =========================================================
# MA PLACE — Fonctions partagées des scripts de test
#
# À sourcer depuis un script de tests :
#   . "$(dirname "$0")/helpers.sh"
# =========================================================

# Se place à la racine du backend quel que soit le dossier d'appel.
cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

BASE_URL="${BASE_URL:-http://localhost:3000}"
PASS=0
FAIL=0

# Vérifie qu'un status HTTP est bien retourné.
#
# $1 : nom du cas, $2 : status attendu, $3 : status obtenu
check_status() {
    if [ "$3" = "$2" ]; then
        echo "PASS  $1 (HTTP $3)"
        PASS=$((PASS + 1))
    else
        echo "FAIL  $1 (attendu $2, obtenu $3)"
        FAIL=$((FAIL + 1))
    fi
}

# Vérifie qu'une chaîne est présente dans une réponse.
#
# $1 : nom du cas, $2 : corps de la réponse, $3 : chaîne attendue
check_body() {
    if echo "$2" | grep -q "$3"; then
        echo "PASS  $1"
        PASS=$((PASS + 1))
    else
        echo "FAIL  $1 (« $3 » absent de la réponse)"
        FAIL=$((FAIL + 1))
    fi
}

# Effectue une requête HTTP et retourne "corps\nstatus".
#
# $1 : méthode, $2 : chemin, $3 : données JSON (vide si aucune), $4 : token Bearer (vide si aucun)
request() {
    local method="$1" path="$2" data="$3" token="$4"
    local args=(-s -w '\n%{http_code}' -X "$method" "$BASE_URL$path")

    [ -n "$data" ] && args+=(-H 'Content-Type: application/json' -d "$data")
    [ -n "$token" ] && args+=(-H "Authorization: Bearer $token")

    curl "${args[@]}"
}

# Extrait une valeur d'une réponse JSON par chemin pointé.
#
# $1 : corps de la réponse (1re ligne), $2 : chemin ex. "data.token"
# @returns {string} Valeur trouvée ou chaîne vide.
json_field() {
    echo "$1" | head -n1 | node -e "
        let d = '';
        process.stdin.on('data', c => d += c).on('end', () => {
            try {
                let value = JSON.parse(d);
                for (const key of process.argv[1].split('.')) value = value[key];
                console.log(value ?? '');
            } catch {
                console.log('');
            }
        });
    " "$2"
}

# Nettoie un utilisateur de test créé pendant le script.
#
# $1 : email de l'utilisateur à supprimer
delete_user() {
    node --input-type=module -e "
        import 'dotenv/config';
        import pool from './src/config/database.js';
        const r = await pool.query('DELETE FROM users WHERE email = \$1', ['$1']);
        console.log('Utilisateur de test supprimé :', r.rowCount);
        await pool.end();
    " || echo "(nettoyage ignoré)"
}

# Affiche le résumé des tests.
#
# @returns {number} Code 0 si tous les tests passent.
summary() {
    echo ""
    echo "== Résumé : $PASS réussi(s), $FAIL échoué(s) =="
    [ "$FAIL" -eq 0 ]
}

# Retourne le status HTTP du serveur (000 = injoignable).
#
# @returns {number} Status HTTP ou 000.
server_status() {
    curl -s -m 2 -o /dev/null -w '%{http_code}' "$BASE_URL/" || true
}

# Vérifie que le serveur est démarré avant les tests.
# Affiche une consigne claire et sort avec un code d'erreur sinon.
require_server() {
    if [ "$(server_status)" = "000" ]; then
        echo "ERREUR : le serveur ne répond pas sur $BASE_URL."
        echo ""
        echo "Les tests ont besoin du serveur démarré. Deux solutions :"
        echo ""
        echo "  A) Test complet (recommandé, démarre le serveur tout seul) :"
        echo "         cd backend && npm test"
        echo ""
        echo "  B) Serveur lancé à la main :"
        echo "         terminal 1 : cd backend && npm run dev"
        echo "         terminal 2 : npm run test:auth   (ou test:users)"
        echo ""
        echo "Statut HTTP obtenu : $(server_status) (000 = connexion refusée)"
        exit 1
    fi
}

# Contrôle automatique au chargement des helpers.
require_server
