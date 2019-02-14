'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'

import { environment } from '../config'
import * as AuthService from '../utils/auth'

export default class Login extends React.Component {
  componentWillMount () {
    AuthService.lock.on('authenticated', authResult => {
      AuthService.lock.getUserInfo(authResult.accessToken, (error, profile) => {
        if (error) {
          console.log(error)
          return
        }
        AuthService.setToken(authResult.idToken) // static method
        AuthService.setProfile(profile) // static method
        AuthService.lock.hide()
        this.props.history.push(window.location.pathname)
      })
    })
    // Add callback for lock's `authorization_error` event
    AuthService.lock.on('authorization_error', error => {
      console.log(error)
      history.push({ pathname: '/' })
    })

    if (!AuthService.isAuthenticated()) {
      AuthService.login()
    }
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
