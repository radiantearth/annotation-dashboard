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

import { environment } from '../../config'
import { validationDescription } from '../../utils/copy'

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
      if (this.props.annotations.length > 0) {
        this.map.getSource('data').setData(fc(this.props.annotations))
        this.gridAndIntersect()
      }
    }
    if (prevState.zoom !== this.state.zoom) {
      this.gridAndIntersect()
    }
  }

  render () {
    const { intersections, grid } = this.state
    // description is empty while loading, use default if not present on project
    const description = this.props.project.hasOwnProperty('extras')
      ? (this.props.project.extras && this.props.project.extras.validationDescription) || validationDescription
      : ''

    if (this.props.annotations.length === 0) {
      return <Fragment>
        <div className='modal fade in'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <button type='button' className={c('close')} aria-label='Close' onClick={() => this.props.onClick(null)}>
                  <span aria-hidden='true'>×</span>
                </button>
                <h4 className='modal-title'>Configure Project</h4>
              </div>
              <div className='modal-body'>
                <p>This project doesn't have any annotations yet. Add some on the <a href={`https://app.radiant.earth/projects/edit/${this.props.project.id}/annotate`} target='_blank'>Radiant Earth Platform</a></p>
              </div>
              <div className='modal-footer'></div>
            </div>
          </div>
        </div>
        <div className='modal-backdrop in'></div>
      </Fragment>
    }

    return (
      <Fragment>
        <div className='modal fade in'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <button type='button' className={c('close', { disabled: !grid.features.length })} aria-label='Close' onClick={() => this.props.onClick(this.state.grid)}>
                  <span aria-hidden='true'>×</span>
                </button>
                <h4 className='modal-title'>Configure Project</h4>
              </div>
              <div className='modal-body'>
                <div id='modal-map' ref={this.initMap.bind(this)}></div>
                <section className='modal-summary'>
                  <p><strong>Description:</strong> {description}</p>
                  <hr />
                  <p>
                    Before correcting any labels, it helps to divide the project
                    up into partial tasks. Use the slider below to change the size
                    of the tasks.
                    <span id='summary-text'>
                      This project contains <strong>{grid.features.length}</strong> tasks with between <strong>{Math.min(...intersections)}-{Math.max(...intersections)}</strong> features per task.
                    </span>
                  </p>

                  <input type='range' min={10} max={15} defaultValue={13} onChange={this.onSliderChange}/>
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
    annotations: T.array,
    project: T.object
  }
}

export default Modal
