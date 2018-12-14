'use strict'

import React, {Fragment} from 'react'
import { PropTypes as T } from 'prop-types'
import c from 'classnames'
import { environment } from '../config'

class TaskCard extends React.Component {
  render () {
    const active = this.props.selectedTask && this.props.selectedTask.id === this.props.task.id
    const validated = this.props.task.properties.status === 'validated'
    return (
      <Fragment>
        <div
          className={c('list-group-item', { active, validated })}
          onClick={this.props.onClick}
          onMouseEnter={this.props.onEnter}
          onMouseLeave={this.props.onLeave}>
          Task {this.props.index} <i className='icon-check' style={{color: validated ? '#0B5FBF' : '#ccd4dc'}}></i>
        </div>
        { active ? this.props.taskAnnotations.map(ta => {
          return <div key={ta.id} className={c('list-group-item', 'task-feature')}>{ta.properties.label} <i className='icon-check' style={{color: ta.properties.validated ? '#0B5FBF' : '#ccd4dc'}}></i></div>
        }) : ''}
      </Fragment>
    )
  }
}

if (environment !== 'production') {
  TaskCard.propTypes = {
    onClick: T.func,
    onLeave: T.func,
    onEnter: T.func,
    task: T.object,
    index: T.number,
    selectedTask: T.object,
    taskAnnotations: T.array
  }
}

export default TaskCard
