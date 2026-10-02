#!/usr/bin/env bash
# =========================================================
# MA PLACE — Tests de l'étape 3 : Établissements
#
# Usage :
#   cd backend && npm test                  (tout, serveur auto)
#   ou npm run test:establishments          (serveur déjà lancé)
# =========================================================

. "$(dirname "$0")/helpers.sh"

echo "== Tests Establishments sur $BASE_URL =="

EMAIL_A="test.estab.$RANDOM@maplace.com"
EMAIL_B="test.estab.$RANDOM@maplace.com"

# --- Fixtures : deux gestionnaires -------------------------------
R=$(request POST /api/auth/register "{\"name\":\"Manager A\",\"email\":\"$EMAIL_A\",\"password\":\"secret123\"}" "")
check_status "Fixture : register A" 201 "$(echo "$R" | tail -n1)"
TOKEN_A=$(json_field "$R" data.token)

R=$(request POST /api/auth/register "{\"name\":\"Manager B\",\"email\":\"$EMAIL_B\",\"password\":\"secret123\"}" "")
check_status "Fixture : register B" 201 "$(echo "$R" | tail -n1)"
TOKEN_B=$(json_field "$R" data.token)

# --- Fixture : catégorie existante (seed) ------------------------
R=$(request GET /api/categories "" "$TOKEN_A")
check_status "Fixture : GET /categories" 200 "$(echo "$R" | tail -n1)"
check_body "Fixture : catégories du seed présentes" "$(echo "$R" | head -n1)" "Administration"
CATEGORY_ID=$(json_field "$R" data.categories.0.id)

# --- POST /api/establishments ------------------------------------
R=$(request POST /api/establishments "{\"name\":\"Mairie test\",\"address\":\"Brazzaville\",\"description\":\"Service admin\",\"category_id\":\"$CATEGORY_ID\"}" "$TOKEN_A")
check_status "POST /establishments valide" 201 "$(echo "$R" | tail -n1)"
ESTAB_A=$(json_field "$R" data.establishment.id)

R=$(request POST /api/establishments "{\"name\":\"Salon B\",\"address\":\"Pointe-Noire\",\"category_id\":\"$CATEGORY_ID\"}" "$TOKEN_B")
check_status "Fixture : établissement de B" 201 "$(echo "$R" | tail -n1)"
ESTAB_B=$(json_field "$R" data.establishment.id)

R=$(request POST /api/establishments "{\"address\":\"Brazzaville\",\"category_id\":\"$CATEGORY_ID\"}" "$TOKEN_A")
check_status "POST sans nom" 400 "$(echo "$R" | tail -n1)"

R=$(request POST /api/establishments "{\"name\":\"Sans adresse\",\"category_id\":\"$CATEGORY_ID\"}" "$TOKEN_A")
check_status "POST sans adresse" 400 "$(echo "$R" | tail -n1)"

R=$(request POST /api/establishments "{\"name\":\"Sans catégorie\",\"address\":\"Brazzaville\"}" "$TOKEN_A")
check_status "POST sans catégorie" 400 "$(echo "$R" | tail -n1)"

R=$(request POST /api/establishments "{\"name\":\"Mauvaise cat\",\"address\":\"Brazzaville\",\"category_id\":\"00000000-0000-4000-8000-000000000000\"}" "$TOKEN_A")
check_status "POST catégorie inexistante" 404 "$(echo "$R" | tail -n1)"

R=$(request POST /api/establishments "{\"name\":\"Anonyme\",\"address\":\"Brazzaville\",\"category_id\":\"$CATEGORY_ID\"}" "")
check_status "POST sans token" 401 "$(echo "$R" | tail -n1)"

# --- GET /api/establishments -------------------------------------
R=$(request GET /api/establishments "" "$TOKEN_A")
check_status "GET liste (mes établissements)" 200 "$(echo "$R" | tail -n1)"
check_body "GET liste contient mon établissement" "$(echo "$R" | head -n1)" "Mairie test"
if echo "$(echo "$R" | head -n1)" | grep -q "Salon B"; then
    echo "FAIL  GET liste ne contient PAS ceux des autres"
    FAIL=$((FAIL + 1))
else
    echo "PASS  GET liste ne contient PAS ceux des autres"
    PASS=$((PASS + 1))
fi

R=$(request GET /api/establishments "" "")
check_status "GET liste sans token" 401 "$(echo "$R" | tail -n1)"

# --- GET /api/establishments/:id ---------------------------------
R=$(request GET "/api/establishments/$ESTAB_A" "" "$TOKEN_A")
check_status "GET détail (mon établissement)" 200 "$(echo "$R" | tail -n1)"

R=$(request GET "/api/establishments/$ESTAB_B" "" "$TOKEN_A")
check_status "GET détail établissement d'un autre" 403 "$(echo "$R" | tail -n1)"

R=$(request GET "/api/establishments/00000000-0000-4000-8000-000000000000" "" "$TOKEN_A")
check_status "GET détail inexistant" 404 "$(echo "$R" | tail -n1)"

R=$(request GET "/api/establishments/pas-un-uuid" "" "$TOKEN_A")
check_status "GET détail UUID invalide" 400 "$(echo "$R" | tail -n1)"

# --- PATCH /api/establishments/:id -------------------------------
R=$(request PATCH "/api/establishments/$ESTAB_A" '{"name":"Mairie test modifiée"}' "$TOKEN_A")
check_status "PATCH (mon établissement)" 200 "$(echo "$R" | tail -n1)"
check_body "PATCH applique le nouveau nom" "$(echo "$R" | head -n1)" "Mairie test modifiée"

R=$(request PATCH "/api/establishments/$ESTAB_B" '{"name":"Piratage"}' "$TOKEN_A")
check_status "PATCH établissement d'un autre" 403 "$(echo "$R" | tail -n1)"

R=$(request PATCH "/api/establishments/$ESTAB_A" '{"name":"   "}' "$TOKEN_A")
check_status "PATCH nom vide" 400 "$(echo "$R" | tail -n1)"

R=$(request PATCH "/api/establishments/$ESTAB_A" '{}' "$TOKEN_A")
check_status "PATCH sans données" 400 "$(echo "$R" | tail -n1)"

R=$(request PATCH "/api/establishments/$ESTAB_A" '{"name":"X"}' "")
check_status "PATCH sans token" 401 "$(echo "$R" | tail -n1)"

# --- PATCH /api/establishments/:id/status ------------------------
R=$(request PATCH "/api/establishments/$ESTAB_A/status" '{"status":"SOUS_PAUSE"}' "$TOKEN_A")
check_status "Status valeur invalide" 400 "$(echo "$R" | tail -n1)"

R=$(request PATCH "/api/establishments/$ESTAB_A/status" '{"status":"INACTIVE"}' "$TOKEN_A")
check_status "Status → INACTIVE" 200 "$(echo "$R" | tail -n1)"
check_body "Statut INACTIVE appliqué" "$(echo "$R" | head -n1)" "INACTIVE"

R=$(request PATCH "/api/establishments/$ESTAB_B/status" '{"status":"INACTIVE"}' "$TOKEN_A")
check_status "Status d'un établissement d'un autre" 403 "$(echo "$R" | tail -n1)"

R=$(request PATCH "/api/establishments/$ESTAB_A/status" '{"status":"ACTIVE"}' "$TOKEN_A")
check_status "Status → ACTIVE" 200 "$(echo "$R" | tail -n1)"

# --- Nettoyage ----------------------------------------------------
summary
CODE=$?
[ -n "$TOKEN_A" ] && delete_user "$EMAIL_A"
[ -n "$TOKEN_B" ] && delete_user "$EMAIL_B"
exit $CODE
