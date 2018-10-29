import React from 'react';

class VerifiedTick extends React.Component {

  render() {
    const status = this.props.status;
    if (status) {
      return (
        <span className="verified">
          <div className="verified_stem"></div>
          <div className="verified_kick"></div>
        </span>
      );
    }
    return '';
  }
}
export default VerifiedTick;
