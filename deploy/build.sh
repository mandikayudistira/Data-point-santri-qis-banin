#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

export NODE_ENV="${NODE_ENV:-production}"
export BASE_PATH="${BASE_PATH:-/}"
export PORT="${PORT:-4173}"

echo "Building QIPOS frontend and API..."
pnpm install --frozen-lockfile
pnpm run build

echo "Build complete:"
echo "  Frontend: artifacts/sipos/dist/public"
echo "  API:      artifacts/api-server/dist/index.mjs"