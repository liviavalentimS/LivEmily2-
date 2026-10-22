#!/usr/bin/env bash
# Uso: ./teste_crud.sh [PORTA] [URL_BASE]
set -euo pipefail


PORTA="${1:-3000}"
HOST="${2:-http://localhost}"
BASE="${HOST}:${PORTA}/api/v1"


command -v jq >/dev/null || { echo "jq não instalado"; exit 1; }


echo "=============================================="
echo " TESTE CRUD - API DE FROTAS"
echo " Data: $(date '+%d/%m/%Y %H:%M:%S')"
echo " Base: ${BASE}"
echo "=============================================="


echo -e "\n[1] HEALTH CHECK"
curl -s "${BASE}/health" | jq


echo -e "\n[2] POST - Criando veículo"
RESP=$(curl -s -X POST "${BASE}/veiculos" \
  -H "Content-Type: application/json" \
  -d '{"placa":"ABC-1234","modelo":"Fiat Strada","ano":2023}')
echo "$RESP" | jq


ID=$(echo "$RESP" | jq -r '.id')
if [ -z "$ID" ] || [ "$ID" = "null" ]; then
  echo "Falha ao capturar o ID do POST"; exit 1
fi
echo ">>> ID capturado: ${ID}"


echo -e "\n[3] GET - Buscando veículo ${ID}"
curl -s "${BASE}/veiculos/${ID}" | jq


echo -e "\n[4] PATCH - Atualizando status do veículo ${ID}"
curl -s -X PATCH "${BASE}/veiculos/${ID}" \
  -H "Content-Type: application/json" \
  -d '{"status":"em_manutencao"}' | jq


echo -e "\n[5] PUT - Substituindo veículo ${ID}"
curl -s -X PUT "${BASE}/veiculos/${ID}" \
  -H "Content-Type: application/json" \
  -d '{"placa":"XYZ-9876","modelo":"VW Saveiro","ano":2024,"status":"disponivel"}' | jq


echo -e "\n[6] DELETE - Removendo veículo ${ID}"
curl -s -X DELETE "${BASE}/veiculos/${ID}" | jq


echo -e "\n[7] GET - Confirmando remoção (esperado: 404)"
CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/veiculos/${ID}")
echo "HTTP ${CODE}"
[ "$CODE" = "404" ] && echo "Remoção confirmada" || echo "Veículo ainda existe"


echo -e "\n=============================================="
echo " TESTE FINALIZADO"
echo "=============================================="
