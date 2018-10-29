import _ from "lodash";
import React from 'react';
import Moment from 'react-moment';
import EventCost from './EventCost';
import 'moment-timezone';
import {Bar,Line} from 'react-chartjs-2';
import API from '../lib/api';
import CHART from '../lib/chart';

const config = require("../config");

class Organization extends React.Component {
  constructor(props) {
    super();
    this.orgId = props.match.params.orgId;
    this.state = {
      events: [],
      count: 0,
      timePeriod: "week",
      licensed: false,
      lowerShowingBound: 1,
      upperShowingBound: 50,
      offset: 0
    };
    this.reloadTime = this.reloadTime.bind(this);
    this.reloadLicense = this.reloadLicense.bind(this);
    this.addOffset = this.addOffset.bind(this);
    this.subtractOffset = this.subtractOffset.bind(this);
  }

  componentDidMount() {
    Promise.all([
      API.getOrganization(this.orgId),
      API.getEventsForOrganization(this.orgId, this.state.offset),
      API.getEventsCountForOrganization(this.orgId, "view", this.state.timePeriod, this.state.licensed),
      API.getEventsCountForOrganization(this.orgId, "download", this.state.timePeriod, this.state.licensed),
      API.getEventsCountForOrganization(this.orgId, "upload", this.state.timePeriod, this.state.licensed),
      API.getEventsCountForOrganization(this.orgId, "analyze", this.state.timePeriod, this.state.licensed),
      API.getEventsCountForOrganizationUsers(this.orgId, "user", this.state.timePeriod, this.state.licensed),
      API.getOrgEventCount(this.orgId),
    ]).then(results => {
      const orgData = results[0];
      const {events} = results[1];
      const count = results[2].length;
      const userData = results[6];
      const chartOptions = {
        scales: {
          xAxes: [{
            gridLines: {
              display:false
            }
          }],
           yAxes: [{
              gridLines: {
                display:false
              }
          }]
        }
      };

      this.setState({
        name: orgData.name,
        walletAddress: orgData.wallet,
        walletBalance: orgData.balance,
        initialMintTxHash: orgData.initialMintTxHash,
        events,
        eventsCount: events.length,
        count,
        "userData": CHART.getUserChartData(userData),
        viewedChartData: CHART.getViewedChart(results[2]).chart,
        downloadedChartData: CHART.getDownloadedChart(results[3]).chart,
        uploadedChartData: CHART.getUploadedChart(results[4]).chart,
        analyzedChartData: CHART.getAnalyzedChart(results[5]).chart,
        viewCount: CHART.getViewedChart(results[2]).count,
        downloadCount: CHART.getDownloadedChart(results[3]).count,
        uploadCount: CHART.getUploadedChart(results[4]).count,
        analyzeCount: CHART.getAnalyzedChart(results[5]).count,
        chartOptions,
        totalEvents: results[7]
      });

    });
  }

  kaleidoWalletURL(address) {
    return config.KALEIDO_WALLET_EXPLORER.replace("__address__", address);
  }

  kaleidoTxURL(hash) {
    return config.KALEIDO_TX_EXPLORER.replace("__hash__", hash);
  }

  reloadTime(e) {
    this.setState({timePeriod: e.target.value}, function () {
      this.componentDidMount();
    });

  }
  reloadLicense(e) {
    this.setState({licensed: e.target.value}, function () {
      this.componentDidMount();
    });
  }
  addOffset(e) {
    var offset = 50;
    if (this.state.upperShowingBound + offset > this.state.totalEvents) {
      offset = this.state.totalEvents - this.state.upperShowingBound;
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

  render() {
    if (_.isEmpty(this.state.name)) { return null; }
    return (
      <div className="content section">
        <div className="breadcrumb" dir="ltr">
          <div className="link__arrow o__ltr">
            <a href="/">Radiant Earth</a>
          </div>
          <div className="link__arrow o__ltr">
            <a href="/organizations">Blockchain Admin</a>
          </div>
          <div className="link__arrow o__ltr">{this.state.name}</div>
        </div>

        <div className="panel panel-off-white">
          <div className="paper g__space collection__headline">
            <div className="collection o__ltr">
              <div className="collection__photo">
                <svg role="img" viewBox="0 0 48 48"><g id="book-library" strokeWidth="2" fill="none" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round"><path d="M21 47H9V1h12v46zm12 0H21V17h12v30zm-8-4h4M15 5v26"></path><path d="M17 43h-4v-8h4v8zm10-22v18M5 13v28m-4 6h8V7H1v40zm45.81-1.5L41 47 30.998 8.27l5.81-1.5 10 38.73z"></path></g></svg>
              </div>
              <div className="collection__meta intercom-force-break" dir="ltr">
                <h2 className="t__h1">{this.state.name}</h2>
                <p className="paper__preview">
                  Wallet: <a target="top" href={this.kaleidoWalletURL(this.state.walletAddress)}>{this.state.walletAddress}</a>
                </p>
                <p className="paper__preview">
                  Balance: <a target="top" href={this.kaleidoTxURL(this.state.initialMintTxHash)}>{this.state.walletBalance} RDT</a>
                </p>
                <p className="paper__preview">Total Events: {this.state.totalEvents}</p>
              </div>
            </div>
          </div>
        </div>

        <section>
          <h4>Organization Dashboard</h4>

          <div className="row">
            <div className="column-6">
              <p>Insight</p>
            </div>
            <div className="column-6 filters">
              <div>
                <select onChange={this.reloadTime} value={this.state.timePeriod}>
                  <option value="day">Today</option>
                  <option value="week" defaultValue>Week</option>
                  <option value="month">Month</option>
                </select>
              </div>
              <div>
                <select onChange={this.reloadLicense} value={this.state.licensed}>
                  <option value="true" defaultValue>Licensed</option>
                  <option value="false">Non-Licensed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="column-6">
              <div className="thin-border">
                <div className="column-12">
                  <Line data={this.state.viewedChartData} options={this.state.chartOptions}/>
                </div>
                <div className="column-12 chart-info">
                  <p>{this.state.viewCount} <span> Image Views</span></p>
                </div>
              </div>
            </div>
            <div className="column-6">
              <div className="thin-border">
                <div className="column-12">
                  <Line data={this.state.downloadedChartData} options={this.state.chartOptions}/>
                </div>
                <div className="column-12 chart-info">
                  <p>{this.state.downloadCount} <span> Image Downloads</span></p>
                </div>
              </div>
            </div>
            <div className="column-6">
              <div className="thin-border">
                <div className="column-12">
                  <Line data={this.state.uploadedChartData} options={this.state.chartOptions}/>
                </div>
                <div className="column-12 chart-info">
                  <p>{this.state.uploadCount} <span> Image Uploads</span></p>
                </div>
              </div>
            </div>
            <div className="column-6">
              <div className="thin-border">
                <div className="column-12">
                  <Line data={this.state.analyzedChartData} options={this.state.chartOptions}/>
                </div>
                <div className="column-12 chart-info">
                  <p>{this.state.analyzeCount} <span> Image Analysis</span></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h4>User Activity</h4>
          <div className="thin-border">
            <Bar
              data={this.state.userData}
              height={175}
              options={this.state.chartOptions}
            />
          </div>
        </section>

        <section>
          <div className="row">
            <div className="column-6 org-content">
              <p>Showing {this.state.lowerShowingBound} - {this.state.upperShowingBound} of {this.state.totalEvents} events</p>
            </div>

            <div className="column-6 filters">
              <button onClick={this.subtractOffset}>&lt;</button>
              <button onClick={this.addOffset}>&gt;</button>
            </div>
          </div>

          {this.state.events.map(event => {

          return [
            <div className="g__space" key={event.orgId}>
                <div className="t__no-und paper">
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
                            User ID: <span className="c__darker"> <a href={`/organizations/${event.orgId}/users/` + event.userId}>{event.userId}</a> </span>
                            <br/>
                            {event.action} <span className="capitalize c__light">{event.metadata.sceneId}</span>
                            <br/>
                            <EventCost cost={event.action} />
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

        </section>
      </div>
    )
  }
}

export default Organization;
