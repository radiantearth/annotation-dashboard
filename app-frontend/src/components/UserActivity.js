import React from 'react';
import Moment from 'react-moment';
import 'moment-timezone';
import EventCost from './EventCost';

import API from '../lib/api';
import CHART from '../lib/chart';

const config = require("../config");

class UserActivity extends React.Component {
  constructor(props) {
    super();
    this.orgId = props.match.params.orgId;
    this.userId = props.match.params.userId;
    this.state = {
      events: [],
      eventCount: 0,
      lowerShowingBound: 1,
      upperShowingBound: 50,
      offset: 0
    };

    this.addOffset = this.addOffset.bind(this);
    this.subtractOffset = this.subtractOffset.bind(this);
  }

  componentDidMount() {
    Promise.all([
      API.getEventsForUser(this.userId, this.state.offset),
      API.getEventsCountForUser(this.userId)
    ]).then(results => {
      const {events} = results[0];

      this.setState({
        events,
        count: CHART.getUserEventCount(results[1])
      });
    });
  }

  addOffset(e) {
    var offset = 50;
    if (this.state.upperShowingBound + offset > this.state.count) {
      offset = this.state.count - this.state.upperShowingBound;
    }
    this.setState({
      lowerShowingBound: this.state.lowerShowingBound + offset,
      upperShowingBound: this.state.upperShowingBound + offset,
      offset: this.state.offset + offset
    }, function () {
      this.componentDidMount();
    });
  }

  subtractOffset(e) {
    var offset = 50;
    if (this.state.lowerShowingBound - offset < 1) {
      offset = this.state.lowerShowingBound - 1;
    }
    this.setState({
      lowerShowingBound: this.state.lowerShowingBound - offset,
      upperShowingBound: this.state.upperShowingBound - offset,
      offset: this.state.offset - offset
    }, function () {
      this.componentDidMount();
    });
  }

  kaleidoTxURL(hash) {
    return config.KALEIDO_TX_EXPLORER.replace("__hash__", hash);
  }

  render() {
    return (
      <section className="content section">
        <div className="breadcrumb" dir="ltr">
          <div className="link__arrow o__ltr">
            <a href="/">Radiant Earth</a>
          </div>
          <div className="link__arrow o__ltr">
            <a href="/organizations">Blockchain Admin</a>
          </div>
          <div className="link__arrow o__ltr">
            <a href={`/organizations/${this.orgId}`}>{this.orgId}</a>
          </div>
          <div className="link__arrow o__ltr">User: {this.userId}</div>
        </div>

        <div className="panel panel-off-white">
          <div className="paper g__space collection__headline">
            <div className="collection o__ltr">
              <div className="collection__photo">
                <svg role="img" viewBox="0 0 48 48"><g id="book-library" strokeWidth="2" fill="none" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round"><path d="M21 47H9V1h12v46zm12 0H21V17h12v30zm-8-4h4M15 5v26"></path><path d="M17 43h-4v-8h4v8zm10-22v18M5 13v28m-4 6h8V7H1v40zm45.81-1.5L41 47 30.998 8.27l5.81-1.5 10 38.73z"></path></g></svg>
              </div>
              <div className="collection__meta intercom-force-break" dir="ltr">
                <h2 className="t__h1">User: {this.userId}</h2>
                <p className="paper__preview">Total Events: {this.state.count}</p>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="column-6 org-content">
              <p>Showing {this.state.lowerShowingBound} - {this.state.upperShowingBound} of {this.state.count} events</p>
            </div>
            <div className="column-6 filters">
              <button onClick={this.subtractOffset}>&lt;</button>
              <button onClick={this.addOffset}>&gt;</button>
            </div>
          </div>


          {this.state.events.map(event => {
          return [
            <div className="g__space" key={event.orgId}>
                <div className="t__no-und paper paper__article-preview">
                  <div className="article__preview intercom-force-break" dir="ltr">
                    <span className="paper__preview c__body">
                      <Moment format="MMMM Do, YYYY - h:mm a z" tz="America/New_York">{event.createdAt}</Moment>
                    </span>

                    <div className="row">
                      <div className="column-7">
                        <div className="avatar__photo o__ltr">
                            <img src={require("../assets/img/logo.png")} className="avatar__image" alt="" />
                        </div>
                        <div className="avatar__info">
                          <div>
                            Org Name: <span className="c__darker"> <a href={`/organizations/${event.orgId}/users/` + event.userId}>{event.userId}</a> </span>
                            <br/>
                            {event.action} <span className="capitalize c__light">
                              {event.metadata.sceneId}
                              <br/>
                              <EventCost cost={event.action} />
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="column-1"></div>

                      <div className="column-4">
                        <a target="_blank" className="btn btn-primary org-btn" ui-sref="projects.list" href={this.kaleidoTxURL(event.txHash)}>
                          View in Blockchain Explorer
                        </a>
                      </div>
                    </div>

                  </div>
                </div>
            </div>
          ]
          })}
        </div>
      </section>

    )
  }
}

export default UserActivity;
