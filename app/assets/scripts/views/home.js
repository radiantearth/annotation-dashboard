'use strict'
import React from 'react'
import { connect } from 'react-redux'

import { fetchProjects } from '../actions'

import App from './app'

class Home extends React.Component {
  componentDidMount () {
    this.props.dispatch(fetchProjects())
  }

  render () {
    return (
      <App>
        <span></span>
      </App>
    )
  }
}

function mapStateToProps (state) {
  return {
    projects: state.projects
  }
}

module.exports = connect(mapStateToProps)(Home)
