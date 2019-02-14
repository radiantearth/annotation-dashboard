'use strict'
import React from 'react'

import { appName } from '../config'

import App from './app'
import MetaTags from '../components/meta-tags'

export default class UhOh extends React.Component {
  render () {
    return (
      <App className='page--404'>
        <MetaTags title={`Not found — ${appName}`} />
        <article className='inpage inpage--uhoh'>
          <header className='inpage__header'>
            <div className='inner'>
              <div className='inpage__headline'>
                <h1 className='inpage__title'>Page not found</h1>
              </div>
            </div>
          </header>
          <div className='inpage__body'>
            <div className='inner'>
              <div className='col--main prose'>
                <p>The requested page does not exist or may have been removed.</p>
              </div>
            </div>
          </div>
        </article>
      </App>
    )
  }
}
