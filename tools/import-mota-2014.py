# -*- coding: utf-8 -*-
import os
import re
import json
from pathlib import Path
import chardet

source_dir = Path(__file__).parent.parent / 'Magictower2014' / '魔塔2014' / 'project'
output_dir = Path(__file__).parent.parent / 'content' / 'mota-2014'

def detect_and_read(filepath):
    with open(filepath, 'rb') as f:
        raw = f.read()
    result = chardet.detect(raw)
    encoding = result.get('encoding', 'utf-8')
    confidence = result.get('confidence', 0)
    print(f'  Detected: {encoding} ({confidence:.1%})')
    if encoding:
        try:
            return raw.decode(encoding)
        except:
            pass
    for enc in ['utf-8', 'gbk', 'gb2312', 'gb18030']:
        try:
            return raw.decode(enc)
        except:
            continue
    return raw.decode('utf-8', errors='replace')

def extract_json_from_var(code):
    match = re.search(r'=\s*(\{)', code)
    if not match:
        return None
    start = match.start(1)
    depth = 0
    in_string = False
    escaped = False
    end_idx = start
    for i in range(start, len(code)):
        c = code[i]
        if escaped:
            escaped = False
            continue
        if c == '\\':
            escaped = True
            continue
        if c in ('"', "'"):
            in_string = not in_string
            continue
        if in_string:
            continue
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                end_idx = i + 1
                break
    json_str = code[start:end_idx]
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f'  Parse error: {e}')
        return None

def extract_floor_from_code(code, floor_id):
    pattern = rf'main\.floors\.{floor_id}\s*=\s*\{{'
    match = re.search(pattern, code)
    if not match:
        return None
    start = match.start()
    depth = 0
    in_string = False
    escaped = False
    end_idx = start
    for i in range(start, len(code)):
        c = code[i]
        if escaped:
            escaped = False
            continue
        if c == '\\':
            escaped = True
            continue
        if c in ('"', "'"):
            in_string = not in_string
            continue
        if in_string:
            continue
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                end_idx = i + 1
                break
    json_str = code[start:end_idx]
    match2 = re.search(r'=\s*(\{)', json_str)
    if match2:
        json_str = json_str[match2.start(1):]
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f'  Parse error for {floor_id}: {e}')
        return None

def clean_object(obj):
    if obj is None:
        return None
    if isinstance(obj, list):
        return [clean_object(item) for item in obj]
    if isinstance(obj, dict):
        return {k: clean_object(v) for k, v in obj.items() if v is not None}
    return obj

def import_data_file(filename, output_name, transform=None):
    src_path = source_dir / filename
    if not src_path.exists():
        print(f'Skipping {filename}')
        return None
    print(f'Processing {filename}...')
    code = detect_and_read(src_path)
    data = extract_json_from_var(code)
    if data and transform:
        data = transform(data)
    if data:
        cleaned = clean_object(data)
        out_path = output_dir / output_name
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(cleaned, f, ensure_ascii=False, indent=2)
        print(f'  Created {output_name}')
        return data
    print(f'  Failed to parse {filename}')
    return None

def import_floor(floor_id):
    floor_file = source_dir / 'floors' / f'{floor_id}.js'
    if not floor_file.exists():
        print(f'Not found: {floor_id}.js')
        return None
    code = detect_and_read(floor_file)
    floor_data = extract_floor_from_code(code, floor_id)
    if floor_data:
        cleaned = clean_object(floor_data)
        out_path = output_dir / 'floors' / f'{floor_id}.json'
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(cleaned, f, ensure_ascii=False, indent=2)
        print(f'  Created floors/{floor_id}.json')
        return floor_data
    print(f'  Failed to parse {floor_id}')
    return None

def main():
    target_floors = [f'MT{i}' for i in range(21)]
    (output_dir / 'floors').mkdir(parents=True, exist_ok=True)
    print('Importing Magictower2014 MT0-MT20...\n')

    def transform_data(d):
        if 'main' in d:
            main = d['main']
            if 'floorIds' in main:
                main['floorIds'] = [
                    fid for fid in main['floorIds']
                    if re.match(r'^MT\d+$', fid) and int(fid[2:]) <= 20
                ]
                main['floorIds'].sort(key=lambda x: int(x[2:]))
            return main
        return d

    import_data_file('data.js', 'data.json', transform_data)
    import_data_file('enemys.js', 'enemys.json')
    import_data_file('maps.js', 'maps.json')
    import_data_file('items.js', 'items.json')

    print('\nImporting floors:')
    for floor_id in target_floors:
        import_floor(floor_id)

    meta = {
        'id': 'mota-2014',
        'version': '1.0.0',
        'source': 'Magictower2014',
        'importedAt': '2026-08-07T00:00:00.000Z',
        'note': 'First 21 floors (MT0-MT20) imported from Magictower2014'
    }
    with open(output_dir / '_meta.json', 'w', encoding='utf-8') as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
    print('\nCreated _meta.json')
    print('\nDone!')

if __name__ == '__main__':
    main()
