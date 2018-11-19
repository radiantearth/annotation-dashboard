'use strict'

import React from 'react'
import { PropTypes as T } from 'prop-types'
// import c from 'classnames'
import bbox from '@turf/bbox'

import { environment } from '../config'

import AnnotationCard from './annotation-card'

class Panel extends React.Component {
  constructor () {
    super()
    this.fitAnnotation = this.fitAnnotation.bind(this)
  }

  render () {
    return (
      <section className='sidebar'>
        <div className='sidebar-header'>Annotations</div>
        <div className='list-group'>
          {this.props.annotations.map(annotation => {
            return <AnnotationCard
              key={annotation.id}
              annotation={annotation}
              onClick={this.fitAnnotation.bind(this, annotation.geometry)}
            />
          })}
        </div>
      </section>
    )
  }

  fitAnnotation (geometry) {
    this.props.getMap().fitBounds(bbox(geometry), { padding: 50 })
  }
}

if (environment !== 'production') {
  Panel.propTypes = {
    annotations: T.array,
    getMap: T.func
  }
}

export default Panel
