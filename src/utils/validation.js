import { normalizeText } from './text'

export function isCorrectAnswer(input, expected) {
  return normalizeText(input) === normalizeText(expected)
}

export function scoreRound({ stateOk, capitalOk, streak }) {
  const baseState = stateOk ? 10 : 0
  const baseCapital = capitalOk ? 15 : 0
  const streakBonus = stateOk && capitalOk ? Math.min(streak * 2, 20) : 0
  return {
    points: baseState + baseCapital + streakBonus,
    baseState,
    baseCapital,
    streakBonus,
  }
}
