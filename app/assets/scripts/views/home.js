'use strict'
import React from 'react'
import { connect } from 'react-redux'
import { PropTypes as T } from 'prop-types'

import { environment } from '../config'

import { fetchProjects } from '../actions'

import App from './app'
import ProjectCard from '../components/project-card'

class Home extends React.Component {
  componentDidMount () {
    this.props.dispatch(fetchProjects())
  }

  render () {
    return (
      <App>
        <div className='container dashboard'>
          <div className='row content stack-sm'>
            <div className='column-8'>
              <div className='dashboard-header'>
                <h3>Projects</h3>
                <div className='flex-fill'></div>
              </div>
              <div className='pagination-count'>
                Showing <strong>{1}</strong> - <strong>{this.props.projects.length}</strong> of <strong>{this.props.projects.length}</strong> projects
              </div>
              <div className='row stack-xs'>
                {this.props.projects.map(project => {
                  return <ProjectCard key={project.id} project={project} />
                })}
              </div>
            </div>
            <div className='column spacer'></div>
            <div className='column'>
              <div className='aside'>
                <section>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </section>
                <section className='aside-footer'>
                  <h5>Help</h5>
                  <ul className='list-unstyled'>
                    <li><a ng-href='https://help.radiant.earth/' target='_blank' href='https://help.radiant.earth/'>Help Center</a></li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
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
