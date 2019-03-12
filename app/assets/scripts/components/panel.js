'use strict'

import React from 'react'
import { PropTypes as T } from 'prop-types'
// import c from 'classnames'

import { environment } from '../config'

import TaskCard from './task-card'

class Panel extends React.Component {
  constructor () {
    super()
    this.onClick = this.onClick.bind(this)
    this.hoverTask = this.hoverTask.bind(this)
    this.taskAnnotationClick = this.taskAnnotationClick.bind(this)
  }

  render () {
    const { selectedTask } = this.props
    const tasks = this.props.grid.features.sort((a, b) => a.id - b.id)
    return (
      <section className='sidebar'>
        <div className='sidebar-header'>
          Tasks: {tasks.filter(t => t.properties.status === 'validated').length} of {tasks.length} complete
          <div className='project-submit'>
            <button onClick={this.props.openSaveModal} type='button' className='btn btn-primary'>Save Project</button>
          </div>
        </div>
        <div className='list-group'>
          {tasks.map((task, i) => {
            return <TaskCard
              key={task.properties.tile.join('-')}
              task={task}
              selectedTask={selectedTask}
              index={i + 1}
              onClick={this.onClick.bind(this, task)}
              onEnter={this.hoverTask.bind(this, task.id, 1)}
              onLeave={this.hoverTask.bind(this, task.id, 0)}
              taskAnnotations={this.props.annotations.filter(a => a.properties.tile === +task.properties.tile.join(''))}
              taskAnnotationClick={this.taskAnnotationClick}
            />
          })}
        </div>
      </section>
    )
  }

  onClick (task) {
    this.props.selectTask(task)
  }

  hoverTask (id, hover) {
    this.props.getMap().setFeatureState({
      source: 'grid',
      id
    }, { hover })
  }

  taskAnnotationClick (annotation) {
    annotation.properties.validated = false
    this.props.updateAnnotation(annotation)
  }
}

if (environment !== 'production') {
  Panel.propTypes = {
    dispatch: T.func,
    grid: T.object,
    getMap: T.func,
    selectTask: T.func,
    selectedTask: T.object,
    annotations: T.array,
    updateAnnotation: T.func,
    openSaveModal: T.func
  }
}

export default Panel
