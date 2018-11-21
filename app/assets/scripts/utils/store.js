'use strict'
import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'

import config from '../config'
import reducer from '../reducers'
import { createUrlUpdater } from './url-state'

const logger = createLogger({
  level: 'info',
  collapsed: true,
  predicate: (getState, action) => {
    return (config.environment !== 'production')
  }
})

const composeEnhancers = config.environment !== 'production' ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose : compose
const store = createStore(reducer, composeEnhancers(applyMiddleware(
  thunkMiddleware,
  logger,
  createUrlUpdater()
)))

export default store
