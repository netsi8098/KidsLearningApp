"""
world-contact-sheet.py — stitch the world renders into one image.

Same argument as the lion's sheet: separate PNGs are separate decisions to go
and look, and one sheet is a glance. Labels are burned in because a grid of a
landscape from four angles is genuinely ambiguous.

Run via `npm run world:review -- --sheet`, or directly:
  python3 scripts/world-contact-sheet.py
"""
import os
import sys

try:
    from PIL import Image, ImageDraw
except ImportError:
    sys.exit("[sheet] PIL not available — skipping the contact sheet "
             "(the renders in docs/assets/home-environment/ are unaffected)")

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(REPO, "docs", "assets", "home-environment")
OUT = os.path.join(REPO, "docs", "assets", "home-environment-sheet.png")

CELL_W, CELL_H = 440, 275
PAD = 20
COLS = 2


def main():
    if not os.path.isdir(SRC):
        sys.exit(f"[sheet] {SRC} missing — run npm run world:review first")
    files = sorted(f for f in os.listdir(SRC)
                   if f.endswith(".png") and f[0].isdigit())
    if not files:
        sys.exit(f"[sheet] no numbered renders in {SRC}")

    rows = (len(files) + COLS - 1) // COLS
    sheet = Image.new("RGB", (COLS * CELL_W, rows * (CELL_H + PAD)), "white")
    draw = ImageDraw.Draw(sheet)
    for i, name in enumerate(files):
        col, row = i % COLS, i // COLS
        x, y = col * CELL_W, row * (CELL_H + PAD)
        img = Image.open(os.path.join(SRC, name)).convert("RGB")
        sheet.paste(img.resize((CELL_W, CELL_H), Image.LANCZOS), (x, y))
        label = os.path.splitext(name)[0].split("-", 1)[-1].replace("-", " ")
        draw.text((x + 4, y + CELL_H + 4), label, fill="black")
    sheet.save(OUT)
    print(f"[sheet] {OUT}  ({len(files)} tiles, {COLS}x{rows})")


if __name__ == "__main__":
    main()
