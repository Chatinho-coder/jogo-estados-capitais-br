import { describe, expect, it } from 'vitest'
import { isCorrectAnswer, scoreRound } from './validation'

describe('validation', () => {
  it('valida com tolerância a acentos', () => {
    expect(isCorrectAnswer('sao paulo', 'São Paulo')).toBe(true)
  })

  it('calcula pontos com bônus de streak', () => {
    const r = scoreRound({ stateOk: true, capitalOk: true, streak: 3 })
    expect(r.points).toBe(31)
  })
})
