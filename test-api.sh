#!/bin/bash
BASE="http://localhost:5000/api"
PASS=0
FAIL=0
TOTAL=0

GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

test_it() {
  TOTAL=$((TOTAL + 1))
  local name="$1"
  local expected="$2"
  local actual="$3"
  if echo "$actual" | grep -q "$expected"; then
    PASS=$((PASS + 1))
    echo -e "${GREEN}V PASS${NC} [$TOTAL] $name"
  else
    FAIL=$((FAIL + 1))
    echo -e "${RED}X FAIL${NC} [$TOTAL] $name"
    echo "  Expected: $expected"
    echo "  Got: $actual"
  fi
}

echo -e "${CYAN}=====================================${NC}"
echo -e "${CYAN}   TESTS API - TechSpace Solutions   ${NC}"
echo -e "${CYAN}=====================================${NC}"
echo ""

TS=$(date +%s)
EMAIL="test_${TS}@test.com"
EMAIL2="test2_${TS}@test.com"
NEXT_WD="2026-02-17"

echo -e "${CYAN}-- 1. Authentification --${NC}"

# 1. Register
RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"firstname\":\"Jean\",\"lastname\":\"Test\",\"email\":\"$EMAIL\",\"password\":\"Test1234!\"}")
CODE=$(echo "$RES" | tail -1)
BODY=$(echo "$RES" | head -n -1)
test_it "Inscription reussie" "201" "$CODE"
TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)

# 2. Register duplicate
RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"firstname\":\"Jean\",\"lastname\":\"Test\",\"email\":\"$EMAIL\",\"password\":\"Test1234!\"}")
CODE=$(echo "$RES" | tail -1)
test_it "Inscription doublon refusee (409)" "409" "$CODE"

# 3. Register missing fields
RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"incomplete@test.com\"}")
CODE=$(echo "$RES" | tail -1)
test_it "Inscription champs manquants (400)" "400" "$CODE"

# 4. Login
RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Test1234!\"}")
CODE=$(echo "$RES" | tail -1)
BODY=$(echo "$RES" | head -n -1)
test_it "Connexion reussie (200)" "200" "$CODE"
TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)

# 5. Login wrong password
RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Wrong1234!\"}")
CODE=$(echo "$RES" | tail -1)
test_it "Connexion mauvais mdp (401)" "401" "$CODE"

# 6. Login non-existent user
RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"nonexistent@test.com\",\"password\":\"Test1234!\"}")
CODE=$(echo "$RES" | tail -1)
test_it "Connexion user inexistant (401)" "401" "$CODE"

# 7. Get profile
RES=$(curl -s -w "\n%{http_code}" "$BASE/auth/me" \
  -H "Authorization: Bearer $TOKEN")
CODE=$(echo "$RES" | tail -1)
BODY=$(echo "$RES" | head -n -1)
test_it "Profil recupere (200)" "200" "$CODE"
test_it "Profil contient prenom Jean" "Jean" "$BODY"

# 8. Profile without token
RES=$(curl -s -w "\n%{http_code}" "$BASE/auth/me")
CODE=$(echo "$RES" | tail -1)
test_it "Profil sans token (401)" "401" "$CODE"

# 9. Profile bad token
RES=$(curl -s -w "\n%{http_code}" "$BASE/auth/me" \
  -H "Authorization: Bearer invalid_token_xyz")
CODE=$(echo "$RES" | tail -1)
test_it "Profil mauvais token (401)" "401" "$CODE"

echo ""
echo -e "${CYAN}-- 2. Reservations - Creation --${NC}"

# 10. Create reservation
RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE/reservations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"title\":\"Reunion equipe\",\"date\":\"$NEXT_WD\",\"start_time\":\"09:00\",\"end_time\":\"10:00\"}")
CODE=$(echo "$RES" | tail -1)
BODY=$(echo "$RES" | head -n -1)
test_it "Creation reservation (201)" "201" "$CODE"
RES_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 11. Create without auth
RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE/reservations" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Sans auth\",\"date\":\"$NEXT_WD\",\"start_time\":\"11:00\",\"end_time\":\"12:00\"}")
CODE=$(echo "$RES" | tail -1)
test_it "Creation sans token (401)" "401" "$CODE"

# 12. Overlap
RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE/reservations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"title\":\"Overlap\",\"date\":\"$NEXT_WD\",\"start_time\":\"09:30\",\"end_time\":\"10:30\"}")
CODE=$(echo "$RES" | tail -1)
test_it "Chevauchement refuse (409)" "409" "$CODE"

# 13. Weekend
RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE/reservations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"title\":\"Weekend\",\"date\":\"2026-02-21\",\"start_time\":\"10:00\",\"end_time\":\"11:00\"}")
CODE=$(echo "$RES" | tail -1)
test_it "Reservation weekend refusee (400)" "400" "$CODE"

# 14. Outside hours
RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE/reservations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"title\":\"Trop tot\",\"date\":\"$NEXT_WD\",\"start_time\":\"07:00\",\"end_time\":\"08:00\"}")
CODE=$(echo "$RES" | tail -1)
test_it "Hors horaires refusee (400)" "400" "$CODE"

# 15. Duration < 1h
RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE/reservations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"title\":\"Courte\",\"date\":\"$NEXT_WD\",\"start_time\":\"14:00\",\"end_time\":\"14:30\"}")
CODE=$(echo "$RES" | tail -1)
test_it "Duree < 1h refusee (400)" "400" "$CODE"

# 16. Past date
RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE/reservations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"title\":\"Passe\",\"date\":\"2025-01-06\",\"start_time\":\"10:00\",\"end_time\":\"11:00\"}")
CODE=$(echo "$RES" | tail -1)
test_it "Date passee refusee (400)" "400" "$CODE"

# 17. Missing title
RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE/reservations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"date\":\"$NEXT_WD\",\"start_time\":\"15:00\",\"end_time\":\"16:00\"}")
CODE=$(echo "$RES" | tail -1)
test_it "Titre manquant refuse (400)" "400" "$CODE"

echo ""
echo -e "${CYAN}-- 3. Reservations - Lecture --${NC}"

# 18. Get week
RES=$(curl -s -w "\n%{http_code}" "$BASE/reservations/week?date=$NEXT_WD" \
  -H "Authorization: Bearer $TOKEN")
CODE=$(echo "$RES" | tail -1)
BODY=$(echo "$RES" | head -n -1)
test_it "Planning semaine (200)" "200" "$CODE"
test_it "Planning contient reservation" "Reunion equipe" "$BODY"

# 19. Get mine
RES=$(curl -s -w "\n%{http_code}" "$BASE/reservations" \
  -H "Authorization: Bearer $TOKEN")
CODE=$(echo "$RES" | tail -1)
BODY=$(echo "$RES" | head -n -1)
test_it "Mes reservations (200)" "200" "$CODE"
test_it "Contient le titre" "Reunion equipe" "$BODY"

echo ""
echo -e "${CYAN}-- 4. Reservations - Modification --${NC}"

# 20. Update
RES=$(curl -s -w "\n%{http_code}" -X PUT "$BASE/reservations/$RES_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"title\":\"Reunion modifiee\",\"date\":\"$NEXT_WD\",\"start_time\":\"10:00\",\"end_time\":\"11:00\"}")
CODE=$(echo "$RES" | tail -1)
BODY=$(echo "$RES" | head -n -1)
test_it "Modification reussie (200)" "200" "$CODE"
test_it "Message de confirmation" "modifiee" "$BODY"

# 21. Update by other user
RES2=$(curl -s -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"firstname\":\"Marie\",\"lastname\":\"Autre\",\"email\":\"$EMAIL2\",\"password\":\"Test1234!\"}")
TOKEN2=$(echo "$RES2" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)

RES=$(curl -s -w "\n%{http_code}" -X PUT "$BASE/reservations/$RES_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d "{\"title\":\"Piratage\",\"date\":\"$NEXT_WD\",\"start_time\":\"10:00\",\"end_time\":\"11:00\"}")
CODE=$(echo "$RES" | tail -1)
test_it "Modification par autre user (403)" "403" "$CODE"

echo ""
echo -e "${CYAN}-- 5. Reservations - Suppression --${NC}"

# 22. Delete by other user
RES=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE/reservations/$RES_ID" \
  -H "Authorization: Bearer $TOKEN2")
CODE=$(echo "$RES" | tail -1)
test_it "Suppression par autre user (403)" "403" "$CODE"

# 23. Delete own
RES=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE/reservations/$RES_ID" \
  -H "Authorization: Bearer $TOKEN")
CODE=$(echo "$RES" | tail -1)
test_it "Suppression propre reservation (200)" "200" "$CODE"

# 24. Delete non-existent
RES=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE/reservations/99999" \
  -H "Authorization: Bearer $TOKEN")
CODE=$(echo "$RES" | tail -1)
test_it "Suppression inexistante (404)" "404" "$CODE"

# 25. Verify deletion
RES=$(curl -s "$BASE/reservations" \
  -H "Authorization: Bearer $TOKEN")
TOTAL=$((TOTAL + 1))
if ! echo "$RES" | grep -q "Reunion modifiee"; then
  PASS=$((PASS + 1))
  echo -e "${GREEN}V PASS${NC} [$TOTAL] Reservation bien supprimee"
else
  FAIL=$((FAIL + 1))
  echo -e "${RED}X FAIL${NC} [$TOTAL] Reservation encore presente"
fi

echo ""
echo -e "${CYAN}=====================================${NC}"
echo -e "Total: $TOTAL | ${GREEN}PASS: $PASS${NC} | ${RED}FAIL: $FAIL${NC}"
if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}TOUS LES 25 TESTS PASSENT !${NC}"
else
  echo -e "${RED}$FAIL TEST(S) EN ECHEC${NC}"
fi
echo -e "${CYAN}=====================================${NC}"
