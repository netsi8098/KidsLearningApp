#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RUNTIME_DIR="$ROOT_DIR/tools/local-ai"
VENV_DIR="$RUNTIME_DIR/.venv"
MODEL_DIR="$RUNTIME_DIR/models"

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew is required for the local voice runtime." >&2
  exit 1
fi

if ! command -v python3.12 >/dev/null 2>&1; then
  brew install python@3.12
fi
PYTHON_BIN="${PYTHON_BIN:-python3.12}"

if ! command -v espeak-ng >/dev/null 2>&1; then
  brew install espeak-ng
fi

mkdir -p "$MODEL_DIR" "$RUNTIME_DIR/output"

if [[ ! -x "$VENV_DIR/bin/python" ]] || [[ "$($VENV_DIR/bin/python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')" != "3.12" ]]; then
  "$PYTHON_BIN" -m venv --clear "$VENV_DIR"
fi

"$VENV_DIR/bin/python" -m pip install --upgrade pip
"$VENV_DIR/bin/python" -m pip install --no-cache-dir -r "$RUNTIME_DIR/requirements.txt"

export HF_HOME="$MODEL_DIR/huggingface"
export TRANSFORMERS_CACHE="$MODEL_DIR/huggingface/transformers"

"$VENV_DIR/bin/python" - <<'PY'
from kokoro import KPipeline
from sentence_transformers import SentenceTransformer

print("Downloading Kokoro-82M...")
KPipeline(lang_code="a")
print("Downloading all-MiniLM-L6-v2...")
SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
print("Local AI models are ready.")
PY

echo
echo "Setup complete. Start the local AI service with: npm run ai:start"
