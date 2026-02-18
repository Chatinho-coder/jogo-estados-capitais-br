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

function GameHeader({ score, streak, errors, index, total }) {
  return (
    <header className="hero panel game-hero">
      <div>
        <p className="eyebrow">GeoMestre Brasil</p>
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
  const [showSettings, setShowSettings] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const current = queue[index]
  const ended = errors >= MAX_ERRORS || index >= queue.length

  const stateOptions = useMemo(() => (current ? getOptions(current, 'estado') : []), [current])
  const capitalOptions = useMemo(() => (current ? getOptions(current, 'capital') : []), [current])

  const stateSuggestions = useMemo(() => STATES_DATA.filter((s) => includesNormalized(stateAnswer, s.estado)).slice(0, 6), [stateAnswer])
  const capitalSuggestions = useMemo(() => STATES_DATA.filter((s) => includesNormalized(capitalAnswer, s.capital)).slice(0, 6), [capitalAnswer])

  useEffect(() => {
    document.body.classList.toggle('game-active', mode === 'game' && !ended)
    return () => document.body.classList.remove('game-active')
  }, [mode, ended])

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
    setShowOptions(false)
    setShowSettings(false)
    setMode(newMode)
  }

  function submitRound() {
    const stateOk = isCorrectAnswer(stateAnswer, current.estado)
    const capitalOk = isCorrectAnswer(capitalAnswer, current.capital)
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
    }, 450)
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
      <GameHeader score={score} streak={streak} errors={errors} index={index} total={queue.length} />

      <section className="panel game-panel">
        <div className="topline">
          <h2>Rodada {index + 1}</h2>
          <div className="topline-actions">
            <button className="btn btn-secondary" onClick={() => setShowSettings(true)}>Configurações</button>
            <button className="btn btn-secondary" onClick={() => setShowOptions(true)}>Opções</button>
          </div>
        </div>

        <p className="muted">Qual é o estado destacado e qual a sua capital?</p>

        <div className="map-panel game-map-panel">
          <BrazilMap highlightedState={current?.estado} />
        </div>

        <div className="fields-grid">
          {difficulty === 'facil' ? (
            <>
              <OptionButtons label="Estado" options={stateOptions} value={stateAnswer} onChange={setStateAnswer} />
              <OptionButtons label="Capital" options={capitalOptions} value={capitalAnswer} onChange={setCapitalAnswer} />
            </>
          ) : (
            <>
              <label>
                Estado
                <input value={stateAnswer} onChange={(e) => setStateAnswer(e.target.value)} list={difficulty === 'medio' ? 'estados-list' : undefined} />
              </label>
              <label>
                Capital
                <input value={capitalAnswer} onChange={(e) => setCapitalAnswer(e.target.value)} list={difficulty === 'medio' ? 'capitais-list' : undefined} />
              </label>
              <datalist id="estados-list">{stateSuggestions.map((s) => <option key={s.uf} value={s.estado} />)}</datalist>
              <datalist id="capitais-list">{capitalSuggestions.map((s) => <option key={s.capital} value={s.capital} />)}</datalist>
            </>
          )}
        </div>

        <div className="actions-row game-actions">
          <button className="btn btn-primary" onClick={submitRound} disabled={!normalizeText(stateAnswer) || !normalizeText(capitalAnswer)}>Confirmar</button>
        </div>

        <p className="feedback" aria-live="polite">{feedback}</p>
      </section>

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
              <button className="btn btn-secondary" onClick={() => { setShowOptions(false); setMode('study') }}>Modo estudo</button>
              <button className="btn btn-secondary" onClick={() => { setShowOptions(false); resetGame('menu') }}>Voltar ao menu</button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
