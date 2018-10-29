import React, { Component } from 'react';
import './App.css';
import {Helmet} from "react-helmet";
import Router from './Router';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Helmet>
          <meta charSet="utf-8" />
          <meta Content-Security-Policy="default-src 'self' *.ngrok.com img-src *" />
          <title>Radiant.Earth Blockchain Dashboard</title>
        </Helmet>
        <Router/>
      </div>
    );
  }
}

export default App;
