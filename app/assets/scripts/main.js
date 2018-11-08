'use strict'

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, Switch } from 'react-router-dom'

import store from './utils/store'
import history from './utils/history'

import Home from './views/home'
import Project from './views/project'
import UhOh from './views/uhoh'

// Root component. Used by the router.
const Root = () => (
  <Provider store={store}>
    <Router history={history}>
      <Switch>
        <Route exact path='/' component={Home}/>
        <Route path='/project/:id' component={Project}/>
        <Route path='*' component={UhOh} />
      </Switch>
    </Router>
  </Provider>
)

render(<Root store={store} />, document.querySelector('#app-container'))
