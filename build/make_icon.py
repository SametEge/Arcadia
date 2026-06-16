"""Generate Arcadia's app icon (icon.ico) and a high-res logo (icon.png).

Draws the same mark as assets/logo.svg (emerald hexagon + play triangle) using
Pillow so we don't need an SVG rasterizer.  Run from anywhere:  py build/make_icon.py
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ASSETS = Path(__file__).resolve().parent.parent / "assets"
ASSETS.mkdir(exist_ok=True)

SS = 4            # supersample factor for crisp edges
SIZE = 512
W = SIZE * SS

# Brand colours (match logo.svg) — emerald gradient
C1 = (26, 204, 145)    # emerald      #1ACC91
C2 = (10, 157, 103)    # deep emerald #0A9D67

# Hexagon vertices in 512-space (pointy top/bottom, vertical sides).
# Sized to nearly fill the canvas so it doesn't look small next to other icons.
HEX = [(256, 30), (452, 143), (452, 369), (256, 482), (60, 369), (60, 143)]


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def diagonal_gradient(size: int) -> Image.Image:
    """Two-stop diagonal emerald gradient, built small then upscaled (smooth)."""
    g = 128
    grad = Image.new("RGB", (g, g))
    px = grad.load()
    for y in range(g):
        for x in range(g):
            px[x, y] = lerp(C1, C2, (x + y) / (2 * (g - 1)))
    return grad.resize((size, size), Image.BICUBIC)


def hexagon_mask(size: int) -> Image.Image:
    m = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(m)
    pts = [(x / 512 * size, y / 512 * size) for (x, y) in HEX]
    d.polygon(pts, fill=255)
    return m


def build() -> Image.Image:
    img = Image.new("RGBA", (W, W), (0, 0, 0, 0))

    # Hexagon tile = gradient clipped to the hexagon
    grad = diagonal_gradient(W).convert("RGBA")
    mask = hexagon_mask(W)
    img.paste(grad, (0, 0), mask)

    draw = ImageDraw.Draw(img)

    def s(v):  # scale a 512-space coord into render space
        return v * SS

    # Subtle top sheen, clipped to the hexagon
    sheen = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sheen)
    for i in range(int(s(260))):
        alpha = int(40 * (1 - i / s(260)))
        sd.line([(0, s(30) + i), (W, s(30) + i)], fill=(255, 255, 255, alpha))
    img.alpha_composite(Image.composite(sheen, Image.new("RGBA", (W, W), (0, 0, 0, 0)), mask))

    # Clean play triangle with smoothly rounded corners
    pts = [(s(212), s(178)), (s(212), s(334)), (s(352), s(256))]
    white = (255, 255, 255, 255)
    draw.polygon(pts, fill=white)
    draw.line(pts + [pts[0]], fill=white, width=int(s(32)), joint="curve")

    return img.resize((SIZE, SIZE), Image.LANCZOS)


def main() -> None:
    icon = build()
    png_path = ASSETS / "icon.png"
    ico_path = ASSETS / "icon.ico"
    icon.save(png_path)
    icon.save(
        ico_path,
        sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )
    print(f"wrote {png_path}")
    print(f"wrote {ico_path}")


if __name__ == "__main__":
    main()
