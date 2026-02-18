import { useMemo, useState } from 'react'
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

  const current = queue[index]
  const ended = errors >= MAX_ERRORS || index >= queue.length

  const stateOptions = useMemo(() => (current ? getOptions(current, 'estado') : []), [current])
  const capitalOptions = useMemo(() => (current ? getOptions(current, 'capital') : []), [current])

  const stateSuggestions = useMemo(() => STATES_DATA.filter((s) => includesNormalized(stateAnswer, s.estado)).slice(0, 6), [stateAnswer])
  const capitalSuggestions = useMemo(() => STATES_DATA.filter((s) => includesNormalized(capitalAnswer, s.capital)).slice(0, 6), [capitalAnswer])

  function resetGame(newMode = 'menu') {
    setQueue(shuffle(STATES_DATA)); setIndex(0); setScore(0); setStreak(0); setErrors(0); setFeedback(''); setWrongAnswers([])
    setStateAnswer(''); setCapitalAnswer(''); setMode(newMode)
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
    }, 600)
  }

  if (mode === 'menu') {
    return <main className="container"><h1>GeoMestre Brasil</h1><p>Aprenda estados e capitais com mapa interativo e desafios progressivos.</p>
      <div className="card"><h2>Escolha o modo</h2>
        <button onClick={() => resetGame('game')}>Jogar</button>
        <button onClick={() => setMode('study')}>Modo estudo</button>
      </div></main>
  }

  if (mode === 'study') {
    return <main className="container"><h1>Modo estudo</h1><p>Clique no estado para ver nome e capital.</p>
      <BrazilMap focusable onStateClick={(name) => { const s = STATES_BY_NAME[name]; setFeedback(`${name}: capital ${s?.capital ?? '—'}`) }} />
      <p className="feedback">{feedback || 'Dica: use TAB para focar e Enter para selecionar um estado.'}</p>
      {wrongAnswers.length > 0 && <div className="card"><h3>Flashcards de revisão (erros recentes)</h3>{wrongAnswers.map((w, i) => <p key={i}><strong>{w.estado}</strong> → {w.capital}</p>)}</div>}
      <button onClick={() => setMode('menu')}>Voltar</button></main>
  }

  if (ended) {
    return <main className="container"><h1>Fim de jogo</h1><div className="card"><p>Pontuação final: <strong>{score}</strong></p><p>Maior sequência: <strong>{streak}</strong></p><p>Erros: <strong>{errors}</strong> / {MAX_ERRORS}</p>
    <h3>Resumo pedagógico</h3>{wrongAnswers.length ? wrongAnswers.map((w, i) => <p key={i}>{w.estado} — {w.capital}</p>) : <p>Sem erros. Excelente!</p>}</div>
    <button onClick={() => resetGame('game')}>Jogar novamente</button> <button onClick={() => setMode('study')}>Revisar no modo estudo</button></main>
  }

  return (
    <main className="container">
      <h1>GeoMestre Brasil</h1>
      <div className="hud"><span>Pontos: {score}</span><span>Sequência: {streak}</span><span>Erros: {errors}/{MAX_ERRORS}</span></div>
      <label>Dificuldade: <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><option value="facil">Fácil (múltipla escolha)</option><option value="medio">Médio (assistido)</option><option value="dificil">Difícil (livre)</option></select></label>
      <BrazilMap highlightedState={current?.estado} />
      <section className="card">
        <h2>Rodada {index + 1}</h2>
        <p>Qual é o estado destacado e qual a sua capital?</p>

        {difficulty === 'facil' ? <>
          <label>Estado: <select value={stateAnswer} onChange={(e) => setStateAnswer(e.target.value)}><option value="">Selecione...</option>{stateOptions.map((o) => <option key={o}>{o}</option>)}</select></label>
          <label>Capital: <select value={capitalAnswer} onChange={(e) => setCapitalAnswer(e.target.value)}><option value="">Selecione...</option>{capitalOptions.map((o) => <option key={o}>{o}</option>)}</select></label>
        </> : <>
          <label>Estado: <input value={stateAnswer} onChange={(e) => setStateAnswer(e.target.value)} list={difficulty === 'medio' ? 'estados-list' : undefined} /></label>
          <label>Capital: <input value={capitalAnswer} onChange={(e) => setCapitalAnswer(e.target.value)} list={difficulty === 'medio' ? 'capitais-list' : undefined} /></label>
          <datalist id="estados-list">{stateSuggestions.map((s) => <option key={s.uf} value={s.estado} />)}</datalist>
          <datalist id="capitais-list">{capitalSuggestions.map((s) => <option key={s.capital} value={s.capital} />)}</datalist>
        </>}

        <button onClick={submitRound} disabled={!normalizeText(stateAnswer) || !normalizeText(capitalAnswer)}>Confirmar</button>
        <p className="feedback" aria-live="polite">{feedback}</p>
      </section>
      <button onClick={() => setMode('study')}>Ir para modo estudo</button>
    </main>
  )
}
