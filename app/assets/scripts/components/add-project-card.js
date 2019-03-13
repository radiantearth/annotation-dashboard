import React from 'react'
import { PropTypes as T } from 'prop-types'
import c from 'classnames'

import { environment } from '../config'

class AddProjectCard extends React.Component {
  constructor () {
    super()
    this.state = {
      projectID: ''
    }
    this.addProject = this.addProject.bind(this)
  }

  render () {
    return (
      <div className='column-12 flex-display'>
        <div className='panel panel-off-white project-item'>
          <div className='panel-body'>
            <div className='project-preview'>
              <p>Insert a project ID string to begin validating a new set of labels</p>
              <form>
                <input type='text' placeholer='Insert project ID' value={this.state.projectID} onChange={e => this.setState({projectID: e.target.value})} />
              </form>
              <button type='button' onClick={() => this.addProject(this.state.projectID)} className={c('btn btn-primary', { disabled: !this.state.projectID })}>
                Add
              </button>
            </div>
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

export default AddProjectCard

if (environment !== 'production') {
  AddProjectCard.propTypes = {
    addProject: T.func
  }
}
