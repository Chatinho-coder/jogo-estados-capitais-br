import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { BrazilMap } from './components/BrazilMap'
import { STATES_DATA, STATES_BY_NAME } from './data/statesData'
import { includesNormalized, normalizeText } from './utils/text'
import { isCorrectAnswer, scoreRound } from './utils/validation'

const MAX_ERRORS = 5

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function getOptions(current, key) {
  return shuffle([current[key], ...shuffle(STATES_DATA.filter((s) => s.uf !== current.uf)).slice(0, 3).map((s) => s[key])])
}

function GameHeader({ score, streak, errors, index, total, onOpenMenu }) {
  return (
    <header className="hero panel game-hero">
      <div className="game-title-row">
        <p className="eyebrow">GeoMestre Brasil</p>
        <button className="btn btn-quiet" onClick={onOpenMenu} aria-label="Abrir menu do jogo">⋯</button>
      </div>
      <div className="hud" aria-label="Indicadores de jogo">
        <span className="chip"><strong>{score}</strong><small>pontos</small></span>
        <span className="chip"><strong>{streak}</strong><small>sequência</small></span>
        <span className="chip"><strong>{errors}/{MAX_ERRORS}</strong><small>erros</small></span>
        <span className="chip"><strong>{Math.min(index + 1, total)}</strong><small>rodada</small></span>
      </div>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.min(index, total)}>
        <span style={{ width: `${(Math.min(index, total) / total) * 100}%` }} />
      </div>
    </header>
  )
}

function OptionButtons({ label, options, value, onChange }) {
  return (
    <fieldset className="option-group">
      <legend>{label}</legend>
      <div className="option-buttons" role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const selected = value === o
          return (
            <button
              type="button"
              key={o}
              role="radio"
              aria-checked={selected}
              className={`option-btn ${selected ? 'is-selected' : ''}`}
              onClick={() => onChange(o)}
            >
              {o}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export default function App() {
  const [mode, setMode] = useState('menu')
  const [difficulty, setDifficulty] = useState('facil')
  const [queue, setQueue] = useState(shuffle(STATES_DATA))
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [errors, setErrors] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [wrongAnswers, setWrongAnswers] = useState([])
  const [stateAnswer, setStateAnswer] = useState('')
  const [capitalAnswer, setCapitalAnswer] = useState('')
  const [draftStateAnswer, setDraftStateAnswer] = useState('')
  const [draftCapitalAnswer, setDraftCapitalAnswer] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [showAnswerSheet, setShowAnswerSheet] = useState(false)

  const current = queue[index]
  const ended = errors >= MAX_ERRORS || index >= queue.length

  const stateOptions = useMemo(() => (current ? getOptions(current, 'estado') : []), [current])
  const capitalOptions = useMemo(() => (current ? getOptions(current, 'capital') : []), [current])

  const stateSuggestions = useMemo(() => STATES_DATA.filter((s) => includesNormalized(draftStateAnswer, s.estado)).slice(0, 6), [draftStateAnswer])
  const capitalSuggestions = useMemo(() => STATES_DATA.filter((s) => includesNormalized(draftCapitalAnswer, s.capital)).slice(0, 6), [draftCapitalAnswer])

  useEffect(() => {
    document.body.classList.toggle('game-active', mode === 'game' && !ended)
    return () => document.body.classList.remove('game-active')
  }, [mode, ended])

  useEffect(() => {
    if (!showAnswerSheet) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowAnswerSheet(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showAnswerSheet])

  function resetGame(newMode = 'menu') {
    setQueue(shuffle(STATES_DATA))
    setIndex(0)
    setScore(0)
    setStreak(0)
    setErrors(0)
    setFeedback('')
    setWrongAnswers([])
    setStateAnswer('')
    setCapitalAnswer('')
    setDraftStateAnswer('')
    setDraftCapitalAnswer('')
    setShowAnswerSheet(false)
    setShowOptions(false)
    setShowSettings(false)
    setMode(newMode)
  }

  function openAnswerSheet() {
    setDraftStateAnswer(stateAnswer)
    setDraftCapitalAnswer(capitalAnswer)
    setShowAnswerSheet(true)
  }

  function cancelAnswerDraft() {
    setDraftStateAnswer('')
    setDraftCapitalAnswer('')
    setStateAnswer('')
    setCapitalAnswer('')
    setShowAnswerSheet(false)
  }

  function submitRound(selectedState = stateAnswer, selectedCapital = capitalAnswer) {
    const stateOk = isCorrectAnswer(selectedState, current.estado)
    const capitalOk = isCorrectAnswer(selectedCapital, current.capital)
    const round = scoreRound({ stateOk, capitalOk, streak })

    if (stateOk && capitalOk) {
      setScore((s) => s + round.points)
      setStreak((s) => s + 1)
      setFeedback(`✅ Perfeito! +${round.points} pontos (bônus de sequência: ${round.streakBonus})`)
    } else {
      setErrors((e) => e + 1)
      setStreak(0)
      setWrongAnswers((prev) => [...prev, { estado: current.estado, capital: current.capital }])
      setFeedback(`❌ Correto: ${current.estado} — ${current.capital}. Dica: ${current.dica}`)
      setScore((s) => s + round.points)
    }

    setTimeout(() => {
      setIndex((i) => i + 1)
      setStateAnswer('')
      setCapitalAnswer('')
      setDraftStateAnswer('')
      setDraftCapitalAnswer('')
    }, 450)
  }

  function confirmAnswerDraft() {
    setStateAnswer(draftStateAnswer)
    setCapitalAnswer(draftCapitalAnswer)
    setShowAnswerSheet(false)
    submitRound(draftStateAnswer, draftCapitalAnswer)
  }

  if (mode === 'menu') {
    return (
      <main className="container">
        <section className="hero panel">
          <p className="eyebrow">GeoMestre Brasil</p>
          <h1>Geografia do Brasil com elegância e precisão</h1>
          <p className="muted">Treine estados e capitais em uma experiência limpa, acessível e focada em aprendizado real.</p>
          <div className="actions-row">
            <button className="btn btn-primary" onClick={() => resetGame('game')}>Iniciar jogo</button>
            <button className="btn btn-secondary" onClick={() => setMode('study')}>Modo estudo</button>
          </div>
        </section>
      </main>
    )
  }

  if (mode === 'study') {
    return (
      <main className="container">
        <section className="panel">
          <p className="eyebrow">Modo estudo</p>
          <h1>Explore o mapa com calma</h1>
          <p className="muted">Clique (ou use Tab + Enter) em um estado para visualizar a capital.</p>
          <div className="map-panel">
            <BrazilMap
              focusable
              onStateClick={(name) => {
                const s = STATES_BY_NAME[name]
                setFeedback(`${name}: capital ${s?.capital ?? '—'}`)
              }}
            />
          </div>
          <p className="feedback" aria-live="polite">{feedback || 'Dica de acessibilidade: navegue pelos estados com Tab e confirme com Enter.'}</p>
        </section>

        {wrongAnswers.length > 0 && (
          <section className="panel">
            <h2>Revisão rápida</h2>
            <div className="review-grid">
              {wrongAnswers.map((w, i) => (
                <p key={`${w.estado}-${i}`} className="review-item"><strong>{w.estado}</strong><span>{w.capital}</span></p>
              ))}
            </div>
          </section>
        )}

        <div className="actions-row">
          <button className="btn btn-secondary" onClick={() => setMode('menu')}>Voltar ao menu</button>
          <button className="btn btn-primary" onClick={() => resetGame('game')}>Jogar agora</button>
        </div>
      </main>
    )
  }

  if (ended) {
    return (
      <main className="container">
        <section className="panel">
          <p className="eyebrow">Resultado final</p>
          <h1>Fim de jogo</h1>
          <div className="review-grid summary-grid">
            <p className="review-item"><strong>Pontuação</strong><span>{score}</span></p>
            <p className="review-item"><strong>Maior sequência</strong><span>{streak}</span></p>
            <p className="review-item"><strong>Erros</strong><span>{errors} / {MAX_ERRORS}</span></p>
          </div>
          <h2>Resumo pedagógico</h2>
          <div className="review-grid">
            {wrongAnswers.length ? wrongAnswers.map((w, i) => (
              <p key={`${w.estado}-${i}`} className="review-item"><strong>{w.estado}</strong><span>{w.capital}</span></p>
            )) : <p className="muted">Sem erros. Excelente desempenho.</p>}
          </div>
          <div className="actions-row">
            <button className="btn btn-primary" onClick={() => resetGame('game')}>Jogar novamente</button>
            <button className="btn btn-secondary" onClick={() => setMode('study')}>Revisar no estudo</button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="container game-container">
      <GameHeader score={score} streak={streak} errors={errors} index={index} total={queue.length} onOpenMenu={() => setShowOptions(true)} />

      <section className="panel game-panel" aria-label="Rodada atual">
        <div className="round-title">
          <h2>Estado destacado</h2>
          <p className="muted">Rodada {index + 1}</p>
        </div>

        <div className="map-panel game-map-panel">
          <BrazilMap highlightedState={current?.estado} />
        </div>

        <p className="feedback" aria-live="polite">{feedback || 'Toque em “Resposta” para abrir o painel de resposta.'}</p>

        <div className="cta-wrap">
          <button className="btn btn-primary btn-answer" onClick={openAnswerSheet}>Resposta</button>
        </div>
      </section>

      {showAnswerSheet && (
        <div className="overlay answer-overlay" role="dialog" aria-modal="true" aria-label="Responder rodada">
          <section className="panel overlay-panel answer-panel">
            <div className="overlay-head">
              <h3>Responder rodada</h3>
              <button className="btn btn-secondary" onClick={() => setShowAnswerSheet(false)}>Fechar</button>
            </div>

            <div className="question-context">
              <p className="muted">Estado destacado no mapa:</p>
              <strong>{current?.estado}</strong>
            </div>

            <div className="fields-grid answer-fields">
              {difficulty === 'facil' ? (
                <>
                  <OptionButtons label="Estado" options={stateOptions} value={draftStateAnswer} onChange={setDraftStateAnswer} />
                  <OptionButtons label="Capital" options={capitalOptions} value={draftCapitalAnswer} onChange={setDraftCapitalAnswer} />
                </>
              ) : (
                <>
                  <label>
                    Estado
                    <input
                      value={draftStateAnswer}
                      onChange={(e) => setDraftStateAnswer(e.target.value)}
                      list={difficulty === 'medio' ? 'estados-list' : undefined}
                    />
                  </label>
                  <label>
                    Capital
                    <input
                      value={draftCapitalAnswer}
                      onChange={(e) => setDraftCapitalAnswer(e.target.value)}
                      list={difficulty === 'medio' ? 'capitais-list' : undefined}
                    />
                  </label>
                  <datalist id="estados-list">{stateSuggestions.map((s) => <option key={s.uf} value={s.estado} />)}</datalist>
                  <datalist id="capitais-list">{capitalSuggestions.map((s) => <option key={s.capital} value={s.capital} />)}</datalist>
                </>
              )}
            </div>

            <div className="answer-actions">
              <button className="btn btn-secondary" onClick={cancelAnswerDraft}>Cancelar</button>
              <button
                className="btn btn-primary"
                onClick={confirmAnswerDraft}
                disabled={!normalizeText(draftStateAnswer) || !normalizeText(draftCapitalAnswer)}
              >
                Confirmar
              </button>
            </div>
          </section>
        </div>
      )}

      {showSettings && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Configurações">
          <section className="panel overlay-panel">
            <div className="overlay-head">
              <h3>Configurações</h3>
              <button className="btn btn-secondary" onClick={() => setShowSettings(false)}>Fechar</button>
            </div>
            <label className="inline-field" htmlFor="difficulty-select">
              Dificuldade
              <select id="difficulty-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="facil">Fácil (múltipla escolha)</option>
                <option value="medio">Médio (assistido)</option>
                <option value="dificil">Difícil (livre)</option>
              </select>
            </label>
          </section>
        </div>
      )}

      {showOptions && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Opções">
          <section className="panel overlay-panel">
            <div className="overlay-head">
              <h3>Opções</h3>
              <button className="btn btn-secondary" onClick={() => setShowOptions(false)}>Fechar</button>
            </div>
            <div className="overlay-actions">
              <button className="btn btn-secondary" onClick={() => { setShowOptions(false); setShowSettings(true) }}>Configurações</button>
              <button className="btn btn-secondary" onClick={() => { setShowOptions(false); setMode('study') }}>Modo estudo</button>
              <button className="btn btn-secondary" onClick={() => { setShowOptions(false); resetGame('menu') }}>Voltar ao menu</button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
