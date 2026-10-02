#!/usr/bin/env bash
# =========================================================
# MA PLACE — Tests de l'étape 4 : Services
#
# Usage :
#   cd backend && npm test                  (tout, serveur auto)
#   ou npm run test:services                (serveur déjà lancé)
# =========================================================

. "$(dirname "$0")/helpers.sh"

echo "== Tests Services sur $BASE_URL =="

EMAIL_A="test.serv.$RANDOM@maplace.com"
EMAIL_B="test.serv.$RANDOM@maplace.com"

# --- Fixtures : deux gestionnaires + leurs établissements --------
R=$(request POST /api/auth/register "{\"name\":\"Manager A\",\"email\":\"$EMAIL_A\",\"password\":\"secret123\"}" "")
check_status "Fixture : register A" 201 "$(echo "$R" | tail -n1)"
TOKEN_A=$(json_field "$R" data.token)

R=$(request POST /api/auth/register "{\"name\":\"Manager B\",\"email\":\"$EMAIL_B\",\"password\":\"secret123\"}" "")
check_status "Fixture : register B" 201 "$(echo "$R" | tail -n1)"
TOKEN_B=$(json_field "$R" data.token)

R=$(request GET /api/categories "" "$TOKEN_A")
CATEGORY_ID=$(json_field "$R" data.categories.0.id)

R=$(request POST /api/establishments "{\"name\":\"Étab Services A\",\"address\":\"Brazzaville\",\"category_id\":\"$CATEGORY_ID\"}" "$TOKEN_A")
check_status "Fixture : établissement A" 201 "$(echo "$R" | tail -n1)"
ESTAB_A=$(json_field "$R" data.establishment.id)

R=$(request POST /api/establishments "{\"name\":\"Étab Services B\",\"address\":\"Pointe-Noire\",\"category_id\":\"$CATEGORY_ID\"}" "$TOKEN_B")
check_status "Fixture : établissement B" 201 "$(echo "$R" | tail -n1)"
ESTAB_B=$(json_field "$R" data.establishment.id)

# --- POST services ------------------------------------------------
R=$(request POST "/api/establishments/$ESTAB_A/services" '{"name":"Guichet 1","description":"Actes d’état civil"}' "$TOKEN_A")
check_status "POST service valide" 201 "$(echo "$R" | tail -n1)"
SERVICE_A=$(json_field "$R" data.service.id)

R=$(request POST "/api/establishments/$ESTAB_A/services" '{"name":"Guichet 2"}' "$TOKEN_A")
check_status "Fixture : deuxième service" 201 "$(echo "$R" | tail -n1)"
SERVICE_A2=$(json_field "$R" data.service.id)

R=$(request POST "/api/establishments/$ESTAB_B/services" '{"name":"Coupe homme"}' "$TOKEN_B")
check_status "Fixture : service de B" 201 "$(echo "$R" | tail -n1)"
SERVICE_B=$(json_field "$R" data.service.id)

R=$(request POST "/api/establishments/$ESTAB_A/services" '{"description":"Sans nom"}' "$TOKEN_A")
check_status "POST sans nom" 400 "$(echo "$R" | tail -n1)"

R=$(request POST "/api/establishments/$ESTAB_A/services" '{"name":"Guichet 1"}' "$TOKEN_A")
check_status "POST nom en doublon dans l'établissement" 409 "$(echo "$R" | tail -n1)"

R=$(request POST "/api/establishments/00000000-0000-4000-8000-000000000000/services" '{"name":"X"}' "$TOKEN_A")
check_status "POST établissement inexistant" 404 "$(echo "$R" | tail -n1)"

R=$(request POST "/api/establishments/$ESTAB_B/services" '{"name":"Piratage"}' "$TOKEN_A")
check_status "POST sur établissement d'un autre" 403 "$(echo "$R" | tail -n1)"

R=$(request POST "/api/establishments/$ESTAB_A/services" '{"name":"Anonyme"}' "")
check_status "POST sans token" 401 "$(echo "$R" | tail -n1)"

# --- GET services -------------------------------------------------
R=$(request GET "/api/establishments/$ESTAB_A/services" "" "$TOKEN_A")
check_status "GET liste services" 200 "$(echo "$R" | tail -n1)"
check_body "GET liste contient Guichet 1" "$(echo "$R" | head -n1)" "Guichet 1"
if echo "$(echo "$R" | head -n1)" | grep -q "Coupe homme"; then
    echo "FAIL  GET liste ne contient PAS les services des autres"
    FAIL=$((FAIL + 1))
else
    echo "PASS  GET liste ne contient PAS les services des autres"
    PASS=$((PASS + 1))
fi

R=$(request GET "/api/establishments/$ESTAB_B/services" "" "$TOKEN_A")
check_status "GET liste établissement d'un autre" 403 "$(echo "$R" | tail -n1)"

R=$(request GET "/api/establishments/$ESTAB_A/services/$SERVICE_A" "" "$TOKEN_A")
check_status "GET détail (mon service)" 200 "$(echo "$R" | tail -n1)"

R=$(request GET "/api/establishments/$ESTAB_A/services/$SERVICE_B" "" "$TOKEN_A")
check_status "GET service d'un autre établissement" 404 "$(echo "$R" | tail -n1)"

R=$(request GET "/api/establishments/$ESTAB_A/services/00000000-0000-4000-8000-000000000000" "" "$TOKEN_A")
check_status "GET service inexistant" 404 "$(echo "$R" | tail -n1)"

# --- PATCH services -----------------------------------------------
R=$(request PATCH "/api/establishments/$ESTAB_A/services/$SERVICE_A" '{"name":"Guichet état civil"}' "$TOKEN_A")
check_status "PATCH (mon service)" 200 "$(echo "$R" | tail -n1)"
check_body "PATCH applique le nouveau nom" "$(echo "$R" | head -n1)" "Guichet état civil"

R=$(request PATCH "/api/establishments/$ESTAB_A/services/$SERVICE_A" '{"name":"Guichet 2"}' "$TOKEN_A")
check_status "PATCH nom déjà pris" 409 "$(echo "$R" | tail -n1)"

R=$(request PATCH "/api/establishments/$ESTAB_A/services/$SERVICE_A" '{"name":"   "}' "$TOKEN_A")
check_status "PATCH nom vide" 400 "$(echo "$R" | tail -n1)"

R=$(request PATCH "/api/establishments/$ESTAB_A/services/$SERVICE_A" '{}' "$TOKEN_A")
check_status "PATCH sans données" 400 "$(echo "$R" | tail -n1)"

R=$(request PATCH "/api/establishments/$ESTAB_B/services/$SERVICE_B" '{"name":"Piratage"}' "$TOKEN_A")
check_status "PATCH service d'un autre" 403 "$(echo "$R" | tail -n1)"

R=$(request PATCH "/api/establishments/$ESTAB_A/services/$SERVICE_A" '{"name":"X"}' "")
check_status "PATCH sans token" 401 "$(echo "$R" | tail -n1)"

# --- PATCH status --------------------------------------------------
R=$(request PATCH "/api/establishments/$ESTAB_A/services/$SERVICE_A2/status" '{"status":"oui"}' "$TOKEN_A")
check_status "Status valeur invalide" 400 "$(echo "$R" | tail -n1)"

R=$(request PATCH "/api/establishments/$ESTAB_A/services/$SERVICE_A2/status" '{"status":false}' "$TOKEN_A")
check_status "Status → false (désactivé)" 200 "$(echo "$R" | tail -n1)"
check_body "Statut false appliqué" "$(echo "$R" | head -n1)" '"status":false'

R=$(request PATCH "/api/establishments/$ESTAB_A/services/$SERVICE_A2/status" '{"status":true}' "$TOKEN_A")
check_status "Status → true (activé)" 200 "$(echo "$R" | tail -n1)"

# --- DELETE services ------------------------------------------------
R=$(request DELETE "/api/establishments/$ESTAB_B/services/$SERVICE_B" "" "$TOKEN_A")
check_status "DELETE service d'un autre" 403 "$(echo "$R" | tail -n1)"

R=$(request DELETE "/api/establishments/$ESTAB_A/services/$SERVICE_A" "" "")
check_status "DELETE sans token" 401 "$(echo "$R" | tail -n1)"

R=$(request DELETE "/api/establishments/$ESTAB_A/services/$SERVICE_A2" "" "$TOKEN_A")
check_status "DELETE (mon service)" 200 "$(echo "$R" | tail -n1)"

R=$(request GET "/api/establishments/$ESTAB_A/services/$SERVICE_A2" "" "$TOKEN_A")
check_status "GET après suppression → 404" 404 "$(echo "$R" | tail -n1)"

# --- Nettoyage -------------------------------------------------------
summary
CODE=$?
[ -n "$TOKEN_A" ] && delete_user "$EMAIL_A"
[ -n "$TOKEN_B" ] && delete_user "$EMAIL_B"
exit $CODE
