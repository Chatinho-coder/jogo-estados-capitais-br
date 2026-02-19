import { geoMercator, geoPath } from 'd3-geo'
import geojson from '../data/brazil-states.json'

const projection = geoMercator().fitSize([600, 620], geojson)
const pathGenerator = geoPath(projection)

export function BrazilMap({ highlightedState, onStateClick, focusable = false }) {
  return (
    <svg viewBox="0 0 600 620" className="mapa" role="img" aria-label="Mapa interativo do Brasil por estados">
      {geojson.features.map((feature) => {
        const name = feature.properties?.name
        const isHighlighted = name === highlightedState
        return (
          <path
            key={name}
            d={pathGenerator(feature)}
            className={`estado ${isHighlighted ? 'destacado' : ''}`}
            onClick={() => onStateClick?.(name)}
            tabIndex={focusable ? 0 : -1}
            onKeyDown={(e) => {
              if (focusable && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                onStateClick?.(name)
              }
            }}
            aria-label={name}
          />
        )
      })}
    </svg>
  )
}

export function MiniHighlightedState({ stateName }) {
  const feature = geojson.features.find((f) => f.properties?.name === stateName)
  if (!feature) return null

  const rawPath = pathGenerator(feature)
  const [[x0, y0], [x1, y1]] = pathGenerator.bounds(feature)
  const w = Math.max(1, x1 - x0)
  const h = Math.max(1, y1 - y0)
  const innerSize = 152
  const scale = Math.min(innerSize / w, innerSize / h)
  const tx = (200 - w * scale) / 2 - x0 * scale
  const ty = (200 - h * scale) / 2 - y0 * scale

  return (
    <svg viewBox="0 0 200 200" className="mini-state" role="img" aria-label="Silhueta do estado destacado">
      <path d={rawPath || ''} transform={`translate(${tx} ${ty}) scale(${scale})`} className="mini-state-shape" />
    </svg>
  )
}
