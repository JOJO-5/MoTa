const KEY_LABELS: Array<[string, string]> = [
  ['yellowKey', '黄'],
  ['blueKey', '蓝'],
  ['redKey', '红'],
  ['greenKey', '绿'],
  ['steelKey', '铁'],
  ['bigKey', '大'],
]

export function formatKeyCounts(keys: Record<string, number>): string {
  return KEY_LABELS.map(([id, label]) => `${label}${keys[id] ?? 0}`).join(' ')
}
