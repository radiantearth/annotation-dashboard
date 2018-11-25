'use strict'

import React from 'react'
import { PropTypes as T } from 'prop-types'
// import c from 'classnames'
import { environment } from '../config'

class TaskCard extends React.Component {
  render () {
    return (
      <div
        className='list-group-item'
        onClick={this.props.onClick}
        onMouseEnter={this.props.onEnter}
        onMouseLeave={this.props.onLeave}>
        {this.props.task.properties.tile}
      </div>
    )
  }
}

if (environment !== 'production') {
  TaskCard.propTypes = {
    onClick: T.func,
    onLeave: T.func,
    onEnter: T.func,
    task: T.object
  }
}

export default TaskCard
