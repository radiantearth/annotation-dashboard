'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'
import { connect } from 'react-redux'

import { environment } from '../config'

import App from './app'
import Map from '../components/map'
import Panel from '../components/panel'
import Modal from '../components/modal'

import { fetchAnnotations, updateModal } from '../actions'

class Project extends React.Component {
  constructor () {
    super()

    this.setMap = this.setMap.bind(this)
    this.getMap = this.getMap.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }

  componentDidMount () {
    const { match } = this.props
    this.props.dispatch(fetchAnnotations(match.params.id))
  }

  render () {
    return (
      <App modal={this.props.modal ? <Modal onClick={this.closeModal}/> : false}>
        <div className='container column-stretch container-not-scrollable'>
          <Panel
            getMap={this.getMap}
            annotations={this.props.annotations}
          />
          <Map
            annotations={this.props.annotations}
            onDataReady={this.setMap}
          />
        </div>
      </App>
    )
  }

  setMap (map) {
    this.map = map
  }

  getMap () {
    return this.map
  }

  closeModal () {
    this.props.dispatch(updateModal(false))
  }
}

function mapStateToProps (state) {
  return {
    annotations: state.annotations || [],
    modal: state.modal
  }
}

if (environment !== 'production') {
  Project.propTypes = {
    match: T.object,
    dispatch: T.func,
    annotations: T.array,
    modal: T.bool
  }
}

module.exports = connect(mapStateToProps)(Project)
