"""
Local TTS Server — high-quality AI voices for Kids Learning App.
Uses Microsoft Edge TTS (free, natural-sounding voices).

Run:  python3 tts-server.py
Serves audio at http://localhost:5555/tts?text=Hello&voice=kids
"""

import asyncio
import io
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import edge_tts

# Kid-friendly voice presets
VOICES = {
    "kids": "en-US-AnaNeural",          # Young, friendly girl voice
    "boy": "en-US-AndrewMultilingualNeural",
    "girl": "en-US-AvaMultilingualNeural",
    "teacher": "en-US-JennyNeural",      # Warm teacher voice
    "storyteller": "en-US-AriaNeural",    # Expressive narrator
    "fun": "en-US-EmmaMultilingualNeural",
}

DEFAULT_VOICE = "kids"
PORT = 5555


class TTSHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)

        # Health check
        if parsed.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "voices": list(VOICES.keys())}).encode())
            return

        # List voices
        if parsed.path == "/voices":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            voice_list = [{"id": k, "name": v} for k, v in VOICES.items()]
            self.wfile.write(json.dumps(voice_list).encode())
            return

        # TTS endpoint
        if parsed.path == "/tts":
            params = parse_qs(parsed.query)
            text = params.get("text", [""])[0]
            voice_key = params.get("voice", [DEFAULT_VOICE])[0]
            rate = params.get("rate", ["+0%"])[0]
            pitch = params.get("pitch", ["+0Hz"])[0]

            if not text:
                self.send_response(400)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(b"Missing 'text' parameter")
                return

            voice = VOICES.get(voice_key, VOICES[DEFAULT_VOICE])

            try:
                audio_data = asyncio.run(self._generate_speech(text, voice, rate, pitch))
                self.send_response(200)
                self.send_header("Content-Type", "audio/mpeg")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Cache-Control", "public, max-age=3600")
                self.end_headers()
                self.wfile.write(audio_data)
            except Exception as e:
                self.send_response(500)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(f"TTS error: {e}".encode())
            return

        self.send_response(404)
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()

    async def _generate_speech(self, text: str, voice: str, rate: str, pitch: str) -> bytes:
        communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
        buffer = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                buffer.write(chunk["data"])
        return buffer.getvalue()

    def log_message(self, format, *args):
        # Cleaner logging
        print(f"  TTS: {args[0]}")


def main():
    print(f"🔊 Kids TTS Server starting on http://localhost:{PORT}")
    print(f"   Voices: {', '.join(VOICES.keys())}")
    print(f"   Example: http://localhost:{PORT}/tts?text=Hello!&voice=kids")
    print()

    server = HTTPServer(("127.0.0.1", PORT), TTSHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  TTS server stopped.")
        server.server_close()


if __name__ == "__main__":
    main()
