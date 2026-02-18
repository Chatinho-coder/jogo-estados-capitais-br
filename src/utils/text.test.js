import { describe, expect, it } from 'vitest'
import { normalizeText } from './text'

describe('normalizeText', () => {
  it('remove acentos e caixa', () => {
    expect(normalizeText('  São Luís  ')).toBe('sao luis')
  })
})
