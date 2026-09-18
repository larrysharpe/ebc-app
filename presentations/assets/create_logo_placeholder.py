"""Create a refined logo placeholder until the official EBC logo is provided."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).with_name("ebc-logo-placeholder.png")
SIZE = 512
BURGUNDY = (107, 30, 47, 255)
GOLD = (196, 163, 90, 255)
WHITE = (255, 255, 255, 255)

img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

margin = 24
draw.ellipse([margin, margin, SIZE - margin, SIZE - margin], fill=BURGUNDY)
inner = margin + 18
draw.ellipse([inner, inner, SIZE - inner, SIZE - inner], outline=GOLD, width=6)

try:
    font_large = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia.ttf", 140)
    font_small = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia.ttf", 36)
except OSError:
    font_large = ImageFont.load_default()
    font_small = font_large

text = "EBC"
bbox = draw.textbbox((0, 0), text, font=font_large)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
draw.text(((SIZE - tw) / 2, (SIZE - th) / 2 - 28), text, fill=WHITE, font=font_large)

sub = "EBENEZER"
bbox2 = draw.textbbox((0, 0), sub, font=font_small)
sw = bbox2[2] - bbox2[0]
draw.text(((SIZE - sw) / 2, SIZE / 2 + 70), sub, fill=GOLD, font=font_small)

img.save(OUT)
print(f"Wrote {OUT}")
