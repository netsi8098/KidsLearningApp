#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RUNTIME_DIR="$ROOT_DIR/tools/local-ai"
VENV_DIR="$RUNTIME_DIR/.venv"

if [[ ! -x "$VENV_DIR/bin/python" ]]; then
  echo "Local AI runtime is not installed. Run: npm run ai:setup" >&2
  exit 1
fi

export HF_HOME="$RUNTIME_DIR/models/huggingface"
export TRANSFORMERS_CACHE="$RUNTIME_DIR/models/huggingface/transformers"

exec "$VENV_DIR/bin/python" "$ROOT_DIR/tts-server.py" "$@"
