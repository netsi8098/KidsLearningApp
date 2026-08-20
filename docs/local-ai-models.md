# Local AI Models

Kids Learning Fun can run two small open-source models entirely on the Mac:

- `hexgrad/Kokoro-82M` provides natural offline narration and character voices.
- `sentence-transformers/all-MiniLM-L6-v2` adds meaning-based results to universal search.

Both models use Apache-2.0 licenses. They are development tools and local app services, not bundled into the browser download.

## Setup

Run once from the project root:

```bash
npm run ai:setup
```

This creates `tools/local-ai/.venv`, installs `espeak-ng`, downloads model files under `tools/local-ai/models`, and leaves the system Python unchanged. Allow roughly 2 GB of disk space.

Start the service:

```bash
npm run ai:start
```

Confirm it is healthy:

```bash
npm run ai:check
```

The service binds to `127.0.0.1:5555` by default. Do not expose it directly to the public internet.

## Endpoints

- `GET /health` reports model and loading state.
- `GET /voices` lists the six app voice presets.
- `GET /tts?text=Hello&voice=kids` returns a 24 kHz WAV file.
- `POST /semantic/search` ranks `{ id, text }` candidates against a query.
- `POST /models/load` warms both models before testing.

## App Behavior

In development, `.env.development` enables semantic search and points both features to the local service. Universal search shows exact keyword matches immediately, then appends meaning-based matches when MiniLM is available. If the service is stopped, search stays fully functional using keyword matching.

Voice follows the existing fallback chain: Kokoro first, then the Web Speech API. No story text, profile data, or audio is sent to a cloud model by this service.

## Scope

MiniLM is useful for content discovery, recommendations, and grouping. It cannot generate images, animation, or speech. Kokoro generates speech only. Homepage animation and the lion's articulated movement remain code/rigging work; larger video models such as Wan are retained as reference-generation experiments rather than app runtime dependencies.
