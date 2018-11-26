'use strict'

import React from 'react'
import { PropTypes as T } from 'prop-types'
// import c from 'classnames'
import bbox from '@turf/bbox'

import { environment } from '../config'

import TaskCard from './task-card'

class Panel extends React.Component {
  constructor () {
    super()
    this.onClick = this.onClick.bind(this)
    this.hoverTask = this.hoverTask.bind(this)
  }

  render () {
    const tasks = this.props.grid.features.sort((a, b) => a.id - b.id)
    return (
      <section className='sidebar'>
        <div className='sidebar-header'>Tasks: {tasks.filter(t => t.properties.validated).length} of {tasks.length} complete</div>
        <div className='list-group'>
          {tasks.map((task, i) => {
            return <TaskCard
              key={task.properties.tile.join('-')}
              task={task}
              index={i + 1}
              onClick={this.onClick.bind(this, task)}
              onEnter={this.hoverTask.bind(this, task.id, 1)}
              onLeave={this.hoverTask.bind(this, task.id, 0)}
            />
          })}
        </div>
      </section>
    )
  }

  onClick (task) {
    this.props.getMap().fitBounds(bbox(task.geometry), { padding: 50 })
    this.props.selectTask(task.id)
  }

  hoverTask (id, hover) {
    this.props.getMap().setFeatureState({
      source: 'grid',
      id
    }, { hover })
  }
}

if (environment !== 'production') {
  Panel.propTypes = {
    dispatch: T.func,
    grid: T.object,
    getMap: T.func,
    selectTask: T.func
  }
}

export default Panel
