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
import Login from './views/login'

import * as AuthService from './utils/auth'

// instead of the traditional pattern of redirecting to the login component,
// we render it without updating the url/location. Then we can easily get the
// user to the correct page after authenticating
const AuthRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    AuthService.isAuthenticated()
      ? <Component {...props} />
      : <Login {...props} />
  )} />
)

// Root component. Used by the router.
const Root = () => (
  <Provider store={store}>
    <Router history={history}>
      <Switch>
        <AuthRoute exact path='/' component={Home}/>
        <AuthRoute path='/project/:id' component={Project}/>
        <Route path='/login' component={Login} />
        <Route path='*' component={UhOh} />
      </Switch>
    </Router>
  </Provider>
)

render(<Root store={store} />, document.querySelector('#app-container'))
