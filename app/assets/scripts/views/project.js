'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'
import { connect } from 'react-redux'
import bbox from '@turf/bbox'

import { environment } from '../config'
import { propsToProject } from '../utils/utils'
import { SAVE_MODAL, SETUP_MODAL } from '../utils/constants'

import App from './app'
import Map from '../components/map'
import Panel from '../components/panel'
import SetupModal from '../components/modals/setup'
import SaveModal from '../components/modals/save'

import { fetchAnnotations, updateModal, setGrid, selectTask, fetchLabels,
  updateAnnotation, validateGrid, setDrawLabel, appendAnnotation,
  saveProject, fetchProject, fetchExports, invalidateProject,
  updateRemoteAnnotations } from '../actions'

class Project extends React.Component {
  constructor () {
    super()

    this.setMap = this.setMap.bind(this)
    this.getMap = this.getMap.bind(this)
    this.closeSaveModal = this.closeSaveModal.bind(this)
    this.closeSetupModal = this.closeSetupModal.bind(this)
    this.selectTask = this.selectTask.bind(this)
    this.updateAnnotation = this.updateAnnotation.bind(this)
    this.validateGridAndAdvance = this.validateGridAndAdvance.bind(this)
    this.setDrawLabel = this.setDrawLabel.bind(this)
    this.appendAnnotation = this.appendAnnotation.bind(this)
    this.saveProject = this.saveProject.bind(this)
    this.openSaveModal = this.openSaveModal.bind(this)
    this.saveAnnotations = this.saveAnnotations.bind(this)
    this.refreshExports = this.refreshExports.bind(this)
  }

  componentDidMount () {
    const { match } = this.props
    this.props.dispatch(fetchAnnotations(match.params.id))
    this.props.dispatch(fetchLabels(match.params.id))
    this.props.dispatch(fetchProject(match.params.id))
    this.props.dispatch(fetchExports(match.params.id))
  }

  componentWillUnmount () {
    this.props.dispatch(invalidateProject())
  }

  render () {
    const projectId = this.props.match.params.id
    let modal = false
    switch (this.props.modal) {
      case SETUP_MODAL:
        modal = <SetupModal
          onClick={this.closeSetupModal}
          annotations={this.props.annotations}
          project={this.props.project} />
        break
      case SAVE_MODAL:
        modal = <SaveModal
          onClick={this.closeSaveModal}
          project={this.props.project}
          exports={this.props.exports}
          saveProject={this.saveProject}
          saveAnnotations={this.saveAnnotations}
          refreshExports={this.refreshExports}
        />
    }
    return (
      <App modal={modal}>
        <div className='container column-stretch container-not-scrollable'>
          <Panel
            getMap={this.getMap}
            annotations={this.props.annotations}
            grid={this.props.grid}
            selectTask={this.selectTask}
            selectedTask={this.props.selectedTask}
            updateAnnotation={this.updateAnnotation}
            openSaveModal={this.openSaveModal}
          />
          <Map
            annotations={this.props.annotations}
            onDataReady={this.setMap}
            grid={this.props.grid}
            selectTask={this.selectTask}
            selectedTask={this.props.selectedTask}
            updateAnnotation={this.updateAnnotation}
            labels={this.props.labels}
            validateGridAndAdvance={this.validateGridAndAdvance}
            projectId={projectId}
            drawLabel={this.props.drawLabel}
            setDrawLabel={this.setDrawLabel}
            appendAnnotation={this.appendAnnotation}
          />
        </div>
      </App>
    )
  }

  openSaveModal () {
    this.props.dispatch(updateModal(SAVE_MODAL))
  }

  setMap (map) {
    this.map = map
  }

  getMap () {
    return this.map
  }

  closeSetupModal (grid) {
    this.props.dispatch(updateModal(false))
    if (grid) this.props.dispatch(setGrid(grid))
  }

  closeSaveModal () {
    this.props.dispatch(updateModal(false))
  }

  selectTask (task) {
    this.getMap().fitBounds(bbox(task.geometry), { padding: 50 })
    this.getMap().setFeatureState({source: 'grid', id: task.id}, {hover: 0})
    this.props.dispatch(selectTask(task.id))
  }

  updateAnnotation (feature) {
    this.props.dispatch(updateAnnotation(feature))
  }

  validateGridAndAdvance (task) {
    this.props.dispatch(validateGrid(task.id))
    const features = this.props.grid.features
    const current = features.findIndex(f => f.id === task.id)
    const next = features[(current + 1) % features.length]
    if (next.properties.status !== 'validated') {
      this.selectTask(next)
    } else {
      this.props.dispatch(selectTask(null))
    }
  }

  setDrawLabel (label) {
    this.props.dispatch(setDrawLabel(label))
  }

  appendAnnotation (feature) {
    this.props.dispatch(appendAnnotation(feature))
  }

  async saveProject (exports, description) {
    const project = await propsToProject(this.props, exports, description)
    updateRemoteAnnotations(this.props.project.id, this.props.annotations)
    this.props.dispatch(saveProject(project))
    this.props.dispatch(updateModal(false))
  }

  saveAnnotations () {
    updateRemoteAnnotations(this.props.project.id, this.props.annotations)
  }

  refreshExports () {
    this.props.dispatch(fetchExports(this.props.match.params.id))
  }
}

function mapStateToProps (state) {
  return {
    annotations: state.annotations || [],
    modal: state.modal,
    grid: state.grid,
    selectedTask: state.grid && state.selectedTaskId ? state.grid.features.find(f => f.id === state.selectedTaskId) : null,
    labels: state.labels,
    drawLabel: state.drawLabel,
    project: state.project,
    exports: state.exports
  }
}

if (environment !== 'production') {
  Project.propTypes = {
    match: T.object,
    dispatch: T.func,
    annotations: T.array,
    modal: T.oneOfType([T.string, T.bool]),
    grid: T.object,
    selectedTask: T.object,
    labels: T.array,
    drawLabel: T.string,
    project: T.object,
    exports: T.array
  }
}

module.exports = connect(mapStateToProps)(Project)
