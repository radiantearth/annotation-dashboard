import React from 'react'
import { PropTypes as T } from 'prop-types'
import c from 'classnames'
import ReactTimeout from 'react-timeout'

import { environment } from '../config'
import { ERROR_DISPLAY_TIMEOUT } from '../utils/constants'

class AddProjectCard extends React.Component {
  constructor () {
    super()
    this.state = {
      projectID: ''
    }
    this.addProject = this.addProject.bind(this)
  }

  componentDidUpdate () {
    if (this.props.addProjectError) {
      this.props.setTimeout(() => this.props.clearError(), ERROR_DISPLAY_TIMEOUT)
    }
  }

  render () {
    const { addProjectError } = this.props
    return (
      <div className='column-12 flex-display'>
        <div className='panel panel-off-white project-item'>
          <div className='panel-body'>
            <h4>Add New Project</h4>
            <p>Insert a project ID string to begin validating a new set of labels</p>
            <form>
              <input className='project-id' type='text' placeholder='Project ID' value={this.state.projectID} onChange={e => this.setState({projectID: e.target.value})} />
              <span className='error'>{addProjectError}</span>
            </form>
            <button type='button' onClick={() => this.addProject(this.state.projectID)} className={c('btn btn-primary', { disabled: !this.state.projectID })}>
              Add
            </button>
          </div>
        </div>
      </div>
    )
  }

  addProject (id) {
    this.props.addProject(id)
    this.setState({ projectID: '' })
  }
}

export default ReactTimeout(AddProjectCard)

if (environment !== 'production') {
  AddProjectCard.propTypes = {
    addProject: T.func,
    setTimeout: T.func,
    addProjectError: T.string,
    clearError: T.func
  }
}
