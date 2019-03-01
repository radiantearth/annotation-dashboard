'use strict'
import bbox from '@turf/bbox'
import fetch from 'isomorphic-fetch'
import { featureCollection as fc } from '@turf/helpers'

import config from '../config'
import * as AuthService from './auth'

export function objForeach (obj, callbackFn) {
  return Object.keys(obj).some(k => callbackFn(obj[k], k))
}

const fetchOptions = {
  headers: {
    'Authorization': `Bearer ${AuthService.getToken()}`
  }
}

async function getProject (id) {
  return fetch(`${config.api}/projects/${id}`, fetchOptions).then(resp => resp.json())
}

async function getScenes (id) {
  return fetch(`${config.api}/projects/${id}/scenes`, fetchOptions).then(resp => resp.json())
}

async function getExports (id) {
  return fetch(`${config.api}/exports?project=${id}&exportStatus=EXPORTED`, fetchOptions)
    .then(resp => resp.json())
}

// takes project props object and convert to payload for saving
export async function propsToProject (props) {
  const id = props.match.params.id
  const scenes = await getScenes(id)
  const project = await getProject(id)
  const exports = await getExports(id)
  return {
    id,
    name: project.name,
    description: `Labels for project ${id}`,
    'validated area': bbox(props.grid),
    'scene-metadata': { results: scenes.results },
    labels: fc(props.annotations),
    source: exports.count > 0 ? `${exports.results[0].exportOptions.source}/export.tif` : null
  }
}
