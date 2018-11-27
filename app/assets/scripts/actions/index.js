'use strict'
import fetch from 'isomorphic-fetch'
import config from '../config'

export const REQUEST_PROJECTS = 'REQUEST_PROJECTS'
export const RECEIVE_PROJECTS = 'RECEIVE_PROJECTS'

export const REQUEST_ANNOTATIONS = 'REQUEST_ANNOTATIONS'
export const RECEIVE_ANNOTATIONS = 'RECEIVE_ANNOTATIONS'

export const REQUEST_LABELS = 'REQUEST_LABELS'
export const RECEIVE_LABELS = 'RECEIVE_LABELS'

export const UPDATE_MODAL = 'UPDATE_MODAL'

export const SET_GRID = 'SET_GRID'

export const SELECT_TASK = 'SELECT_TASK'

export const UPDATE_ANNOTATION = 'UPDATE_ANNOTATION'
export const VALIDATE_GRID = 'VALIDATE_GRID'
export const SET_DRAW_LABEL = 'SET_DRAW_LABEL'

export function requestProjects () {
  return { type: REQUEST_PROJECTS }
}

export function receiveProjects (projects, error = null) {
  return { type: RECEIVE_PROJECTS, data: projects, error, receivedAt: Date.now() }
}

export function fetchProjects (query = {}) {
  return getAndDispatch(`${config.api}/projects`, requestProjects, receiveProjects)
}

export function requestAnnotations () {
  return { type: REQUEST_ANNOTATIONS }
}

export function receiveAnnotations (annotations, error = null) {
  return { type: RECEIVE_ANNOTATIONS, data: annotations, error, receivedAt: Date.now() }
}

export function fetchAnnotations (projectID, query = {}) {
  return getAndDispatch(`${config.api}/projects/${projectID}/annotations/`, requestAnnotations, receiveAnnotations)
}

export function requestLabels () {
  return { type: REQUEST_LABELS }
}

export function receiveLabels (labels, error = null) {
  return { type: RECEIVE_LABELS, data: labels.concat(['test label 1', 'test label 2']), error, receivedAt: Date.now() }
}

export function fetchLabels (projectID, query = {}) {
  return getAndDispatch(`${config.api}/projects/${projectID}/labels/`, requestLabels, receiveLabels)
}

export function updateModal (bool) {
  return { type: UPDATE_MODAL, data: bool }
}

export function setGrid (grid) {
  return { type: SET_GRID, data: grid }
}

export function selectTask (id) {
  return { type: SELECT_TASK, data: id }
}

export function updateAnnotation (feature) {
  return { type: UPDATE_ANNOTATION, data: feature }
}

export function validateGrid (id) {
  return { type: VALIDATE_GRID, data: id }
}

export function setDrawLabel (label) {
  return { type: SET_DRAW_LABEL, data: label }
}

// Fetcher function
function getAndDispatch (url, requestFn, receiveFn) {
  return fetchDispatchFactory(url, {
    headers: {
      'Authorization': `Bearer ${config.sessionToken}`
    }
  }, requestFn, receiveFn)
}

function fetchDispatchFactory (url, options, requestFn, receiveFn) {
  return function (dispatch, getState) {
    dispatch(requestFn())

    fetchJSON(url, options)
      .then(json => dispatch(receiveFn(json)), err => dispatch(receiveFn(null, err)))
  }
}

export function fetchJSON (url, options) {
  return fetch(url, options)
    .then(response => response.json())
    .catch(err => {
      console.log('fetchJSON error', err)
      return Promise.reject({
        message: err.message
      })
    })
}
