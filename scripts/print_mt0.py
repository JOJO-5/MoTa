"""Print the complete map, bgmap, fgmap matrices of MT0 with tileId legend."""
import json

with open('content/mota-2014/floors/MT0.json', 'r', encoding='utf-8') as f:
    mt0 = json.load(f)

with open('content/mota-2014/maps.json', 'r', encoding='utf-8') as f:
    maps = json.load(f)

def decode(tid):
    if tid == 0:
        return '   .   '
    if tid >= 10000:
        return f'T{tid-10000:05d}'
    e = maps.get(str(tid), {})
    cls = e.get('cls', '?')
    id_ = e.get('id', '?')
    return f'{cls[:3]}:{id_[:5]:5s}'

def print_layer(layer_name, layer):
    print(f'\n=== {layer_name} ({len(layer)}x{len(layer[0])}) ===')
    print('     ' + ' '.join(f'{x:6d}' for x in range(len(layer[0]))))
    for y, row in enumerate(layer):
        print(f'y={y:2d} ' + ' '.join(f'{decode(tid):6s}' for tid in row))

print_layer('bgmap', mt0.get('bgmap') or [])
print_layer('map', mt0.get('map') or [])
print_layer('fgmap', mt0.get('fgmap') or [])