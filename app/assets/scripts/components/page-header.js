'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'
import { NavLink } from 'react-router-dom'

import { environment } from '../config'
import * as AuthService from '../utils/auth'

export default class PageHeader extends React.PureComponent {
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
            <div className='dropdown-my-account dropdown'>
              <a>
                {ProfilePicture}
                <span className='username'>{profile.nickname}</span>
                <i className='icon-caret-down'></i>
              </a>
              <ul className='dropdown-menu dropdown-menu-right' aria-labelledby='dLabel'>
                <li>
                  <a ui-sref='user({userId: me})'>
                    My Profile
                  </a>
                </li>
                <li>
                  <a
                    ui-sref='admin.platform({platformId: $ctrl.platformId})'
                    ng-if='$ctrl.showAdmin'>
                    Platform Management
                  </a>
                </li>
                <li>
                  <a ui-sref='user.organizations({userId: me})'>
                    My Organizations
                  </a>
                </li>
                <li>
                  <a ui-sref='user.teams({userId: me})'>
                    My Teams
                  </a>
                </li>
                <li>
                  <a ui-sref='user.settings({userId: me})'>
                    Account Settings
                  </a>
                </li>
                <li role='separator' className='divider'></li>
                <li><a ng-click='$ctrl.logout()'>
                  Sign out
                </a></li>
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
