import React from 'react';

class FalconeHeader extends React.Component {

  render() {
    return (
      <div className="navbar" aria-hidden="false">
        <div className="navbar-section primary">
          <a href="/" className="brand">
            <img src={require("../assets/img/logo.png")} alt="Radiant Earth Foundation" />
          </a>
          <span className="navbar-vertical-divider"></span>
          <nav>
            <a href="/" className="active">
              <i className="icon-home"></i>
              <span>Home</span>
            </a>
          </nav>
        </div>
      </div>
    )
  }
}

export default FalconeHeader;
