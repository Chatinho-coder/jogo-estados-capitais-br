import { geoBounds, geoMercator, geoPath } from 'd3-geo'
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

  const [[minLon, minLat], [maxLon, maxLat]] = geoBounds(feature)
  const lonPad = Math.max((maxLon - minLon) * 0.15, 0.2)
  const latPad = Math.max((maxLat - minLat) * 0.15, 0.2)

  const miniProjection = geoMercator().fitExtent(
    [[16, 16], [184, 184]],
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [minLon - lonPad, minLat - latPad],
          [maxLon + lonPad, minLat - latPad],
          [maxLon + lonPad, maxLat + latPad],
          [minLon - lonPad, maxLat + latPad],
          [minLon - lonPad, minLat - latPad],
        ]],
      },
    },
  )

  const miniPath = geoPath(miniProjection)

  return (
    <svg viewBox="0 0 200 200" className="mini-state" role="img" aria-label="Silhueta do estado destacado">
      <path d={miniPath(feature)} className="mini-state-shape" />
    </svg>
  )
}
