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
