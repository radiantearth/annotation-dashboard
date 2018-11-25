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
    this.fitTask = this.fitTask.bind(this)
    this.hoverTask = this.hoverTask.bind(this)
  }

  render () {
    const tasks = this.props.grid.features.sort((a, b) => a.id - b.id)
    return (
      <section className='sidebar'>
        <div className='sidebar-header'>Tasks: {tasks.filter(t => t.properties.validated).length} of {tasks.length} complete</div>
        <div className='list-group'>
          {tasks.map(task => {
            return <TaskCard
              key={task.properties.tile.join('-')}
              task={task}
              onClick={this.fitTask.bind(this, task.geometry)}
              onEnter={this.hoverTask.bind(this, task.id, 1)}
              onLeave={this.hoverTask.bind(this, task.id, 0)}
            />
          })}
        </div>
      </section>
    )
  }

  fitTask (geometry) {
    this.props.getMap().fitBounds(bbox(geometry), { padding: 50 })
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
    grid: T.object,
    getMap: T.func
  }
}

export default Panel
