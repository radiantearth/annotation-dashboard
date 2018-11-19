'use strict'
import fetch from 'isomorphic-fetch'
import config from '../config'

export const REQUEST_PROJECTS = 'REQUEST_PROJECTS'
export const RECEIVE_PROJECTS = 'RECEIVE_PROJECTS'

export const REQUEST_ANNOTATIONS = 'REQUEST_ANNOTATIONS'
export const RECEIVE_ANNOTATIONS = 'RECEIVE_ANNOTATIONS'

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
