'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'
import { connect } from 'react-redux'
import bbox from '@turf/bbox'

import { environment } from '../config'

import App from './app'
import Map from '../components/map'
import Panel from '../components/panel'
import Modal from '../components/modal'

import { fetchAnnotations, updateModal, setGrid, selectTask, fetchLabels,
  validateAnnotation, validateGrid } from '../actions'

class Project extends React.Component {
  constructor () {
    super()

    this.setMap = this.setMap.bind(this)
    this.getMap = this.getMap.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.setGrid = this.setGrid.bind(this)
    this.selectTask = this.selectTask.bind(this)
    this.validateAnnotation = this.validateAnnotation.bind(this)
    this.validateGridAndAdvance = this.validateGridAndAdvance.bind(this)
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
            selectedTask={this.props.selectedTask}
            validateAnnotation={this.validateAnnotation}
            labels={this.props.labels}
            validateGridAndAdvance={this.validateGridAndAdvance}
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

  closeModal (grid) {
    this.props.dispatch(updateModal(false))
    this.props.dispatch(setGrid(grid))
  }

  setGrid (grid) {
    this.props.dispatch(setGrid(grid))
  }

  selectTask (task) {
    this.getMap().fitBounds(bbox(task.geometry), { padding: 50 })
    this.props.dispatch(selectTask(task.id))
  }

  validateAnnotation (id) {
    this.props.dispatch(validateAnnotation(id))
  }

  validateGridAndAdvance (task) {
    this.props.dispatch(validateGrid(task.id))
    const features = this.props.grid.features
    const current = features.findIndex(f => f.id === task.id)
    const next = features[(current + 1) % features.length]
    this.selectTask(next)
  }
}

function mapStateToProps (state) {
  return {
    annotations: state.annotations || [],
    modal: state.modal,
    grid: state.grid,
    selectedTask: state.grid && state.selectedTaskId ? state.grid.features.find(f => f.id === state.selectedTaskId) : null,
    labels: state.labels
  }
}

if (environment !== 'production') {
  Project.propTypes = {
    match: T.object,
    dispatch: T.func,
    annotations: T.array,
    modal: T.bool,
    grid: T.object,
    selectedTask: T.object,
    labels: T.array
  }
}

module.exports = connect(mapStateToProps)(Project)
