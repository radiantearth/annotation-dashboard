import React from 'react';

class EventCost extends React.Component {

  render() {
    const costType = this.props.cost;
    const costLookup = {
      upload: '',
      view: '',
      analyze: 'Cost: 1 RDT',
      download: 'Cost: 5 RDT'
    }
    const cost = costLookup[costType];

    return <span>{cost}</span>;
  }
}
export default EventCost;
