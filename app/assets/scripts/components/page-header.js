'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'
import { Link, NavLink } from 'react-router-dom'
import c from 'classnames'

import { environment } from '../config'
import * as AuthService from '../utils/auth'

export default class PageHeader extends React.Component {
  constructor () {
    super()
    this.state = {
      drop: false
    }
    this.toggleDrop = this.toggleDrop.bind(this)
  }

  toggleDrop () {
    this.setState({ drop: !this.state.drop })
  }

  render () {
    const profile = AuthService.getProfile()
    const ProfilePicture = profile.picture
      ? <img className='avatar tiny' src={profile.picture} />
      : <div className='avatar image-placeholder'></div>

    return (
      <header className='navbar'>
        <div className='navbar-section primary'>
          <a ui-sref='home' className='brand'>
            <img src='/assets/graphics/layout/logo.svg' style={{maxWidth: '50px'}} />
          </a>
          <span className='navbar-vertical-divider'></span>
          <nav>
            <NavLink to='/'>
              <i className='icon-home'></i>Home</NavLink>
            <span ui-view='navmenu'></span>
          </nav>
        </div>
        <div className='navbar-section secondary'>
          <nav>
            <div className={c('dropdown-my-account dropdown', { open: this.state.drop })}>
              <a onClick={this.toggleDrop}>
                {ProfilePicture}
                <span className='username'>{profile.nickname}</span>
                <i className='icon-caret-down'></i>
              </a>
              <ul className='dropdown-menu dropdown-menu-right'>
                <li role='separator' className='divider'></li>
                <li><Link to='/logout'>
                  Sign out
                </Link></li>
              </ul>
            </div>
          </nav>
        </div>
      </header>
    )
  }
}

if (environment !== 'production') {
  PageHeader.propTypes = {
    location: T.object
  }
}
