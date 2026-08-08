"""Analyze which tile IDs in floor MT0 are still rendering as black tiles.
A "tileset" tileId >= 10000 maps to frame = tileId - 10000 in tileset.png.
We check if the corresponding frame in tileset.png is non-empty (not all-black).
"""
import json
from PIL import Image
import os

with open('content/mota-2014/floors/MT0.json', 'r', encoding='utf-8') as f:
    mt0 = json.load(f)
print(f"MT0 dimensions: {len(mt0['map'])} rows x {len(mt0['map'][0])} cols")
print(f"MT0 defaultGround: {mt0.get('defaultGround')}")
print(f"MT0 cannotMove: {mt0.get('cannotMove')}")
print(f"MT0 changeFloor keys: {list((mt0.get('changeFloor') or {}).keys())[:10]}")
print(f"MT0 events count: {len(mt0.get('events') or {})}")
print(f"MT0 tileset per layer:")

# Load maps.json for mapping
with open('content/mota-2014/maps.json', 'r', encoding='utf-8') as f:
    maps = json.load(f)

# Load tileset image to check non-empty frames
tileset_path = 'apps/web/public/content/mota-2014/tilesets/magictower.png'
ts = Image.open(tileset_path).convert('RGBA')
TW = ts.size[0] // 32  # 8
TH = ts.size[1] // 32

def is_frame_blank(frame_idx):
    if frame_idx >= TW * TH:
        return True, f'frame_idx {frame_idx} >= total frames {TW*TH}'
    x = (frame_idx % TW) * 32
    y = (frame_idx // TW) * 32
    crop = ts.crop((x, y, x + 32, y + 32))
    # Check if all pixels are black or transparent
    pixels = list(crop.getdata())
    non_blank = [p for p in pixels if p[3] > 0 and (p[0] + p[1] + p[2]) > 30]
    if not non_blank:
        return True, 'fully transparent/black'
    return False, f'{len(non_blank)} non-blank pixels'

# Tally all tile IDs per layer
for layer_name in ['bgmap', 'map', 'fgmap']:
    layer = mt0.get(layer_name) or []
    tile_ids = set()
    positions = {}
    for y, row in enumerate(layer):
        for x, tid in enumerate(row):
            if tid == 0:
                continue
            tile_ids.add(tid)
            positions.setdefault(tid, []).append((x, y))
    print(f"\n  {layer_name}: {len(tile_ids)} unique tile IDs, total non-zero {sum(len(v) for v in positions.values())}")
    # Show tileset (>= 10000) ones
    ts_ids = sorted([t for t in tile_ids if t >= 10000])
    print(f"    tileset ids: {ts_ids[:30]}{'...' if len(ts_ids) > 30 else ''}")
    if ts_ids:
        # Check if any are blank
        blank_count = 0
        for tid in ts_ids[:20]:
            frame = tid - 10000
            blank, reason = is_frame_blank(frame)
            if blank:
                blank_count += 1
                print(f"    TILEID {tid} (frame {frame}): BLANK - {reason}")
            else:
                print(f"    TILEID {tid} (frame {frame}): OK")
        if blank_count > 0:
            print(f"    {blank_count}/{min(20, len(ts_ids))} of first 20 are blank")
    # Show non-tileset ids
    other_ids = sorted([t for t in tile_ids if t < 10000])
    print(f"    other (non-tileset) ids: {other_ids[:20]}{'...' if len(other_ids) > 20 else ''}")
    if other_ids:
        for tid in other_ids[:10]:
            entry = maps.get(str(tid), {})
            print(f"    TILEID {tid}: cls={entry.get('cls')!r}, id={entry.get('id')!r}")