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

# Play triangle, in the same 512-space. The three points below are the *outer*
# outline the old 32px stroke used to produce, so the mark keeps its size; the
# corners are rounded here instead of by stroking.
PLAY_TRI = [(196.0, 150.8), (196.0, 361.2), (384.9, 256.0)]
PLAY_R = 26.0


def _rounded_polygon(tri, r, steps=18):
    """Replace each corner of `tri` with an arc of radius r."""
    import math

    def unit(p, q):
        dx, dy = q[0] - p[0], q[1] - p[1]
        length = math.hypot(dx, dy)
        return (dx / length, dy / length)

    out = []
    n = len(tri)
    for i in range(n):
        v, prev, nxt = tri[i], tri[(i - 1) % n], tri[(i + 1) % n]
        u1, u2 = unit(v, prev), unit(v, nxt)
        half = math.acos(max(-1.0, min(1.0, u1[0] * u2[0] + u1[1] * u2[1]))) / 2
        dist = r / math.tan(half)
        t1 = (v[0] + u1[0] * dist, v[1] + u1[1] * dist)
        t2 = (v[0] + u2[0] * dist, v[1] + u2[1] * dist)
        bx, by = u1[0] + u2[0], u1[1] + u2[1]
        blen = math.hypot(bx, by)
        bx, by = bx / blen, by / blen
        centre = (v[0] + bx * (r / math.sin(half)), v[1] + by * (r / math.sin(half)))
        a1 = math.atan2(t1[1] - centre[1], t1[0] - centre[0])
        a2 = math.atan2(t2[1] - centre[1], t2[0] - centre[0])
        while a2 - a1 > math.pi:
            a2 -= 2 * math.pi
        while a1 - a2 > math.pi:
            a2 += 2 * math.pi
        for step in range(steps + 1):
            a = a1 + (a2 - a1) * step / steps
            out.append((centre[0] + math.cos(a) * r, centre[1] + math.sin(a) * r))
    return out


PLAY_SHAPE = _rounded_polygon(PLAY_TRI, PLAY_R)


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

    # Play triangle.
    #
    # Drawn as one filled polygon whose corners are already rounded, rather than
    # a thin triangle fattened by a wide outline: Pillow's joint="curve" rounds
    # the joints *between* points but not the seam where the outline closes back
    # on itself, which left a visible notch on the top-left corner.
    white = (255, 255, 255, 255)
    draw.polygon([(s(x), s(y)) for x, y in PLAY_SHAPE], fill=white)

    return img.resize((SIZE, SIZE), Image.LANCZOS)


APPX = Path(__file__).resolve().parent / "appx"


def _placed(icon: Image.Image, w: int, h: int, frac: float) -> Image.Image:
    """The logo centred on a transparent w x h canvas, `frac` of the short side."""
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    side = max(1, round(min(w, h) * frac))
    logo = icon.resize((side, side), Image.LANCZOS)
    canvas.alpha_composite(logo, ((w - side) // 2, (h - side) // 2))
    return canvas


def write_store_assets(icon: Image.Image) -> None:
    """Tiles and logos for the Microsoft Store (MSIX) package.

    electron-builder picks these up from build/appx. Without them it ships
    Electron's sample artwork. Each image is written at 100% and 200% scale;
    the 44x44 logo also gets the target-size variants the taskbar and Start use,
    in "unplated" form so Windows draws the icon itself rather than on a tile.
    """
    APPX.mkdir(exist_ok=True)
    for old in APPX.glob("*.png"):
        old.unlink()

    # name: (width, height, share of the short side the logo takes)
    tiles = {
        "StoreLogo": (50, 50, 1.0),
        "Square44x44Logo": (44, 44, 1.0),
        "SmallTile": (71, 71, 0.70),
        "Square150x150Logo": (150, 150, 0.60),
        "Wide310x150Logo": (310, 150, 0.60),
        "LargeTile": (310, 310, 0.55),
        "SplashScreen": (620, 300, 0.55),
    }
    written = 0
    for name, (w, h, frac) in tiles.items():
        for scale in (100, 200):
            k = scale / 100
            _placed(icon, round(w * k), round(h * k), frac).save(APPX / f"{name}.scale-{scale}.png")
            written += 1

    for size in (16, 24, 32, 48, 256):
        img = icon.resize((size, size), Image.LANCZOS)
        img.save(APPX / f"Square44x44Logo.targetsize-{size}.png")
        img.save(APPX / f"Square44x44Logo.targetsize-{size}_altform-unplated.png")
        written += 2
    print(f"wrote {written} Store assets to {APPX}")


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
    write_store_assets(icon)


if __name__ == "__main__":
    main()
