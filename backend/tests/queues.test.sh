#!/usr/bin/env bash
# =========================================================
# MA PLACE — Tests de l'étape 5 : Files d'attente
#
# Usage :
#   cd backend && npm test                  (tout, serveur auto)
#   ou npm run test:queues                 (serveur déjà lancé)
# =========================================================

. "$(dirname "$0")/helpers.sh"

echo "== Tests Files d'attente sur $BASE_URL =="

EMAIL_Q="test.queue.$RANDOM@maplace.com"
EMAIL_O="test.queue.other.$RANDOM@maplace.com"

# --- Fixtures : un gestionnaire, une catégorie, un établissement, un service ---
R=$(request POST /api/auth/register "{\"name\":\"Manager File\",\"email\":\"$EMAIL_Q\",\"password\":\"secret123\"}" "")
check_status "Fixture : register gestionnaire" 201 "$(echo "$R" | tail -n1)"
TOKEN_Q=$(json_field "$R" data.token)

R=$(request POST /api/auth/register "{\"name\":\"Manager Autre\",\"email\":\"$EMAIL_O\",\"password\":\"secret123\"}" "")
check_status "Fixture : register autre gestionnaire" 201 "$(echo "$R" | tail -n1)"
TOKEN_O=$(json_field "$R" data.token)

R=$(request GET /api/categories "" "$TOKEN_Q")
CATEGORY_ID=$(json_field "$R" data.categories.0.id)

R=$(request POST /api/establishments "{\"name\":\"Étab File\",\"address\":\"Brazzaville\",\"category_id\":\"$CATEGORY_ID\"}" "$TOKEN_Q")
check_status "Fixture : établissement" 201 "$(echo "$R" | tail -n1)"
ESTAB=$(json_field "$R" data.establishment.id)

R=$(request GET /api/categories "" "$TOKEN_O")
CATEGORY_O=$(json_field "$R" data.categories.0.id)

R=$(request POST /api/establishments "{\"name\":\"Étab File Autre\",\"address\":\"Pointe-Noire\",\"category_id\":\"$CATEGORY_O\"}" "$TOKEN_O")
check_status "Fixture : établissement autre" 201 "$(echo "$R" | tail -n1)"
ESTAB_O=$(json_field "$R" data.establishment.id)

R=$(request POST "/api/establishments/$ESTAB/services" '{"name":"Guichet File","description":"File de test"}' "$TOKEN_Q")
check_status "Fixture : service" 201 "$(echo "$R" | tail -n1)"
SERVICE=$(json_field "$R" data.service.id)

R=$(request POST "/api/establishments/$ESTAB_O/services" '{"name":"Coupe File"}' "$TOKEN_O")
check_status "Fixture : service autre" 201 "$(echo "$R" | tail -n1)"
SERVICE_O=$(json_field "$R" data.service.id)

# --- POST : ouvrir la file du jour --------------------------------
R=$(request POST "/api/establishments/$ESTAB/services/$SERVICE/queue" "" "$TOKEN_Q")
check_status "POST ouvrir la file du jour" 201 "$(echo "$R" | tail -n1)"
QUEUE=$(json_field "$R" data.queue.id)

R=$(request POST "/api/establishments/$ESTAB/services/$SERVICE/queue" "" "$TOKEN_Q")
check_status "POST file déjà ouverte → 409" 409 "$(echo "$R" | tail -n1)"

R=$(request POST "/api/establishments/$ESTAB/services/$SERVICE/queue" "" "")
check_status "POST sans token → 401" 401 "$(echo "$R" | tail -n1)"

R=$(request POST "/api/establishments/$ESTAB/services/00000000-0000-4000-8000-000000000000/queue" "" "$TOKEN_Q")
check_status "POST service inexistant → 404" 404 "$(echo "$R" | tail -n1)"

R=$(request POST "/api/establishments/$ESTAB_O/services/$SERVICE_O/queue" "" "$TOKEN_Q")
check_status "POST file sur service d'un autre → 403" 403 "$(echo "$R" | tail -n1)"

# --- GET : consulter l'état ---------------------------------------
R=$(request GET "/api/establishments/$ESTAB/services/$SERVICE/queue" "" "$TOKEN_Q")
check_status "GET état de la file" 200 "$(echo "$R" | tail -n1)"
check_body "GET état initial OPEN" "$(echo "$R" | head -n1)" '"status":"OPEN"'
check_body "GET indique 0 personne présente" "$(echo "$R" | head -n1)" '"peoplePresent":0'
check_body "GET sans ticket appelé" "$(echo "$R" | head -n1)" '"currentTicket":null'

R=$(request GET "/api/establishments/$ESTAB/services/$SERVICE_O/queue" "" "$TOKEN_Q")
check_status "GET file d'un autre service → 404" 404 "$(echo "$R" | tail -n1)"

R=$(request GET "/api/establishments/$ESTAB/services/$SERVICE/queue" "" "")
check_status "GET sans token → 401" 401 "$(echo "$R" | tail -n1)"

# --- PATCH : transitions d'état ------------------------------------
R=$(request PATCH "/api/establishments/$ESTAB/services/$SERVICE/queue" '{"status":"BOGUS"}' "$TOKEN_Q")
check_status "PATCH statut inconnu → 400" 400 "$(echo "$R" | tail -n1)"

R=$(request PATCH "/api/establishments/$ESTAB/services/$SERVICE/queue" '{}' "$TOKEN_Q")
check_status "PATCH sans statut → 400" 400 "$(echo "$R" | tail -n1)"

R=$(request PATCH "/api/establishments/$ESTAB/services/$SERVICE/queue" '{"status":"OPEN"}' "$TOKEN_Q")
check_status "PATCH même état → 400" 400 "$(echo "$R" | tail -n1)"

R=$(request PATCH "/api/establishments/$ESTAB/services/$SERVICE/queue" '{"status":"PAUSED"}' "$TOKEN_Q")
check_status "PATCH OPEN → PAUSED" 200 "$(echo "$R" | tail -n1)"
check_body "Statut PAUSED appliqué" "$(echo "$R" | head -n1)" '"status":"PAUSED"'

R=$(request PATCH "/api/establishments/$ESTAB/services/$SERVICE/queue" '{"status":"OPEN"}' "$TOKEN_Q")
check_status "PATCH PAUSED → OPEN (reprise)" 200 "$(echo "$R" | tail -n1)"

R=$(request PATCH "/api/establishments/$ESTAB/services/$SERVICE/queue" '{"status":"REGISTRATION_CLOSED"}' "$TOKEN_Q")
check_status "PATCH OPEN → REGISTRATION_CLOSED" 200 "$(echo "$R" | tail -n1)"

R=$(request PATCH "/api/establishments/$ESTAB/services/$SERVICE/queue" '{"status":"OPEN"}' "$TOKEN_Q")
check_status "PATCH REGISTRATION_CLOSED → OPEN" 200 "$(echo "$R" | tail -n1)"

R=$(request PATCH "/api/establishments/$ESTAB/services/$SERVICE/queue" '{"status":"CLOSED"}' "$TOKEN_Q")
check_status "PATCH OPEN → CLOSED" 200 "$(echo "$R" | tail -n1)"
check_body "closed_at renseigné" "$(echo "$R" | head -n1)" '"closed_at":"2'

R=$(request PATCH "/api/establishments/$ESTAB/services/$SERVICE/queue" '{"status":"OPEN"}' "$TOKEN_Q")
check_status "PATCH CLOSED → OPEN interdit → 400" 400 "$(echo "$R" | tail -n1)"

R=$(request PATCH "/api/establishments/$ESTAB_O/services/$SERVICE_O/queue" '{"status":"CLOSED"}' "$TOKEN_Q")
check_status "PATCH file d'un autre → 403" 403 "$(echo "$R" | tail -n1)"

R=$(request PATCH "/api/establishments/$ESTAB/services/$SERVICE/queue" '{"status":"CLOSED"}' "")
check_status "PATCH sans token → 401" 401 "$(echo "$R" | tail -n1)"

# --- La file existante empêche la suppression du service -----------
R=$(request DELETE "/api/establishments/$ESTAB/services/$SERVICE" "" "$TOKEN_Q")
check_status "DELETE service avec historique de file → 400" 400 "$(echo "$R" | tail -n1)"

# --- Nettoyage -------------------------------------------------------
summary
CODE=$?
[ -n "$TOKEN_Q" ] && delete_user "$EMAIL_Q"
[ -n "$TOKEN_O" ] && delete_user "$EMAIL_O"
exit $CODE
