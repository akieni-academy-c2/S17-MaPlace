#!/usr/bin/env bash
# =========================================================
# MA PLACE — Tests de l'étape 6 : Tickets
#
# Usage :
#   cd backend && npm test                  (tout, serveur auto)
#   ou npm run test:tickets                (serveur déjà lancé)
# =========================================================

. "$(dirname "$0")/helpers.sh"

echo "== Tests Tickets sur $BASE_URL =="

EMAIL_T="test.ticket.$RANDOM@maplace.com"

# --- Fixtures : gestionnaire, établissement, service, file du jour ---
R=$(request POST /api/auth/register "{\"name\":\"Manager Ticket\",\"email\":\"$EMAIL_T\",\"password\":\"secret123\"}" "")
check_status "Fixture : register" 201 "$(echo "$R" | tail -n1)"
TOKEN_T=$(json_field "$R" data.token)

R=$(request GET /api/categories "" "$TOKEN_T")
CATEGORY_ID=$(json_field "$R" data.categories.0.id)

R=$(request POST /api/establishments "{\"name\":\"Étab Ticket\",\"address\":\"Brazzaville\",\"category_id\":\"$CATEGORY_ID\"}" "$TOKEN_T")
check_status "Fixture : établissement" 201 "$(echo "$R" | tail -n1)"
ESTAB=$(json_field "$R" data.establishment.id)

R=$(request POST "/api/establishments/$ESTAB/services" '{"name":"Guichet Ticket"}' "$TOKEN_T")
check_status "Fixture : service" 201 "$(echo "$R" | tail -n1)"
SERVICE=$(json_field "$R" data.service.id)

R=$(request POST "/api/establishments/$ESTAB/services/$SERVICE/queue" "" "$TOKEN_T")
check_status "Fixture : file du jour" 201 "$(echo "$R" | tail -n1)"

Q="/api/establishments/$ESTAB/services/$SERVICE/queue"

# --- POST : rejoindre la file ---------------------------------------
R=$(request POST "$Q/tickets" '{"name":"Alice","phone":"+242060000001"}' "")
check_status "POST ticket anonyme" 201 "$(echo "$R" | tail -n1)"
TICKET_A=$(json_field "$R" data.ticket.id)
TOKEN_A_T=$(json_field "$R" data.ticket.tracking_token)
check_body "POST numéroté 1" "$(echo "$R" | head -n1)" '"number":1'
check_body "POST position 1" "$(echo "$R" | head -n1)" '"position":1'
check_body "POST user_id null (anonyme)" "$(echo "$R" | head -n1)" '"user_id":null'

R=$(request POST "$Q/tickets" '{"name":"Bob","phone":"+242060000002"}' "$TOKEN_T")
check_status "POST ticket connecté" 201 "$(echo "$R" | tail -n1)"
TOKEN_B_T=$(json_field "$R" data.ticket.tracking_token)
check_body "POST numéroté 2" "$(echo "$R" | head -n1)" '"number":2'
check_body "POST position 2" "$(echo "$R" | head -n1)" '"position":2'
check_body "POST peopleAhead 1" "$(echo "$R" | head -n1)" '"peopleAhead":1'
check_body "POST user_id renseigné" "$(echo "$R" | head -n1)" '"user_id":"'

R=$(request POST "$Q/tickets" '{"name":"Bob2","phone":"+242060000003"}' "$TOKEN_T")
check_status "POST un seul ticket actif par compte → 409" 409 "$(echo "$R" | tail -n1)"

R=$(request POST "$Q/tickets" '{"phone":"+242060000004"}' "")
check_status "POST sans nom → 400" 400 "$(echo "$R" | tail -n1)"

R=$(request POST "$Q/tickets" '{"name":"Sans tel"}' "")
check_status "POST sans téléphone → 400" 400 "$(echo "$R" | tail -n1)"

R=$(request POST "$Q/tickets" '{"name":"X","phone":"1","channel":"FAKE"}' "")
check_status "POST canal invalide → 400" 400 "$(echo "$R" | tail -n1)"

R=$(request POST "$Q/tickets" '{"name":"Y","phone":"1"}' "token-invalide")
check_status "POST avec token invalide → 401" 401 "$(echo "$R" | tail -n1)"

R=$(request POST "/api/establishments/$ESTAB/services/00000000-0000-4000-8000-000000000000/queue/tickets" '{"name":"Z","phone":"1"}' "")
check_status "POST service inexistant → 404" 404 "$(echo "$R" | tail -n1)"

R=$(request POST "/api/establishments/00000000-0000-4000-8000-000000000000/services/$SERVICE/queue/tickets" '{"name":"Z","phone":"1"}' "")
check_status "POST établissement inexistant → 404" 404 "$(echo "$R" | tail -n1)"

# --- GET : position ---------------------------------------------------
R=$(request GET "$Q/tickets/$TOKEN_A_T" "" "")
check_status "GET ticket anonyme (public)" 200 "$(echo "$R" | tail -n1)"
check_body "GET position 1" "$(echo "$R" | head -n1)" '"position":1'
check_body "GET status WAITING" "$(echo "$R" | head -n1)" '"status":"WAITING"'

R=$(request GET "$Q/tickets/$TOKEN_B_T" "" "$TOKEN_T")
check_status "GET ticket connecté" 200 "$(echo "$R" | tail -n1)"
check_body "GET position 2" "$(echo "$R" | head -n1)" '"position":2'
check_body "GET 1 personne devant" "$(echo "$R" | head -n1)" '"peopleAhead":1'

R=$(request GET "$Q/tickets/00000000000000000000000000000000" "" "")
check_status "GET token inconnu → 404" 404 "$(echo "$R" | tail -n1)"

# --- Statistiques de la file mises à jour -----------------------------
R=$(request GET "$Q" "" "$TOKEN_T")
check_body "GET queue compte 2 personnes présentes" "$(echo "$R" | head -n1)" '"peoplePresent":2'

# --- DELETE : quitter la file ------------------------------------------
R=$(request DELETE "$Q/tickets/$TOKEN_A_T" "" "")
check_status "DELETE (annulation logique)" 200 "$(echo "$R" | tail -n1)"
check_body "Ticket annulé → CANCELLED" "$(echo "$R" | head -n1)" '"status":"CANCELLED"'

R=$(request DELETE "$Q/tickets/$TOKEN_A_T" "" "")
check_status "DELETE à nouveau → 409" 409 "$(echo "$R" | tail -n1)"

R=$(request GET "$Q/tickets/$TOKEN_B_T" "" "")
check_status "GET après annulation de Alice" 200 "$(echo "$R" | tail -n1)"
check_body "Bob remonte en position 1" "$(echo "$R" | head -n1)" '"position":1'
check_body "Plus personne devant Bob" "$(echo "$R" | head -n1)" '"peopleAhead":0'

R=$(request GET "$Q" "" "$TOKEN_T")
check_body "GET queue compte 1 personne après annulation" "$(echo "$R" | head -n1)" '"peoplePresent":1'

# --- Numérotation après annulation -------------------------------------
R=$(request POST "$Q/tickets" '{"name":"Carl","phone":"+242060000005"}' "")
check_status "POST après annulation" 201 "$(echo "$R" | tail -n1)"
check_body "Le numéro n'est pas réutilisé (3)" "$(echo "$R" | head -n1)" '"number":3'

# --- Inscriptions fermées ----------------------------------------------
R=$(request PATCH "$Q" '{"status":"REGISTRATION_CLOSED"}' "$TOKEN_T")
check_status "Fixture : file en REGISTRATION_CLOSED" 200 "$(echo "$R" | tail -n1)"

R=$(request POST "$Q/tickets" '{"name":"Tardif","phone":"+242060000006"}' "")
check_status "POST inscription fermée → 400" 400 "$(echo "$R" | tail -n1)"

R=$(request PATCH "$Q" '{"status":"CLOSED"}' "$TOKEN_T")
check_status "Fixture : file CLOSED" 200 "$(echo "$R" | tail -n1)"

R=$(request GET "$Q/tickets/$TOKEN_B_T" "" "")
check_status "GET ticket sur file fermée" 200 "$(echo "$R" | tail -n1)"

# --- Nettoyage ------------------------------------------------------------
summary
CODE=$?
[ -n "$TOKEN_T" ] && delete_user "$EMAIL_T"
exit $CODE
