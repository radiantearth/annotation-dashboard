'use strict'
import React from 'react'
import { connect } from 'react-redux'

import Map from '../components/map'
import Control from '../components/control'

class App extends React.Component {
  constructor () {
    super()

    this.storeMapData = this.storeMapData.bind(this)
    this.getMapData = this.getMapData.bind(this)
  }

  render () {
    const { dispatch, classes, sliderValue, labels } = this.props
    return (
      <div>
        <Map
          sliderValue={sliderValue}
          classes={classes}
          labels={labels}
          onDataReady={this.storeMapData}
          />
        <Control
          dispatch={dispatch}
          classes={classes}
          labels={labels}
          getMapData={this.getMapData}
          />
      </div>
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
  return state
}

module.exports = connect(mapStateToProps)(App)
