'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'
import { connect } from 'react-redux'

import { environment } from '../config'

import App from './app'
import Map from '../components/map'
import Control from '../components/control'

import { fetchAnnotations } from '../actions'

class Project extends React.Component {
  constructor () {
    super()

    this.storeMapData = this.storeMapData.bind(this)
    this.getMapData = this.getMapData.bind(this)
  }

  componentDidMount () {
    const { match } = this.props
    this.props.dispatch(fetchAnnotations(match.params.id))
  }

  render () {
    return (
      <App>
        <Map
          annotations={this.props.annotations}
          onDataReady={this.storeMapData}
        />
        <Control
          getMapData={this.getMapData}
        />
      </App>
    )
  }

  storeMapData (data) {
    this.mapData = data
  }

  getMapData () {
    return this.mapData
  }
}

function mapStateToProps (state) {
  return {
    annotations: state.annotations || []
  }
}

if (environment !== 'production') {
  Project.propTypes = {
    match: T.object,
    dispatch: T.func,
    annotations: T.array
  }
}

module.exports = connect(mapStateToProps)(Project)
