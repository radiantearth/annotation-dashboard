import React from 'react'
import { PropTypes as T } from 'prop-types'
import { Link } from 'react-router-dom'

import { environment } from '../config'

const ProjectCard = props => {
  const { project, deleteProject } = props
  return (
    <div className='column-12 flex-display'>
      <div className='panel panel-off-white project-item'>
        <div className='panel-body'>
          <Link to={`/project/${project.id}`} style={{ textDecoration: 'none' }}>
            <h4 className='project-name'>{project.name}</h4>
            <p>Project ID: {project.id}</p>
          </Link>
          <div className='project-actions'>
            <a href='' onClick={(e) => deleteProject(e, project.id)}>
              <i className='icon-trash'></i>
              <span className='sr-only'>Delete</span>
            </a>
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

if (environment !== 'production') {
  ProjectCard.propTypes = {
    project: T.object,
    deleteProject: T.func
  }
}
