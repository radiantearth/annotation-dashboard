import React from 'react'
import { PropTypes as T } from 'prop-types'
import { Link } from 'react-router-dom'

const ProjectCard = props => {
  const { project } = props
  return (
    <div className='column-6 flex-display'>
      <div className='panel panel-off-white project-item'>
        <div className='panel-body'>
          <Link to={`/project/${project.id}`} className='no-hover'>
            <img className='avatar tiny' src={project.owner.profileImageUri} />
            <h4 className='project-title'>{project.name}</h4>
          </Link>
          <div className='project-actions'>
            <a href=''>
              <i className='icon-share'></i>
              <span className='sr-only'>Annotate</span>
            </a>
          </div>
          <div className='project-preview'>
            <Link to={`/project/${project.id}`} style={{ textDecoration: 'none' }}>
              <div className='project-preview-container placeholder' style={{ backgroundImage: 'url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjQsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iNTAwcHgiIGhlaWdodD0iNTAwcHgiIHZpZXdCb3g9IjI1MCAyNTAgNTAwIDUwMCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAyNTAgMjUwIDUwMCA1MDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHBhdHRlcm4gIHg9IjAuNSIgeT0iMTAwMC41IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIGlkPSJ0cmFuc3BhcmVudFBhdHRlcm4iIHZpZXdCb3g9IjAgLTMwIDMwIDMwIiBvdmVyZmxvdz0idmlzaWJsZSI+DQoJPGc+DQoJCTxwb2x5Z29uIGZpbGw9Im5vbmUiIHBvaW50cz0iMCwtMzAgMzAsLTMwIDMwLDAgMCwwIAkJIi8+DQoJCTxwb2x5Z29uIGZpbGw9IiNGRkZGRkYiIHBvaW50cz0iMCwwIDE1LDAgMTUsLTE1IDAsLTE1IAkJIi8+DQoJCTxwb2x5Z29uIGZpbGw9IiNGRkZGRkYiIHBvaW50cz0iMTUsLTE1IDMwLC0xNSAzMCwtMzAgMTUsLTMwIAkJIi8+DQoJCTxwb2x5Z29uIGZpbGw9IiNFNUU1RTUiIHBvaW50cz0iMTUsMCAzMCwwIDMwLC0xNSAxNSwtMTUgCQkiLz4NCgkJPHBvbHlnb24gZmlsbD0iI0U1RTVFNSIgcG9pbnRzPSIwLC0xNSAxNSwtMTUgMTUsLTMwIDAsLTMwIAkJIi8+DQoJPC9nPg0KPC9wYXR0ZXJuPg0KPGc+DQoJPHRpdGxlPuKAnFRyYW5zcGFyZW504oCdIEJhY2tncm91bmQgUGF0dGVybiwgYnkgQWRhbSBTdGFuaXNsYXY8L3RpdGxlPg0KCTxwYXR0ZXJuICBpZD0iU1ZHSURfMV8iIHhsaW5rOmhyZWY9IiN0cmFuc3BhcmVudFBhdHRlcm4iIHBhdHRlcm5UcmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAxNzkuNSAtMTcwNjMuNSkiPg0KCTwvcGF0dGVybj4NCgk8cmVjdCB4PSIyNTAiIHk9IjI1MCIgZmlsbD0idXJsKCNTVkdJRF8xXykiIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIi8+DQo8L2c+DQo8Zz4NCgk8dGl0bGU+4oCcVHJhbnNwYXJlbnTigJ0gQmFja2dyb3VuZCBQYXR0ZXJuLCBieSBBZGFtIFN0YW5pc2xhdjwvdGl0bGU+DQoJPHBhdHRlcm4gIGlkPSJTVkdJRF8yXyIgeGxpbms6aHJlZj0iI3RyYW5zcGFyZW50UGF0dGVybiIgcGF0dGVyblRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIC0xIDE3OS41IC0xNzA2My41KSI+DQoJPC9wYXR0ZXJuPg0KCTxyZWN0IHg9IjEzNjMuMDQyIiB5PSIxMTguMDI3IiBmaWxsPSJ1cmwoI1NWR0lEXzJfKSIgd2lkdGg9IjEwMDAiIGhlaWdodD0iMTAwMCIvPg0KPC9nPg0KPC9zdmc+DQo=")' }}>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard

// getZoomLevel(bbox) {
//     let diffLng = Math.abs(bbox[0] - bbox[2]);
//     let diffLat = Math.abs(bbox[1] - bbox[3]);
//
//     // Scale down if latitude is less than 55 to adjust for
//     // web mercator distortion
//     let lngMultiplier = bbox[0] < 55 ? 0.8 : 1;
//     let maxDiff = diffLng > diffLat ? diffLng : diffLat;
//     let diff = maxDiff * lngMultiplier;
//     if (diff >= 0.5) {
//         return 8;
//     } else if (diff >= 0.01 && diff < 0.5) {
//         return 11;
//     } else if (diff >= 0.005 && diff < 0.01) {
//         return 16;
//     }
//     return 18;
// }
//
// getProjectThumbnailURL(project, token) {
//     if (project.extent) {
//         let coords = project.extent.coordinates[0];
//         // Lower left and upper right coordinates in extent
//         let bbox = [...coords[0], ...coords[2]];
//         let params = {
//             bbox: bbox,
//             zoom: this.getZoomLevel(bbox),
//             token: token
//         };
//         let formattedParams = L.Util.getParamString(params);
//         let url = `${this.tileServer}/${project.id}/export/${formattedParams}`;
//         return url;
//     }
//     return null;
// }
