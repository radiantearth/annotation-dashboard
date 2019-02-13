'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'
import { render, unmountComponentAtNode } from 'react-dom'

import { LABEL_COLORS } from '../utils/draw-style'

// Mapbox Control class.
export default class LabelLegendControl {
  constructor ({ labels }) {
    this.labels = labels
  }

  onAdd (map) {
    this.theMap = map
    this._container = document.createElement('div')
    this._container.className = 'mapboxgl-ctrl'

    // Since the LabelLegend is a react component disconnencted from
    // the global application state, it's not possible to pass props the normal
    // way. To solve this we store a _render function associated with the
    // label legend and call it when the component needs to be rendered
    // with different props.
    // We're also caching the props to avoid having to pass them all every time
    // we call the render function
    let cacheProps = {}
    this._render = (props) => {
      cacheProps = { ...cacheProps, ...props }
      render(<LabelLegend {...cacheProps} />, this._container)
    }

    this._render({
      labels: this.labels
    })

    return this._container
  }

  onRemove () {
    unmountComponentAtNode(this._container)
    this._container.parentNode.removeChild(this._container)
    this.theMap = undefined
  }
}

// React component for the label legend.
// It is disconnected from the global state because it needs to be included
// via the mapbox code.
class LabelLegend extends React.Component {
  render () {
    const { labels } = this.props
    if (!labels.length) return ''
    return <div className='label-legend map-item'>
      <header>
        <h1>Labels</h1>
      </header>
      <div className='label-legend-body'>
        <ul>
          {labels.map((label, i) => {
            return <li key={label}><span style={{backgroundColor: LABEL_COLORS[i]}}></span>{label}</li>
          })}
        </ul>
      </div>
    </div>
  }
}

LabelLegend.propTypes = {
  labels: T.array
}
