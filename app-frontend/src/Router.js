import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import OrganizationDetail from './components/OrganizationDetail';
import Organizations from './components/Organizations';
import UserActivity from './components/UserActivity';
import FalconeHeader from './components/FalconeHeader';
import './assets/css/main.css';

const Routing = () => (
    <BrowserRouter>
      <div>
        <FalconeHeader/>
        <div className="container">
          <div className="content educate_content">
            <Switch>
              <Route exact path="/" component={Organizations}/>
              <Route exact path="/organizations" component={Organizations}/>
              <Route exact path="/organizations/:orgId" component={OrganizationDetail}/>
              <Route path="/organizations/:orgId/users/:userId" component={UserActivity}/>
            </Switch>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
export default Routing
