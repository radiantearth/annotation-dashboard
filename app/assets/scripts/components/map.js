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
import ValidatorControl from './validator'

class Map extends React.Component {
  constructor () {
    super()

    this.state = {
      mapLoaded: false
    }
    this.displayAnnotations = this.displayAnnotations.bind(this)
    this.verifyAnnotation = this.verifyAnnotation.bind(this)
    this.validateAnnotation = this.validateAnnotation.bind(this)
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

      this._validator = new ValidatorControl({ task: null })
      map.addControl(this._validator, 'top-left')

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
    if (this.props.selectedTask) {
      this._validator._render({
        task: this.props.selectedTask,
        annotations: this.props.annotations,
        verifyAnnotation: this.verifyAnnotation,
        validateAnnotation: this.validateAnnotation,
        labels: this.props.labels,
        validateGridAndAdvance: this.props.validateGridAndAdvance
      })
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

  verifyAnnotation (id) {
    const annotation = this.draw.get(id)
    const bounds = bbox(annotation)
    this.map.fitBounds(bounds, { padding: 50 })
    this.draw.changeMode('direct_select', { featureId: id })
  }

  validateAnnotation (id) {
    this.props.validateAnnotation(id)
  }
}

if (config.environment !== 'production') {
  Map.propTypes = {
    annotations: T.array,
    onDataReady: T.func,
    grid: T.object,
    selectedTask: T.object,
    validateAnnotation: T.func,
    labels: T.array,
    validateGridAndAdvance: T.func
  }
}

export default Map
