'use strict'

import React from 'react'
import c from 'classnames'
import { saveAs } from 'file-saver'

import { updateSlider } from '../actions'
import { colors } from '../utils/colors'

class Control extends React.Component {
  constructor () {
    super()

    this.upload = this.upload.bind(this)
    this.save = this.save.bind(this)
    this.slide = this.slide.bind(this)
  }

  render () {
    const { classes, labels } = this.props
    return (
      <section className='panel' id='control'>
        <header className='panel__header'>
          <div className='panel__headline'>
            <h1 className='panel__title'>Relabeler</h1>
            <p className='panel__subtitle'>Update Machine Learning Labels</p>
          </div>
        </header>
        <div className={c('panel__body', { disabled: !labels })}>
          <div className='panel__body-inner'>
            <h4>Classes</h4>
            <ul id='legend'>
            {classes.map((cl, i) => {
              return (
                <li key={cl}>
                  <span className='label' style={{backgroundColor: colors[i % 10]}}></span>
                  {i === 0 ? 'Background' : `Class ${i}`}
                </li>
              )
            })}
            </ul>
            <h4>Label Opacity</h4>
            <input onChange={this.slide} id='slider' type='range' min={0} max={100} />
          </div>
        </div>
        <footer className='panel__footer'>
          <a onClick={this.upload} className='actions__menu-item action-upload' title='Upload' href='#'><span>Upload</span></a>
          <a onClick={this.save} className='actions__menu-item action-download' title='Save' href='#'><span>Save</span></a>
        </footer>
      </section>
    )
  }

  slide (e) {
    this.props.dispatch(updateSlider(e.target.valueAsNumber / 100))
  }

  upload () {}

  save () {
    const data = this.props.getMapData()
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json;charset=utf-8' })
    saveAs(blob, 'labels.geojson')
  }
}

export default Control
