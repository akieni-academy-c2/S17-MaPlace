#!/usr/bin/env bash
# =========================================================
# MA PLACE — Tests de l'étape 1 : Authentification
#
# Usage :
#   1. cd backend && npm run dev    (terminal 1 : serveur)
#   2. npm run test:auth            (terminal 2 : tests)
# =========================================================

. "$(dirname "$0")/helpers.sh"

echo "== Tests Auth sur $BASE_URL =="

EMAIL="test.auth.$RANDOM@maplace.com"

# 1. Inscription valide
R=$(request POST /api/auth/register "{\"name\":\"Test Auth\",\"email\":\"$EMAIL\",\"phone\":\"0612345678\",\"password\":\"secret123\"}" "")
check_status "Register valide" 201 "$(echo "$R" | tail -n1)"
TOKEN=$(json_field "$R" data.token)

# 2. Inscription avec email déjà utilisé
R=$(request POST /api/auth/register "{\"name\":\"Test Auth\",\"email\":\"$EMAIL\",\"password\":\"secret123\"}" "")
check_status "Register doublon" 409 "$(echo "$R" | tail -n1)"

# 3. Inscription invalide (champs absents / email invalide)
R=$(request POST /api/auth/register '{"name":"","email":"pasemail","password":"123"}' "")
check_status "Register invalide" 400 "$(echo "$R" | tail -n1)"

# 4. Connexion valide
R=$(request POST /api/auth/login "{\"email\":\"$EMAIL\",\"password\":\"secret123\"}" "")
check_status "Login valide" 200 "$(echo "$R" | tail -n1)"

# 5. Connexion mot de passe incorrect
R=$(request POST /api/auth/login "{\"email\":\"$EMAIL\",\"password\":\"wrongpass\"}" "")
check_status "Login mauvais mot de passe" 401 "$(echo "$R" | tail -n1)"

# 6. Utilisateur connecté avec token
R=$(request GET /api/auth/me "" "$TOKEN")
check_status "GET /me avec token" 200 "$(echo "$R" | tail -n1)"

# 7. Utilisateur connecté sans token
R=$(request GET /api/auth/me "" "")
check_status "GET /me sans token" 401 "$(echo "$R" | tail -n1)"

# 8. Utilisateur connecté avec token invalide
R=$(request GET /api/auth/me "" "abc.def.ghi")
check_status "GET /me token bidon" 401 "$(echo "$R" | tail -n1)"

# 9. Route inexistante
R=$(request GET /api/inexistant "" "")
check_status "Route inexistante" 404 "$(echo "$R" | tail -n1)"

# --- Nettoyage ---------------------------------------------------
summary
CODE=$?
[ -n "$TOKEN" ] && delete_user "$EMAIL"
exit $CODE
