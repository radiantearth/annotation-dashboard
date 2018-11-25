'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'

import bbox from '@turf/bbox'
import { featureCollection as fc } from '@turf/helpers'
import mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import isEqual from 'lodash.isequal'

import config from '../config'
import { cartoStyle } from '../utils/map'

class Map extends React.Component {
  constructor () {
    super()

    this.state = {
      mapLoaded: false
    }
    this.displayAnnotations = this.displayAnnotations.bind(this)
  }

  initMap (el) {
    if (!this.map) {
      mapboxgl.accessToken = config.mbToken
      const map = this.map = new mapboxgl.Map({
        center: [0, 0],
        container: el,
        style: cartoStyle,
        zoom: 5,
        pitchWithRotate: false,
        dragRotate: false
      })

      const Draw = this.draw = new MapboxDraw()
      map.addControl(Draw)

      window.map = map
      window.draw = Draw

      map.on('load', () => {
        this.setState({ mapLoaded: true })
        this.props.onDataReady(map)
        map.addSource('grid', {
          type: 'geojson',
          data: fc([])
        })
        map.addLayer({
          id: 'grid',
          type: 'line',
          source: 'grid',
          paint: {
            'line-opacity': 0.5,
            'line-dasharray': [4, 2]
          }
        })
        map.addLayer({
          id: 'grid-fill',
          type: 'fill',
          source: 'grid',
          paint: {
            'fill-color': 'black',
            'fill-opacity': ['case', ['==', ['feature-state', 'hover'], 1], 0.3, 0]
          }
        })
      })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if ((this.props.annotations.length !== prevProps.annotations.length && this.state.mapLoaded) ||
      (this.props.annotations.length && this.state.mapLoaded && !prevState.mapLoaded)) {
      this.displayAnnotations(this.props.annotations)
    }
    if (!isEqual(this.props.grid, prevProps.grid)) {
      this.map.getSource('grid').setData(this.props.grid)
    }
  }

  render () {
    return (
      <div className='main'>
        <div id='map' ref={this.initMap.bind(this)}></div>
      </div>
    )
  }

  displayAnnotations (annotations) {
    const bounds = bbox(fc(annotations))
    this.map.fitBounds(bounds, { padding: 50 })
    this.draw.add(fc(annotations))
  }
}

if (config.environment !== 'production') {
  Map.propTypes = {
    annotations: T.array,
    onDataReady: T.func,
    grid: T.object
  }
}

export default Map
