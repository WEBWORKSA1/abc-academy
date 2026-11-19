#!/usr/bin/env python3
"""Generate the raster images (app icons and social share image) from code.

Run once by the auto-refresh workflow when the PNGs are missing:  pip install pillow && python3 scripts/make_images.py
"""
import glob
import pathlib
from PIL import Image, ImageDraw, ImageFont

OUT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "img"


def font(bold=True):
    names = ["DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf", "LiberationSans-Bold.ttf" if bold else "LiberationSans-Regular.ttf"]
    for n in names:
        hits = glob.glob(f"/usr/share/fonts/**/{n}", recursive=True)
        if hits:
            return hits[0]
    return None


B, R = font(True), font(False)
INK, RED, SKY, LEAF, RULE, PAPER = (27, 35, 64), (229, 72, 77), (47, 127, 240), (34, 168, 107), (143, 178, 234), (246, 249, 255)


def f(path, size):
    return ImageFont.truetype(path, size) if path else ImageFont.load_default()


def block(d, x, y, w, h, c, ch, fs):
    d.rounded_rectangle([x, y + int(h * .09), x + w, y + h + int(h * .09)], radius=int(w * .2), fill=(14, 20, 44))
    d.rounded_rectangle([x, y, x + w, y + h], radius=int(w * .2), fill=c)
    ft = f(B, fs)
    bb = d.textbbox((0, 0), ch, font=ft)
    d.text((x + (w - (bb[2] - bb[0])) / 2 - bb[0], y + (h - (bb[3] - bb[1])) / 2 - bb[1]), ch, font=ft, fill=(255, 255, 255))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for s in (192, 512):
        im = Image.new("RGB", (s, s), INK)
        d = ImageDraw.Draw(im)
        w, gap = int(s * .27), int(s * .035)
        x0, y = (s - (3 * w + 2 * gap)) // 2, int(s * .33)
        for i, (c, ch) in enumerate([(RED, "A"), (SKY, "B"), (LEAF, "C")]):
            block(d, x0 + i * (w + gap), y - (int(s * .04) if i == 1 else 0), w, int(w * 1.08), c, ch, int(w * .62))
        im.save(OUT / f"icon-{s}.png")
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(im)
    y0 = 380
    d.line([(80, y0), (1120, y0)], fill=RULE, width=3)
    for x in range(80, 1120, 26):
        d.line([(x, y0 + 55), (x + 14, y0 + 55)], fill=RULE, width=3)
    d.line([(80, y0 + 110), (1120, y0 + 110)], fill=RED, width=4)
    for i, (c, ch) in enumerate([(RED, "A"), (SKY, "B"), (LEAF, "C")]):
        block(d, 80 + i * 150, 90 - (14 if i == 1 else 0), 130, 140, c, ch, 92)
    d.text((560, 105), "ABC.Academy", font=f(B, 74), fill=INK)
    d.text((563, 200), "Free early learning for ages 2-8", font=f(R, 34), fill=(74, 85, 120))
    d.text((96, 398), "Alphabet  ·  Phonics  ·  Sight words  ·  Math", font=f(B, 52), fill=INK)
    d.text((96, 540), "Games, read-along stories & printable worksheets", font=f(R, 32), fill=(74, 85, 120))
    im.save(OUT / "og.png", optimize=True)
    print("images written to", OUT)


if __name__ == "__main__":
    main()
