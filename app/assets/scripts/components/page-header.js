'use strict'
import React, { Fragment } from 'react'
import { PropTypes as T } from 'prop-types'
import { NavLink } from 'react-router-dom'

import { environment, appName, appShortName } from '../config'

import Dropdown from './dropdown'
import Breakpoint from './breakpoint'

const menuItems = [
  {
    title: 'View page',
    url: '/',
    isActive: (match, location) => location.pathname === '/' || location.pathname.match(/^\/storms\//),
    label: 'Map'
  },
  {
    title: 'View page',
    url: '/analysis',
    label: 'Analysis'
  },
  {
    title: 'View page',
    url: '/about',
    label: 'About'
  },
  {
    title: 'View page',
    url: '/methodology',
    label: 'Methodology'
  },
  {
    title: 'View page',
    url: '/help',
    label: 'Help'
  }
]

export default class PageHeader extends React.PureComponent {
  renderMenu ({mediumUp}) {
    return (
      <Fragment>
        {!mediumUp ? <MenuOptions items={menuItems} onClick={this.closeNavigation} /> : null}
        <ul className='global-menu'>
          {menuItems.map(item => (
            <li key={item.label} className='global-menu__item'><NavLink to={item.url} isActive={item.isActive} title={item.title} className='global-menu__link' activeClassName='global-menu__link--active' onClick={this.closeNavigation}>{item.label}</NavLink></li>
          ))}
        </ul>
      </Fragment>
    )
  }

  render () {
    return (
      <header className='page__header'>
        <div className='inner'>
          <div className='page__headline'>
            <h1 className='page__title'><NavLink to='/' title='View homepage' data-appshortname={appShortName}><span>{appName}</span></NavLink></h1>
          </div>
          <nav className='page__prime-nav nav' role='navigation'>
            <div className='nav__block nav__block--global'>
              <Breakpoint>{this.renderMenu}</Breakpoint>
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

const MenuOptions = ({items, onClick}) => {
  return (
    <Dropdown
      className='browse-menu'
      triggerClassName='browse-button'
      triggerActiveClassName='button--active'
      triggerText='Menu'
      triggerTitle='Toggle menu options'
      direction='down'
      alignment='right' >

      <h6 className='drop__title'>Browse</h6>
      <ul className='drop__menu drop__menu--select'>
        {items.map(item => (
          <li key={item.label}><NavLink isActive={item.isActive} to={item.url} title={item.title} className='drop__menu-item' activeClassName='drop__menu-item--active' onClick={onClick}>{item.label}</NavLink></li>
        ))}
      </ul>

    </Dropdown>
  )
}

if (environment !== 'production') {
  MenuOptions.propTypes = {
    items: T.array,
    onClick: T.func
  }
}
