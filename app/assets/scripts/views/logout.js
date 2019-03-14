'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'

import { environment } from '../config'
import * as AuthService from '../utils/auth'

export default class Login extends React.Component {
  componentWillMount () {
    AuthService.logout()
    this.props.history.push({ pathname: '/' })
  }

  render () {
    return ''
  }
}

if (environment !== 'production') {
  Login.propTypes = {
    history: T.object
  }
}
