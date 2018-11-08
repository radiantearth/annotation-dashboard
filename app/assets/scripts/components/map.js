/* global mapboxgl */
'use strict'
import React from 'react'

import config from '../config'

class Map extends React.Component {
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

  }

  render () {
    return (
      <div id='map' ref={this.initMap.bind(this)}></div>
    )
  }

  initLabels (labels, classes) {
    this.mapData = labels
    this.props.onDataReady(this.mapData)
  }
}

export default Map
