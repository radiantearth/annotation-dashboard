/* global mapboxgl */
'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'

import bbox from '@turf/bbox'
import { featureCollection as fc } from '@turf/helpers'

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
      window.map = map
      map.on('load', () => {
        this.map.addSource('annotations', {
          type: 'geojson',
          data: fc([])
        })
        this.map.addLayer({
          id: 'annotations',
          name: 'annotations',
          source: 'annotations',
          type: 'fill'
        })
        this.setState({ mapLoaded: true })
      })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if ((this.props.annotations.length !== prevProps.annotations.length && this.state.mapLoaded) ||
      (this.props.annotations.length && this.state.mapLoaded && !prevState.mapLoaded)) {
      this.displayAnnotations(this.props.annotations)
    }
  }

  render () {
    return (
      <div id='map' ref={this.initMap.bind(this)}></div>
    )
  }

  displayAnnotations (annotations) {
    const bounds = bbox(fc(annotations))
    this.map.fitBounds(bounds, { padding: 50 })
    this.map.getSource('annotations').setData(fc(annotations))
  }
}

if (config.environment !== 'production') {
  Map.propTypes = {
    annotations: T.array
  }
}

export default Map
