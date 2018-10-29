import _ from 'lodash';
import React from 'react';
import API from '../lib/api';
import CHART from '../lib/chart';
import {Line} from 'react-chartjs-2';
import VerifiedTick from './VerifiedTick';


class Organizations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      organizations: [],
      timePeriod: "week",
      licensed: false
    }
    this.reloadTime = this.reloadTime.bind(this);
    this.reloadLicense = this.reloadLicense.bind(this);
  }

  componentDidMount() {
    Promise.all([
      API.getOrganizations(),
      API.getEventsCountForAllOrganizations("view", this.state.timePeriod, this.state.licensed),
      API.getEventsCountForAllOrganizations("download", this.state.timePeriod, this.state.licensed),
      API.getEventsCountForAllOrganizations("upload", this.state.timePeriod, this.state.licensed),
      API.getEventsCountForAllOrganizations("analyze", this.state.timePeriod, this.state.licensed),
      API.getEventUsersTotalCount()
    ]).then(results => {
      const organizations = results[0];
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
        organizations,
        totalOrgs: organizations.length,
        viewedChartData: CHART.getViewedChart(results[1]).chart,
        downloadedChartData: CHART.getDownloadedChart(results[2]).chart,
        uploadedChartData: CHART.getUploadedChart(results[3]).chart,
        analyzedChartData: CHART.getAnalyzedChart(results[4]).chart,
        viewCount: CHART.getViewedChart(results[1]).count,
        downloadCount: CHART.getDownloadedChart(results[2]).count,
        uploadCount: CHART.getUploadedChart(results[3]).count,
        analyzeCount: CHART.getAnalyzedChart(results[4]).count,
        chartOptions,
        totalUsers: results[5],
        totalVerified: CHART.getVerifiedOrgsCount(results[0])
      });
    });
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

  render() {
    if (_.isEmpty(this.state.organizations)) { return null; }
    return (
      <div>
        <section>
          <div className="breadcrumb" dir="ltr">
            <div className="link__arrow o__ltr">
              <a href="/">Radiant Earth</a>
            </div>
            <div className="link__arrow o__ltr">Blockchain Admin</div>
          </div>

          <h4>Admin Dashboard</h4>

          <div className="row">
            <div className="column-6">
              <p>All Insights</p>
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

        <hr/>

        <section>
          <h4>Organization Overview</h4>
          <p>All Insights</p>

          <div className="row org-overview">
            <div className="column-4">
              <div className="org-overview-item i1">
                <p>{this.state.totalVerified}</p>
                <p>Verified NGOs</p>
              </div>
            </div>
            <div className="column-4">
              <div className="org-overview-item i2">
                <p>{this.state.totalOrgs}</p>
                <p>Total Organizations</p>
              </div>
            </div>
            <div className="column-4">
              <div className="org-overview-item i3">
                <p>{this.state.totalUsers}</p>
                <p>Total Users</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <p>Organization Information</p>

          <table className="org-info">
            <thead>
              <tr>
                <th width="15%">NGO Status</th>
                <th width="40%">Org Name</th>
                <th width="20%">Org ID</th>
                <th width="25%"></th>
              </tr>
            </thead>

            <tbody>
              {this.state.organizations.map(organization => {
              return [
                <tr key={organization.orgId}>
                  <td>
                    <VerifiedTick status={organization.verified} />
                  </td>
                  <td>{organization.name}</td>
                  <td>{organization.orgId}</td>
                  <td>
                    <a className="btn btn-primary org-btn" ui-sref="projects.list" href={"/organizations/" + organization.orgId}>
                      Organization Dashboard
                    </a>
                  </td>
                </tr>
              ]
              })}
            </tbody>
          </table>
        </section>
      </div>
    )
  }
}

export default Organizations;
