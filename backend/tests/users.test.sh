#!/usr/bin/env bash
# =========================================================
# MA PLACE — Tests de l'étape 2 : Utilisateurs
#
# Usage :
#   1. cd backend && npm run dev    (terminal 1 : serveur)
#   2. npm run test:users           (terminal 2 : tests)
# =========================================================

. "$(dirname "$0")/helpers.sh"

echo "== Tests Users sur $BASE_URL =="

EMAIL_A="test.users.$RANDOM@maplace.com"
EMAIL_B="test.users.$RANDOM@maplace.com"

# --- Fixtures : deux comptes ------------------------------------
R=$(request POST /api/auth/register "{\"name\":\"Test Users\",\"email\":\"$EMAIL_A\",\"password\":\"secret123\"}" "")
check_status "Fixture : register A" 201 "$(echo "$R" | tail -n1)"
TOKEN_A=$(json_field "$R" data.token)

R=$(request POST /api/auth/register "{\"name\":\"Autre User\",\"email\":\"$EMAIL_B\",\"password\":\"secret123\"}" "")
check_status "Fixture : register B" 201 "$(echo "$R" | tail -n1)"
TOKEN_B=$(json_field "$R" data.token)

# --- GET /api/users/me ------------------------------------------
R=$(request GET /api/users/me "" "$TOKEN_A")
check_status "GET /me avec token" 200 "$(echo "$R" | tail -n1)"
check_body "GET /me retourne le bon nom" "$(echo "$R" | head -n1)" "Test Users"

R=$(request GET /api/users/me "" "")
check_status "GET /me sans token" 401 "$(echo "$R" | tail -n1)"

# --- PATCH /api/users/me (profil) --------------------------------
R=$(request PATCH /api/users/me '{"name":"Test Users Modifie"}' "$TOKEN_A")
check_status "PATCH /me (nom)" 200 "$(echo "$R" | tail -n1)"
check_body "PATCH /me applique le nouveau nom" "$(echo "$R" | head -n1)" "Test Users Modifie"

R=$(request PATCH /api/users/me "{\"email\":\"$EMAIL_B\"}" "$TOKEN_A")
check_status "PATCH /me email déjà pris" 409 "$(echo "$R" | tail -n1)"

R=$(request PATCH /api/users/me '{"email":"pas-un-email"}' "$TOKEN_A")
check_status "PATCH /me email invalide" 400 "$(echo "$R" | tail -n1)"

R=$(request PATCH /api/users/me '{}' "$TOKEN_A")
check_status "PATCH /me sans données" 400 "$(echo "$R" | tail -n1)"

R=$(request PATCH /api/users/me '{"name":"Hacker"}' "")
check_status "PATCH /me sans token" 401 "$(echo "$R" | tail -n1)"

# --- PATCH /api/users/me/password --------------------------------
R=$(request PATCH /api/users/me/password '{"currentPassword":"mauvais","newPassword":"secret456"}' "$TOKEN_A")
check_status "Password avec ancien mot de passe faux" 403 "$(echo "$R" | tail -n1)"

R=$(request PATCH /api/users/me/password '{"currentPassword":"secret123","newPassword":"123"}' "$TOKEN_A")
check_status "Password nouveau trop court" 400 "$(echo "$R" | tail -n1)"

R=$(request PATCH /api/users/me/password '{"currentPassword":"secret123","newPassword":"secret456"}' "$TOKEN_A")
check_status "Password mise à jour valide" 200 "$(echo "$R" | tail -n1)"

R=$(request POST /api/auth/login "{\"email\":\"$EMAIL_A\",\"password\":\"secret123\"}" "")
check_status "Login ancien mot de passe refusé" 401 "$(echo "$R" | tail -n1)"

R=$(request POST /api/auth/login "{\"email\":\"$EMAIL_A\",\"password\":\"secret456\"}" "")
check_status "Login nouveau mot de passe accepté" 200 "$(echo "$R" | tail -n1)"

# --- Nettoyage ---------------------------------------------------
summary
CODE=$?
[ -n "$TOKEN_A" ] && delete_user "$EMAIL_A"
[ -n "$TOKEN_B" ] && delete_user "$EMAIL_B"
exit $CODE
