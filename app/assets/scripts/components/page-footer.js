'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'

import { environment } from '../config'

export default class PageFooter extends React.PureComponent {
  render () {
    return (
      <footer className='page__footer'>
        <div className='inner'>
          <p className='page__credits'>2018 © NASA/MSFC Data Science and Informatics Group. <small>All rights reserved</small></p>
        </div>
      </footer>
    )
  }
}

if (environment !== 'production') {
  PageFooter.propTypes = {
    location: T.object
  }
}
