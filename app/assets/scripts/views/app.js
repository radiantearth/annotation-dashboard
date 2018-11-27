'use strict'
import React, { Fragment } from 'react'
import { PropTypes as T } from 'prop-types'
import c from 'classnames'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import { environment, appName, appDescription } from '../config'
import * as AuthService from '../utils/auth'

import PageHeader from '../components/page-header'
import MetaTags from '../components/meta-tags'

class App extends React.Component {
  componentWillMount () {
    // const { history, loginError, loginSuccess } = this.props
    // Add callback for lock's `authenticated` event
    AuthService.lock.on('authenticated', authResult => {
      AuthService.lock.getUserInfo(authResult.accessToken, (error, profile) => {
        if (error) {
          console.log(error)
          return
          // return loginError(error)
        }
        AuthService.setToken(authResult.idToken) // static method
        AuthService.setProfile(profile) // static method
        // loginSuccess(profile);
        this.props.history.push({ pathname: '/' })
        AuthService.lock.hide()
      })
    })
    // Add callback for lock's `authorization_error` event
    AuthService.lock.on('authorization_error', error => {
      // loginError(error);
      console.log(error);
      this.props.history.push({ pathname: '/' });
    })
  }

  render () {
    return (
      <Fragment>
        <div className={c('app-wrapper', this.props.className)}>
          <MetaTags
            title={appName}
            description={appDescription} >

            {/* Twitter */}
            <meta name='twitter:card' content='summary' />
            <meta name='twitter:site' content='@twitter-handle' />
            <meta name='twitter:image:src' content='/assets/graphics/meta/default-meta-image.png' />

            {/* OG */}
            <meta property='og:site_name' content={appName} />
            <meta property='og:url' content='www.domain.org' />
            <meta property='og:type' content='website' />
            <meta property='og:image' content='/assets/graphics/meta/default-meta-image.png' />
          </MetaTags>

          <PageHeader location={this.props.location} />
          <main className='app-content' role='main'>
            {this.props.children}
          </main>
        </div>
        {this.props.modal || ''}
      </Fragment>
    )
  }
}

if (environment !== 'production') {
  App.propTypes = {
    className: T.string,
    location: T.object,
    children: T.node,
    modal: T.node,
    history: T.object
  }
}

export default connect()(withRouter(App))
