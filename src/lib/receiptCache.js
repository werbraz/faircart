const CACHE_KEY = 'faircart_receipt_patterns'

export function loadPatterns() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]')
  } catch {
    return []
  }
}

export function savePattern(storeName, items) {
  const patterns = loadPatterns()
  const existing = patterns.findIndex(p => p.store === storeName)
  const entry = { store: storeName, items, savedAt: Date.now() }
  if (existing >= 0) {
    patterns[existing] = entry
  } else {
    patterns.unshift(entry)
    if (patterns.length > 20) patterns.pop()
  }
  localStorage.setItem(CACHE_KEY, JSON.stringify(patterns))
}

export function getFewShotExamples(limit = 2) {
  return loadPatterns()
    .slice(0, limit)
    .map(p => `ร้าน: ${p.store}\nรายการ: ${p.items.map(i => `${i.name} ${i.price}`).join(', ')}`)
    .join('\n---\n')
}

export function clearPatterns() {
  localStorage.removeItem(CACHE_KEY)
}
