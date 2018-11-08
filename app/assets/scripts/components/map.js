/* global mapboxgl */
'use strict'
import React from 'react'
import flatten from 'lodash.flatten'
import bbox from '@turf/bbox'

import config from '../config'
import { colors } from '../utils/colors'

class Map extends React.Component {
  constructor () {
    super()

    this.updateOpacity = this.updateOpacity.bind(this)
    this.onLabelClick = this.onLabelClick.bind(this)
    this.initLabels = this.initLabels.bind(this)
  }

  initMap (el) {
    if (!this.map) {
      mapboxgl.accessToken = config.mbToken
      const map = this.map = new mapboxgl.Map({
        center: [0, 0],
        container: el,
        style: 'mapbox://styles/mapbox/satellite-streets-v9',
        zoom: 5,
        pitchWithRotate: false,
        dragRotate: false
      })
      map.on('load', () => {
        map.on('click', 'labels', this.onLabelClick)
      })
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!this.mapData && nextProps.labels) {
      this.initLabels(nextProps.labels, nextProps.classes)
    }
    if (nextProps.sliderValue !== this.props.sliderValue) {
      this.updateOpacity(nextProps.sliderValue)
    }
  }

  render () {
    return (
      <div id='map' ref={this.initMap.bind(this)}></div>
    )
  }

  initLabels (labels, classes) {
    this.mapData = labels
    this.props.onDataReady(this.mapData)
    // define the colors
    const filters = flatten(classes.map((cl, i) => {
      return [
        ['==', ['number', ['at', i, ['array', ['get', 'label']]]], 1],
        colors[i % 10]
      ]
    }))
    const fillColors = ['case'].concat(filters).concat(['black'])

    // load the data
    this.map.addSource('labels', {
      type: 'geojson',
      data: labels
    })
    // show the data
    this.map.addLayer({
      'id': 'labels',
      'source': 'labels',
      'type': 'fill',
      'paint': {
        'fill-color': fillColors,
        'fill-outline-color': 'white',
        'fill-opacity': 0.5
      }
    })

    const box = bbox(labels)
    // zoom to the data
    this.map.fitBounds([[box[0], box[1]], [box[2], box[3]]])
  }

  updateOpacity (value) {
    this.map.setPaintProperty('labels', 'fill-opacity', value)
  }

  // on click, update the data for that tile and re-render
  onLabelClick (e) {
    // shift the label by one
    const feature = e.features[0]
    const label = JSON.parse(feature.properties.label)
    const newLabel = [label.pop()].concat(label)

    // assign to the same tile
    const tile = this.mapData.features.find(f => f.properties.tile === feature.properties.tile)
    tile.properties.label = newLabel
    this.map.getSource('labels').setData(this.mapData)
  }
}

export default Map
