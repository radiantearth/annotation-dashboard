'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'

import bbox from '@turf/bbox'
import { featureCollection as fc } from '@turf/helpers'
import mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import isEqual from 'lodash.isequal'
import flatten from 'lodash.flatten'

import config from '../config'
import { cartoStyle } from '../utils/map'
import { drawStyles, LABEL_COLORS } from '../utils/draw-style'
import ValidatorControl from './validator'
import LabelLegendControl from './label-legend'

class Map extends React.Component {
  constructor () {
    super()

    this.state = {
      mapLoaded: false
    }
    this.displayAnnotations = this.displayAnnotations.bind(this)
    this.verifyAnnotation = this.verifyAnnotation.bind(this)
    this.updateAnnotation = this.updateAnnotation.bind(this)
    this.rewriteDrawStyles = this.rewriteDrawStyles.bind(this)
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

      const Draw = this.draw = new MapboxDraw({
        userProperties: true,
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        }
      })
      map.addControl(Draw)

      this._validator = new ValidatorControl({ task: null })
      map.addControl(this._validator, 'top-left')

      this._labelLegend = new LabelLegendControl({ labels: [] })
      map.addControl(this._labelLegend, 'bottom-left')

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
        map.addSource('imagery', {
          type: 'raster',
          tiles: [
            `https://tiles.rasterfoundry.com/${this.props.projectId}/{z}/{x}/{y}?token=${config.sessionToken}`
          ]
        })
        map.addLayer({
          id: 'imagery',
          type: 'raster',
          source: 'imagery'
        }, 'gl-draw-polygon-fill-inactive.cold')
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
        updateAnnotation: this.updateAnnotation,
        labels: this.props.labels,
        validateGridAndAdvance: this.props.validateGridAndAdvance,
        map: this.map,
        drawLabel: this.props.drawLabel,
        setDrawLabel: this.props.setDrawLabel
      })
    }
    if ((!isEqual(this.props.labels, prevProps.labels) && this.state.mapLoaded) ||
      (this.props.labels.length && this.state.mapLoaded && !prevState.mapLoaded)) {
      this.rewriteDrawStyles(this.props.labels)
      this._labelLegend._render({ labels: this.props.labels })
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
    this.map.fitBounds(bounds, { padding: 100 })
    this.draw.changeMode('direct_select', { featureId: id })
  }

  updateAnnotation (feature) {
    this.draw.setFeatureProperty(feature.id, 'label', feature.properties.label)
    this.props.updateAnnotation(feature)
  }

  rewriteDrawStyles (labels) {
    const exp = [
      'match',
      ['string', ['get', 'user_label']]
    ].concat(flatten(labels.map((label, i) => [label, LABEL_COLORS[i]])))
      .concat(['#3bb2d0'])
    drawStyles.forEach(style => {
      for (const property in style.paint) {
        if (style.paint[property] === '#3bb2d0') {
          this.map.setPaintProperty(`${style.id}.hot`, property, exp)
          this.map.setPaintProperty(`${style.id}.cold`, property, exp)
        }
      }
    })
  }
}

if (config.environment !== 'production') {
  Map.propTypes = {
    annotations: T.array,
    onDataReady: T.func,
    grid: T.object,
    selectedTask: T.object,
    updateAnnotation: T.func,
    labels: T.array,
    validateGridAndAdvance: T.func,
    projectId: T.string,
    drawLabel: T.string,
    setDrawLabel: T.func
  }
}

export default Map
