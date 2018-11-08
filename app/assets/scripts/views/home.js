'use strict'
import React from 'react'
import { connect } from 'react-redux'
import { PropTypes as T } from 'prop-types'
import { Link } from 'react-router-dom'

import { environment } from '../config'

import { fetchProjects } from '../actions'

import App from './app'

class Home extends React.Component {
  componentDidMount () {
    this.props.dispatch(fetchProjects())
  }

  render () {
    return (
      <App>
        <ul>{this.props.projects.map(project => {
          return <li key={project.id}>
            <Link to={`/project/${project.id}`}>
              {project.name}
            </Link>
          </li>
        })}</ul>
      </App>
    )
  }
}

function mapStateToProps (state) {
  return {
    projects: state.projects || []
  }
}

if (environment !== 'production') {
  Home.propTypes = {
    dispatch: T.func,
    projects: T.array
  }
}

module.exports = connect(mapStateToProps)(Home)
