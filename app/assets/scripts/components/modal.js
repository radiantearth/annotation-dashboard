'use strict'

import React, { Fragment } from 'react'
import { PropTypes as T } from 'prop-types'
// import c from 'classnames'
import bbox from '@turf/bbox'

import { environment } from '../config'

class Modal extends React.Component {
  render () {
    return (
      <Fragment>
        <div className='modal fade in'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <button type='button' className='close' aria-label='Close' onClick={this.props.onClick}>
                  <span aria-hidden='true'>×</span>
                </button>
                <h4 className='modal-title'>Configure Project Validation</h4>
              </div>
              <div className='modal-body'></div>
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
    onClick: T.func
  }
}

export default Modal
