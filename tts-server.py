"""Offline AI service for Kids Learning Fun.

Provides Kokoro text-to-speech and MiniLM semantic ranking over localhost.
The service is deliberately dependency-isolated under tools/local-ai/.venv.

Run: npm run ai:start
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

import numpy as np
import soundfile as sf
from kokoro import KPipeline
from sentence_transformers import SentenceTransformer


TTS_MODEL = "hexgrad/Kokoro-82M"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
SAMPLE_RATE = 24_000
DEFAULT_VOICE = "kids"
VOICES = {
    "kids": "af_heart",
    "girl": "af_bella",
    "boy": "am_michael",
    "teacher": "af_sarah",
    "storyteller": "bf_emma",
    "fun": "af_sky",
}

_tts_pipeline: KPipeline | None = None
_embedding_model: SentenceTransformer | None = None
_tts_lock = threading.Lock()
_embedding_lock = threading.Lock()
_embedding_cache: dict[str, np.ndarray] = {}


def get_tts_pipeline() -> KPipeline:
    global _tts_pipeline
    if _tts_pipeline is None:
        with _tts_lock:
            if _tts_pipeline is None:
                print(f"Loading {TTS_MODEL}...")
                _tts_pipeline = KPipeline(lang_code="a")
    return _tts_pipeline


def get_embedding_model() -> SentenceTransformer:
    global _embedding_model
    if _embedding_model is None:
        with _embedding_lock:
            if _embedding_model is None:
                print(f"Loading {EMBEDDING_MODEL}...")
                _embedding_model = SentenceTransformer(EMBEDDING_MODEL)
    return _embedding_model


def synthesize_wav(text: str, voice_key: str, speed: float) -> bytes:
    pipeline = get_tts_pipeline()
    voice = VOICES.get(voice_key, VOICES[DEFAULT_VOICE])
    chunks: list[np.ndarray] = []

    with _tts_lock:
        for _graphemes, _phonemes, audio in pipeline(text, voice=voice, speed=speed):
            chunks.append(np.asarray(audio, dtype=np.float32))

    if not chunks:
        raise RuntimeError("Kokoro returned no audio")

    output = io.BytesIO()
    sf.write(output, np.concatenate(chunks), SAMPLE_RATE, format="WAV", subtype="PCM_16")
    return output.getvalue()


def embedding_for(text: str) -> np.ndarray:
    key = hashlib.sha1(text.encode("utf-8")).hexdigest()
    cached = _embedding_cache.get(key)
    if cached is not None:
        return cached

    vector = get_embedding_model().encode(
        text,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )
    _embedding_cache[key] = vector
    return vector


def rank_items(query: str, items: list[dict], limit: int) -> list[dict]:
    query_vector = embedding_for(query)
    scored: list[dict] = []
    for item in items:
        item_id = str(item.get("id", ""))
        text = str(item.get("text", "")).strip()
        if not item_id or not text:
            continue
        score = float(np.dot(query_vector, embedding_for(text)))
        scored.append({"id": item_id, "score": score})
    scored.sort(key=lambda item: item["score"], reverse=True)
    return scored[:limit]


class LocalAIHandler(BaseHTTPRequestHandler):
    server_version = "KidsLocalAI/1.0"

    def send_json(self, status: int, payload: object) -> None:
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self.send_json(200, {
                "status": "ok",
                "offline": True,
                "ttsModel": TTS_MODEL,
                "embeddingModel": EMBEDDING_MODEL,
                "voices": list(VOICES),
                "loaded": {
                    "tts": _tts_pipeline is not None,
                    "semantic": _embedding_model is not None,
                },
            })
            return

        if parsed.path == "/voices":
            self.send_json(200, [
                {"id": key, "name": model_voice}
                for key, model_voice in VOICES.items()
            ])
            return

        if parsed.path == "/tts":
            params = parse_qs(parsed.query)
            text = params.get("text", [""])[0].strip()
            voice_key = params.get("voice", [DEFAULT_VOICE])[0]
            raw_speed = params.get("speed", params.get("rate", ["1"]))[0]
            try:
                if raw_speed.endswith("%"):
                    speed = 1 + float(raw_speed.removesuffix("%")) / 100
                else:
                    speed = float(raw_speed)
                speed = min(1.3, max(0.65, speed))
            except ValueError:
                speed = 1.0

            if not text:
                self.send_json(400, {"error": "Missing text parameter"})
                return
            if len(text) > 2_000:
                self.send_json(413, {"error": "Text exceeds 2000 characters"})
                return

            try:
                audio = synthesize_wav(text, voice_key, speed)
                self.send_response(200)
                self.send_header("Content-Type", "audio/wav")
                self.send_header("Content-Length", str(len(audio)))
                self.send_header("Cache-Control", "private, max-age=3600")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(audio)
            except Exception as error:
                print(f"TTS error: {error}")
                self.send_json(500, {"error": "Speech generation failed"})
            return

        self.send_json(404, {"error": "Not found"})

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length > 1_000_000:
                self.send_json(413, {"error": "Request too large"})
                return
            payload = json.loads(self.rfile.read(content_length) or b"{}")
        except (ValueError, json.JSONDecodeError):
            self.send_json(400, {"error": "Invalid JSON"})
            return

        if parsed.path == "/semantic/search":
            query = str(payload.get("query", "")).strip()
            items = payload.get("items", [])
            limit = min(50, max(1, int(payload.get("limit", 20))))
            if not query or not isinstance(items, list):
                self.send_json(400, {"error": "query and items are required"})
                return
            try:
                self.send_json(200, {"matches": rank_items(query, items, limit)})
            except Exception as error:
                print(f"Semantic search error: {error}")
                self.send_json(500, {"error": "Semantic search failed"})
            return

        if parsed.path == "/models/load":
            try:
                get_tts_pipeline()
                get_embedding_model()
                self.send_json(200, {"status": "ready"})
            except Exception as error:
                print(f"Model load error: {error}")
                self.send_json(500, {"error": "Model loading failed"})
            return

        self.send_json(404, {"error": "Not found"})

    def log_message(self, format_string: str, *args: object) -> None:
        print(f"Local AI: {format_string % args}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Kids Learning Fun local AI service")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=5555)
    parser.add_argument("--preload", action="store_true")
    args = parser.parse_args()

    if args.preload:
        get_tts_pipeline()
        get_embedding_model()

    server = ThreadingHTTPServer((args.host, args.port), LocalAIHandler)
    print(f"Local AI ready at http://{args.host}:{args.port}")
    print("Kokoro TTS: /tts?text=Hello&voice=kids")
    print("MiniLM search: POST /semantic/search")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nLocal AI service stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
