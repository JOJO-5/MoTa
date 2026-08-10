const KEY_LABELS: Array<[string, string]> = [
  ['yellowKey', '黄'],
  ['blueKey', '蓝'],
  ['redKey', '红'],
  ['greenKey', '绿'],
  ['steelKey', '铁'],
  ['bigKey', '大'],
]

const KEY_NAMES: Record<string, string> = {
  yellowKey: '黄钥匙',
  blueKey: '蓝钥匙',
  redKey: '红钥匙',
  greenKey: '绿钥匙',
  steelKey: '铁钥匙',
  bigKey: '大钥匙',
  MagicKey: '魔法钥匙',
}

export function formatKeyCounts(keys: Record<string, number>): string {
  return KEY_LABELS.map(([id, label]) => `${label}${keys[id] ?? 0}`).join(' ')
}

export function formatKeyRequirement(keyId: string, count: number): string {
  return `需要${KEY_NAMES[keyId] ?? '钥匙'}×${count}`
}
