'use strict'

import React, { Fragment } from 'react'
import { PropTypes as T } from 'prop-types'
import c from 'classnames'

import { environment } from '../../config'

class Modal extends React.Component {
  constructor () {
    super()
    this.state = {
      selectedExportIds: []
    }
    this.exportToggle = this.exportToggle.bind(this)
    this.refreshExports = this.refreshExports.bind(this)
  }

  exportToggle (id) {
    const ids = this.state.selectedExportIds
    const newIds = ids.includes(id)
      ? ids.filter(a => a !== id)
      : ids.concat([id])
    this.setState({ selectedExportIds: newIds })
  }

  refreshExports (e) {
    e.preventDefault()
    this.props.refreshExports()
  }

  render () {
    const { onClick, project, exports, saveProject } = this.props
    const validExports = exports.filter(e => e.exportStatus === 'EXPORTED' && e.exportType === 'S3')
    return (
      <Fragment>
        <div className='modal fade in'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <button type='button' className='close' aria-label='Close' onClick={onClick}>
                  <span aria-hidden='true'>×</span>
                </button>
                <h4 className='modal-title'>Save Project</h4>
              </div>
              <div className='modal-body'>
                <section className='save-summary'>
                  <h4>Publish to the Radiant Earth Label Data catalog</h4>
                  <p>Now that you've validated these labels, we can publish them with associated imagery to a <a href='https://github.com/radiantearth/stac-spec/tree/extension/training_data/extensions/training-data' target='_blank'>STAC compliant</a> label catalog.</p>
                  <p>Select valid exports to be included as the source imagery for these labels.</p>
                  <form>
                    {validExports.map(e => {
                      return <label className={c('checkbox', {active: this.state.selectedExportIds.includes(e.id)})} key={e.id}>
                        <input onClick={() => this.exportToggle(e.id)} type='checkbox' name='label' value={e.id}/>{e.exportOptions.source}/export.tif
                      </label>
                    })}
                  </form>
                  <p>Don't see any exports? Create an S3 export on the <a href={`https://app.radiant.earth/projects/edit/${project.id}/exports`} target="_blank">Radiant Earth Platform</a> then <a href="" onClick={this.refreshExports}>reload the exports</a>.</p>
                  <div className='modal-submit'>
                    <button type='button' className={c('btn btn-primary', { disabled: !this.state.selectedExportIds.length })} onClick={() => saveProject(exports.filter(e => this.state.selectedExportIds.includes(e.id)))}>Publish Labels</button>
                  </div>
                </section>
                <section className='save-partial'>
                  <h4>Save labels to the Radiant Earth API</h4>
                  <p>Need to save your labels and come back later? You can save to the Radiant Earth API without publishing.</p>
                  <div className='modal-submit'>
                    <button type='button' className='btn btn-primary' onClick={this.props.saveAnnotations}>Save Labels</button>
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
}

if (environment !== 'production') {
  Modal.propTypes = {
    onClick: T.func,
    project: T.object,
    exports: T.array,
    saveProject: T.func,
    saveAnnotations: T.func,
    refreshExports: T.func
  }
}

export default Modal
