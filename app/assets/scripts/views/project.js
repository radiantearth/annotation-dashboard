'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'
import { connect } from 'react-redux'

import { environment } from '../config'

import App from './app'
import Map from '../components/map'
import Panel from '../components/panel'
import Modal from '../components/modal'

import { fetchAnnotations, updateModal, setGrid, selectTask, fetchLabels } from '../actions'

class Project extends React.Component {
  constructor () {
    super()

    this.setMap = this.setMap.bind(this)
    this.getMap = this.getMap.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.setGrid = this.setGrid.bind(this)
    this.selectTask = this.selectTask.bind(this)
  }

  componentDidMount () {
    const { match } = this.props
    this.props.dispatch(fetchAnnotations(match.params.id))
    this.props.dispatch(fetchLabels(match.params.id))
  }

  render () {
    const modal = this.props.modal
      ? <Modal
        onClick={this.closeModal}
        annotations={this.props.annotations}
        setGrid={this.setGrid}
      />
      : false
    return (
      <App modal={modal}>
        <div className='container column-stretch container-not-scrollable'>
          <Panel
            getMap={this.getMap}
            annotations={this.props.annotations}
            grid={this.props.grid}
            selectTask={this.selectTask}
          />
          <Map
            annotations={this.props.annotations}
            onDataReady={this.setMap}
            grid={this.props.grid}
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

  setGrid (grid) {
    this.props.dispatch(setGrid(grid))
  }

  selectTask (task) {
    this.props.dispatch(selectTask(task))
  }
}

function mapStateToProps (state) {
  return {
    annotations: state.annotations || [],
    modal: state.modal,
    grid: state.grid
  }
}

if (environment !== 'production') {
  Project.propTypes = {
    match: T.object,
    dispatch: T.func,
    annotations: T.array,
    modal: T.bool,
    grid: T.object
  }
}

module.exports = connect(mapStateToProps)(Project)
