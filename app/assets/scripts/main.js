'use strict'

import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'

import config from './config'
import reducer from './reducers'
import { updateLabels } from './actions'

const logger = createLogger({
  level: 'info',
  collapsed: true,
  predicate: (getState, action) => {
    return (config.environment !== 'production')
  }
})

const store = createStore(
  reducer,
  applyMiddleware(
    thunkMiddleware,
    logger
  )
)

const data = require('../labels')
setTimeout(() => {
  store.dispatch(updateLabels(data))
}, 1000)

// Components
import App from './views/app'

render((
  <Provider store={store}>
    <App />
  </Provider>
), document.querySelector('#app-container'))
