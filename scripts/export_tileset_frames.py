"""Export tileset.png frames that are used as walls/obstacles in MT0."""
import json
from PIL import Image

with open('content/mota-2014/floors/MT0.json', 'r', encoding='utf-8') as f:
    mt0 = json.load(f)

# Collect all tileIds
all_ids = set()
for layer in [mt0.get('bgmap'), mt0.get('map'), mt0.get('fgmap')]:
    if layer:
        for row in layer:
            all_ids.update(row)

ts_ids = sorted([t for t in all_ids if t >= 10000])
print(f"Unique tileset IDs: {len(ts_ids)}")

ts = Image.open('apps/web/public/content/mota-2014/tilesets/magictower.png')
TW = ts.size[0] // 32

# Build composite of used frames
frames = []
for tid in ts_ids:
    frame = tid - 10000
    x = (frame % TW) * 32
    y = (frame // TW) * 32
    crop = ts.crop((x, y, x + 32, y + 32))
    frames.append((tid, frame, crop))

# Save each frame + composite grid
import os
os.makedirs('docs/screenshots/tileset-frames', exist_ok=True)
cols = 8
rows = (len(frames) + cols - 1) // cols
sheet = Image.new('RGBA', (cols * 32, rows * 32), (40, 40, 60, 255))
for i, (tid, frame, crop) in enumerate(frames):
    cx = (i % cols) * 32
    cy = (i // cols) * 32
    sheet.paste(crop, (cx, cy), crop)

sheet.save('docs/screenshots/tileset-frames/mt0-all.png')
print(f"Saved {len(frames)} frames in docs/screenshots/tileset-frames/mt0-all.png")

# Print stats for each
for tid, frame, crop in frames:
    pixels = list(crop.getdata())
    # avg color
    if pixels:
        avg_r = sum(p[0] for p in pixels) // len(pixels)
        avg_g = sum(p[1] for p in pixels) // len(pixels)
        avg_b = sum(p[2] for p in pixels) // len(pixels)
        avg_a = sum(p[3] for p in pixels) // len(pixels)
        non_blank = [p for p in pixels if p[3] > 0 and (p[0] + p[1] + p[2]) > 30]
        print(f"  T{tid} frame {frame:4d}: {len(non_blank):4d}/{len(pixels)} non-blank, avg=({avg_r},{avg_g},{avg_b},{avg_a})")