'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'
import { NavLink } from 'react-router-dom'

import { environment } from '../config'

export default class PageHeader extends React.PureComponent {
  render () {
    return (
      <header className='navbar'>
        <div className='navbar-section primary'>
          <a ui-sref='home' className='brand'>
            <img src='assets/graphics/layout/logo.svg' style={{height: '3.9rem', maxWidth: '50px'}} />
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
            <rf-navbar-search className='form-group all-in-one'>
            </rf-navbar-search>
            <div ng-if='$ctrl.authService.isLoggedIn' className='dropdown-my-account'>
              <a>
                <img ng-if='$ctrl.authService.getProfile().picture' className='avatar tiny' ng-src='{{$ctrl.authService.getProfile().picture}}' />
                <div className='avatar image-placeholder' ng-if='$ctrl.authService.getProfile() && !$ctrl.authService.getProfile().picture'></div>
                <span className='username'>{/* $ctrl.authService.getProfile().nickname */}</span>
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
