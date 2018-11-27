'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'
import { render, unmountComponentAtNode } from 'react-dom'
import bbox from '@turf/bbox'
import Select from 'react-select'
import c from 'classnames'

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
  constructor () {
    super()

    this.validateAnnotation = this.validateAnnotation.bind(this)
    this.updateLabel = this.updateLabel.bind(this)
  }
  render () {
    const { task, annotations, labels } = this.props
    if (!task) return ''
    // if the task has features and they aren't validated, do that first
    const features = annotations.filter(a => !a.properties.validated && a.properties.tile === task.id)
    if (features.length) {
      const feature = features[0]
      this.props.verifyAnnotation(feature.id)
      const options = labels.map(label => ({ value: label, label }))
      const value = { value: feature.properties.label, label: feature.properties.label }
      return (
        <div className='validator map-item'>
          <header>
            <h1>Validate Feature</h1>
          </header>
          <div className='validator-body'>
            <p>Is this the correct feature? Update the geometry using the map tools or the label by using the dropdown below.</p>
            <Select
              options={options}
              value={value}
              onChange={e => this.updateLabel(feature, e)}
            />
          </div>
          <footer>
            <button className='btn btn-primary' onClick={this.validateAnnotation.bind(this, feature)}>Validate Feature and Advance</button>
          </footer>
        </div>
      )
    } else {
      this.props.map.fitBounds(bbox(task.geometry), { padding: 50 })
      return (
        <div className='validator map-item'>
          <header>
            <h1>Validate Grid Cell</h1>
          </header>
          <div className='validator-body'>
            <p>Are there any other features which need to be labeled? If so, select the corresponding button and begin labeling. Otherwise, confirm this grid cell as validated.</p>
            <form>
              {this.props.labels.map(label => {
                return <label className={c('checkbox radio', {active: label === this.props.drawLabel})} key={label}>
                  <input onClick={e => this.props.setDrawLabel(e.target.value)} type='radio' name='label' value={label}/>{label}
                </label>
              })}
            </form>
          </div>
          <footer>
            <button className='btn btn-primary' onClick={this.props.validateGridAndAdvance.bind(this, task)}>Validate Grid Cell and Advance</button>
          </footer>
        </div>
      )
    }
  }

  validateAnnotation (feature) {
    feature.properties.validated = 'true'
    this.props.updateAnnotation(feature)
  }

  updateLabel (feature, event) {
    feature.properties.label = event.value
    this.props.updateAnnotation(feature)
  }
}

Validator.propTypes = {
  task: T.object,
  verifyAnnotation: T.func,
  updateAnnotation: T.func,
  labels: T.array,
  annotations: T.array,
  validateGridAndAdvance: T.func,
  map: T.object,
  drawLabel: T.string,
  setDrawLabel: T.func
}
