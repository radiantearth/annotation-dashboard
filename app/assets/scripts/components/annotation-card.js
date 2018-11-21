'use strict'

import React from 'react'
// import c from 'classnames'

class AnnotationCard extends React.Component {
  render () {
    return (
      <div className='list-group-item' onClick={this.props.onClick}>
      {this.props.annotation.properties.label}
      </div>
    )
  }
}

export default AnnotationCard
