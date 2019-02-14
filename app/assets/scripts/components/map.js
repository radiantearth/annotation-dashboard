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
import * as AuthService from '../utils/auth'
import { cartoStyle } from '../utils/map'
import { drawStyles, LABEL_COLORS } from '../utils/draw-style'
import ValidatorControl from './validator'
import LabelLegendControl from './label-legend'

// TODO: remove global variable
let hoveredStateId = null

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
        styles: drawStyles,
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
            `https://tiles.rasterfoundry.com/${this.props.projectId}/{z}/{x}/{y}?token=${AuthService.getToken()}`
          ]
        })
        map.addLayer({
          id: 'imagery',
          type: 'raster',
          source: 'imagery'
        }, 'gl-draw-polygon-fill-inactive.cold')

        map.on('mousemove', 'grid-fill', e => {
          if (!this.props.selectedTask) {
            if (e.features.length > 0) {
              if (hoveredStateId) {
                map.setFeatureState({source: 'grid', id: hoveredStateId}, {hover: 0})
              }
              hoveredStateId = e.features[0].id
              map.setFeatureState({source: 'grid', id: hoveredStateId}, {hover: 1})
            }
          }
        })

        map.on('mouseleave', 'grid-fill', e => {
          if (hoveredStateId) {
            map.setFeatureState({source: 'grid', id: hoveredStateId}, {hover: 0})
          }
          hoveredStateId = null
        })

        // only select when no task is selected, otherwise this messes with map interactions
        map.on('click', 'grid-fill', e => {
          if (e.features.length > 0 && !this.props.selectedTask) {
            const task = e.features[0]
            this.props.selectTask(task)
          }
        })

        map.on('draw.create', e => {
          e.features.forEach(f => {
            // update on the map
            this.draw.setFeatureProperty(f.id, 'label', this.props.drawLabel)
            // also in our store
            f.properties = {
              label: this.props.drawLabel,
              tile: this.props.selectedTask.id,
              validated: true
            }
            setTimeout(() => this.props.appendAnnotation(f), 10)
          })
        })

        map.on('draw.selectionchange', e => {
          if (!e.features.length) return
          // fires when something already in our store is selected
          if (this.props.annotations.map(a => a.id).includes(e.features[0].id)) {
            e.features[0].properties.validated = false
            // TODO: are there cases where the thing we are editing isn't in the selected task
            e.features[0].properties.tile = this.props.selectedTask.id
            setTimeout(() => this.props.updateAnnotation(e.features[0]), 0)
          }
        })
      })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const mapLoad = this.state.mapLoaded && !prevState.mapLoaded
    if ((this.props.annotations.length !== prevProps.annotations.length && this.state.mapLoaded) ||
      (this.props.annotations.length && mapLoad)) {
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
    const labelChange = this.props.drawLabel !== prevProps.drawLabel
    const labelReady = this.props.labels.length && this.props.drawLabel
    if ((labelChange && labelReady && this.state.mapLoaded) ||
      (labelReady && mapLoad)) {
      const color = LABEL_COLORS[this.props.labels.findIndex(l => l === this.props.drawLabel)]
      drawStyles.forEach(style => {
        for (const property in style.paint) {
          if (style.paint[property] === 'black') {
            this.map.setPaintProperty(`${style.id}.hot`, property, color)
            this.map.setPaintProperty(`${style.id}.cold`, property, color)
          }
        }
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
      ['to-string', ['get', 'user_label']]
    ].concat(flatten(labels.map((label, i) => [label, LABEL_COLORS[i]])))
      .concat(['pink'])
    drawStyles.forEach(style => {
      for (const property in style.paint) {
        if (style.paint[property] === '#3bb2d0' || style.paint[property] === '#fbb03b') {
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
    selectTask: T.func,
    selectedTask: T.object,
    updateAnnotation: T.func,
    labels: T.array,
    validateGridAndAdvance: T.func,
    projectId: T.string,
    drawLabel: T.string,
    setDrawLabel: T.func,
    appendAnnotation: T.func
  }
}

export default Map
