'use strict'

import React, { Fragment } from 'react'
import { PropTypes as T } from 'prop-types'
import c from 'classnames'
import mapboxgl from 'mapbox-gl'
import bbox from '@turf/bbox'
import bboxPolygon from '@turf/bbox-polygon'
import cover from '@mapbox/tile-cover'
import { tileToGeoJSON } from '@mapbox/tilebelt'
import intersect from '@turf/intersect'
import { featureCollection as fc, feature } from '@turf/helpers'

import { environment } from '../config'

class Modal extends React.Component {
  constructor () {
    super()

    this.state = {
      zoom: 13,
      grid: fc([]),
      intersections: [0],
      annotationsAdded: false,
      mapLoaded: false
    }

    this.onSliderChange = this.onSliderChange.bind(this)
    this.gridAndIntersect = this.gridAndIntersect.bind(this)
  }

  initMap () {
    if (!this.map) {
      const map = this.map = new mapboxgl.Map({
        center: [0, 0],
        container: 'modal-map',
        style: 'mapbox://styles/mapbox/light-v9',
        zoom: 2,
        pitchWithRotate: false,
        dragRotate: false,
        keyboard: false,
        minZoom: 1
      })

      map.on('load', () => {
        map.addSource('data', {
          type: 'geojson',
          data: fc([])
        })
        map.addLayer({
          id: 'data',
          type: 'line',
          source: 'data',
          paint: {
            'line-color': 'black',
            'line-width': 1,
            'line-opacity': 0.5,
            'line-dasharray': [4, 2]
          }
        })

        map.addSource('grid', {
          type: 'geojson',
          data: fc([])
        })
        map.addLayer({
          id: 'grid',
          type: 'fill',
          source: 'grid',
          paint: {
            'fill-color': '#0B5FBF',
            'fill-outline-color': 'black',
            'fill-opacity': 0.4
          }
        })
        this.setState({ mapLoaded: true })
      })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.annotations && !this.state.annotationsAdded && this.state.mapLoaded) {
      this.setState({ annotationsAdded: true })
      this.map.getSource('data').setData(fc(this.props.annotations))
      this.gridAndIntersect()
    }
    if (prevState.zoom !== this.state.zoom) {
      this.gridAndIntersect()
    }
  }

  render () {
    const { intersections, grid } = this.state
    return (
      <Fragment>
        <div className='modal fade in'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <button type='button' className={c('close', { disabled: !grid.features.length })} aria-label='Close' onClick={() => this.props.onClick(this.state.grid)}>
                  <span aria-hidden='true'>×</span>
                </button>
                <h4 className='modal-title'>Configure Project Validation</h4>
              </div>
              <div className='modal-body'>
                <div id='modal-map' ref={this.initMap.bind(this)}></div>
                <section className='modal-summary'>
                  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                  <p id='summary-text'>
                    This validation project contains <strong>{grid.features.length}</strong> grid cells with between <strong>{Math.min(...intersections)}-{Math.max(...intersections)}</strong> features per grid cell
                  </p>
                  <input type='range' min={10} max={16} defaultValue={13} onChange={this.onSliderChange}/>
                  <div className='modal-submit'>
                    <button type='button' className={c('btn btn-primary', { disabled: !grid.features.length })} onClick={() => this.props.onClick(this.state.grid)}>Set Grid</button>
                  </div>
                </section>
              </div>
              <div className='modal-footer'></div>
            </div>
          </div>
        </div>
        <div className='modal-backdrop in'></div>
      </Fragment>
    )
  }

  onSliderChange (e) {
    this.setState({ zoom: +e.target.value })
  }

  gridAndIntersect () {
    const data = fc(this.props.annotations)
    const bb = bbox(data)
    this.map.fitBounds(bb, { padding: 100 })
    const bbp = bboxPolygon(bb)
    const gridTiles = cover.tiles(bbp.geometry, {
      min_zoom: this.state.zoom,
      max_zoom: this.state.zoom
    })
    const grid = fc(gridTiles.map(tile => {
      const feat = feature(tileToGeoJSON(tile))
      feat.properties.tile = tile
      feat.id = +tile.join('')
      feat.properties.status = 'unvalidated'
      return feat
    }))
    const intersections = grid.features.map(f => {
      return data.features.reduce((a, b) => {
        return intersect(f, b)
          ? a + 1
          : a
      }, 0)
    })
    this.map.getSource('grid').setData(grid)
    this.setState({ grid, intersections })
  }
}

if (environment !== 'production') {
  Modal.propTypes = {
    onClick: T.func,
    annotations: T.array
  }
}

export default Modal
