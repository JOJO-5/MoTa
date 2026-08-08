"""Check which tile ids in maps.json are missing from ICONS mapping.

Reads the ICONS definition directly from packages/render/src/icons.ts
so it always stays in sync with the source.
"""
import json
import re

with open('content/mota-2014/maps.json', 'r', encoding='utf-8') as f:
    maps = json.load(f)

# Parse ICONS from icons.ts
with open('packages/render/src/icons.ts', 'r', encoding='utf-8') as f:
    src = f.read()

# Extract the ICONS object literal
m = re.search(r'export const ICONS[^{]*({.*?})\n\}', src, re.DOTALL)
if not m:
    print('ERROR: could not find ICONS object in icons.ts')
    raise SystemExit(1)

icons_literal = m.group(1)

# Parse each cls block:  clsName: { id: num, ... }
ICONS = {}
for cls_match in re.finditer(r'(\w+):\s*\{([^}]*)\}', icons_literal):
    cls = cls_match.group(1)
    body = cls_match.group(2)
    ids = set()
    for entry in re.finditer(r'(\w+):\s*(\d+)', body):
        ids.add(entry.group(1))
    ICONS[cls] = ids

missing = {}
unknown_cls = {}
for tid, info in maps.items():
    cls = info.get('cls', '')
    id_val = info.get('id', '')
    if cls not in ICONS:
        if cls not in unknown_cls:
            unknown_cls[cls] = []
        unknown_cls[cls].append((tid, id_val))
    elif id_val not in ICONS[cls]:
        if cls not in missing:
            missing[cls] = []
        missing[cls].append((tid, id_val))

print("=== Missing ids (cls exists but id not in ICONS) ===")
total_missing = 0
for cls, entries in sorted(missing.items()):
    ids = sorted(set(e[1] for e in entries))
    print(f'{cls}: missing ids = {ids}')
    total_missing += len(entries)
print(f'TOTAL missing tile entries: {total_missing}')

print("\n=== Unknown cls (not in ICONS at all) ===")
for cls, entries in sorted(unknown_cls.items()):
    ids = sorted(set(e[1] for e in entries))
    print(f'{cls}: {len(entries)} entries, ids = {ids[:10]}...')
