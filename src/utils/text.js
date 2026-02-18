export function normalizeText(text = '') {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

export function includesNormalized(query, candidate) {
  return normalizeText(candidate).includes(normalizeText(query))
}
