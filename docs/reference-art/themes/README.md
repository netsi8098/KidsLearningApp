# Retired theme plates (reference only — not shipped)

These are the original ChatGPT-generated homepage plates. They are **not
rendered by the app** and are deliberately outside `public/` so Vite does not
copy them into `dist/`, where they were adding ~2.1 MB to every deploy for
nothing.

Despite the `-clean` suffix, none of them are clean: each still has the title,
the "Who's playing today?" bubble, a tagline and a fake **Parent pill** painted
into the JPEG. Rendering them under the real UI double-drew the whole interface,
which is why the code-built worlds replaced them.

Kept as **art-direction reference** for whoever produces the real layered
plates. See `public/assets/worlds/README.md` for the layer contract those
plates must follow (scenery only, no baked UI).
