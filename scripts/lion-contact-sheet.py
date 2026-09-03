"""
lion-contact-sheet.py — stitch the review renders into one image.

Twelve separate PNGs are twelve separate decisions to go and look. One sheet
is a glance, and a glance is what actually gets taken on a busy pass.

Labels are burned in because an unlabelled grid of a character from four angles
is genuinely ambiguous — several passes on this asset lost time to arguing
about which view a render was.

Run via `npm run lion:review -- --sheet`, or directly:
  python3 scripts/lion-contact-sheet.py
"""

import os
import sys

try:
    from PIL import Image, ImageDraw
except ImportError:
    sys.exit("[sheet] PIL not available — skipping the contact sheet "
             "(the individual renders in docs/assets/lion-review/ are unaffected)")

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(REPO, "docs", "assets", "lion-review")
OUT = os.path.join(REPO, "docs", "assets", "lion-review-sheet.png")

CELL = 300
PAD = 22
COLS = 5


def main():
    if not os.path.isdir(SRC):
        sys.exit(f"[sheet] {SRC} missing — run npm run lion:review first")
    files = sorted(f for f in os.listdir(SRC) if f.endswith(".png"))
    if not files:
        sys.exit(f"[sheet] no renders in {SRC}")

    rows = (len(files) + COLS - 1) // COLS
    sheet = Image.new("RGB", (COLS * CELL, rows * (CELL + PAD)), "white")
    draw = ImageDraw.Draw(sheet)

    for i, name in enumerate(files):
        col, row = i % COLS, i // COLS
        x, y = col * CELL, row * (CELL + PAD)
        img = Image.open(os.path.join(SRC, name)).convert("RGB")
        sheet.paste(img.resize((CELL, CELL), Image.LANCZOS), (x, y))
        # Strip the sort prefix and the extension: "07-mane-front.png" reads as
        # "mane front", which is what a reviewer wants on the tile.
        label = os.path.splitext(name)[0].split("-", 1)[-1].replace("-", " ")
        draw.text((x + 4, y + CELL + 5), label, fill="black")

    sheet.save(OUT)
    print(f"[sheet] {OUT}  ({len(files)} tiles, {COLS}x{rows})")


if __name__ == "__main__":
    main()
