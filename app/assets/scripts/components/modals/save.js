'use strict'

import React, { Fragment } from 'react'
import { PropTypes as T } from 'prop-types'
import c from 'classnames'

import { environment } from '../../config'

class Modal extends React.Component {
  constructor () {
    super()
    this.state = {
      selectedExportId: null
    }
    this.selectExport = this.selectExport.bind(this)
  }

  selectExport (id) {
    this.setState({ selectedExportId: id })
  }

  render () {
    const { onClick, project, exports } = this.props
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
                  <h3>Save this project to the Radiant Earth Label Data catalog</h3>
                  <p>Now that you've validated these labels, we can save them with associated imagery to a <a href='https://github.com/radiantearth/stac-spec/tree/extension/training_data/extensions/training-data' target='_blank'>STAC compliant</a> label catalog.</p>
                  <p>Select a valid export to be included as the source imagery for these labels.</p>
                  <p>Don't see any exports? Create an S3 export on the <a href={`https://app.radiant.earth/projects/edit/${project.id}/exports`} target="_blank">Radiant Earth Platform</a></p>
                  <form>
                    {validExports.map(e => {
                      return <label className={c('checkbox radio', {active: e.id === this.state.selectedExportId})} key={e.id}>
                        <input onClick={() => this.selectExport(e.id)} type='radio' name='label' value={e.id}/>{e.exportOptions.source}/export.tif
                      </label>
                    })}
                  </form>
                  <div className='modal-submit'>
                    <button type='button' className={c('btn btn-primary', { disabled: !this.state.selectedExportId })} onClick={() => this.props.saveProject(exports.find(e => e.id === this.state.selectedExportId))}>Save Project</button>
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
    saveProject: T.func
  }
}

export default Modal
