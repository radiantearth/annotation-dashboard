'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'
import { render, unmountComponentAtNode } from 'react-dom'
// import c from 'classnames'

// Mapbox Control class.
export default class ValidatorControl {
  constructor ({task}) {
    this.task = task
  }

  onAdd (map) {
    this.theMap = map
    this._container = document.createElement('div')
    this._container.className = 'mapboxgl-ctrl'

    // Since the Validator is a react component disconnencted from
    // the global application state, it's not possible to pass props the normal
    // way. To solve this we store a _render function associated with the
    // valdiator and call it when the component needs to be rendered
    // with different props.
    // We're also caching the props to avoid having to pass them all every time
    // we call the render function
    let cacheProps = {}
    this._render = (props) => {
      cacheProps = { ...cacheProps, ...props }
      render(<Validator {...cacheProps} />, this._container)
    }

    this._render({
      task: this.task
    })

    return this._container
  }

  onRemove () {
    unmountComponentAtNode(this._container)
    this._container.parentNode.removeChild(this._container)
    this.theMap = undefined
  }
}

// React component for the validator.
// It is disconnected from the global state because it needs to be included
// via the mapbox code.
class Validator extends React.Component {
  render () {
    const { task, annotations } = this.props
    if (!task) return ''
    // if the task has features and they aren't validated, do that first
    const features = annotations.filter(a => !a.properties.validated && a.properties.tile === task.id)
    if (features.length) {
      const feature = features[0]
      this.props.verifyAnnotation(feature.id)
      return (
        <div className='validator map-item'>
          <div className='validator-body'>
          Is this the correct geometry for {feature.properties.label}? Edit if needed.
          </div>
          <footer>
            <button className='btn btn-primary' onClick={this.props.validateAnnotation.bind(this, feature.id)}>Next</button>
          </footer>
        </div>
      )
    } else {
      return (
        <div className='validator map-item'>
          <div className='validator-body'>
          Are there any other things which need to be labeled from this set of labels: {this.props.labels.join(', ')}
          </div>
          <footer>
            <button className='btn btn-primary' onClick={this.props.validateGridAndAdvance.bind(this, task)}>Next</button>
          </footer>
        </div>
      )
    }
  }
}

Validator.propTypes = {
  task: T.object,
  verifyAnnotation: T.func,
  validateAnnotation: T.func,
  labels: T.array,
  annotations: T.array,
  validateGridAndAdvance: T.func
}
