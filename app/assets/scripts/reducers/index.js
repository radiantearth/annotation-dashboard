'use strict'
import {featureCollection as fc} from '@turf/helpers'

import { REQUEST_PROJECTS, RECEIVE_PROJECTS, REQUEST_ANNOTATIONS,
  RECEIVE_ANNOTATIONS, REQUEST_LABELS, RECEIVE_LABELS, UPDATE_MODAL, SET_GRID,
  SELECT_TASK } from '../actions'

const initial = {
  projects: null,
  annotations: null,
  setUp: {},
  modal: true,
  grid: fc([]),
  selectedTaskId: null
}

const reducer = (state = initial, action) => {
  switch (action.type) {
    case REQUEST_PROJECTS:
    case REQUEST_ANNOTATIONS:
    case REQUEST_LABELS:
      return {
        ...state,
        error: null,
        fetching: true,
        fetched: false
      }
    case RECEIVE_PROJECTS:
      state = {
        ...state,
        fetching: false,
        fetched: true
      }

      if (action.error) {
        state.error = action.error
      } else {
        state.projects = action.data.results
      }
      return state
    case RECEIVE_ANNOTATIONS:
      state = {
        ...state,
        fetching: false,
        fetched: true
      }

      if (action.error) {
        state.error = action.error
      } else {
        state.annotations = action.data.features
      }
      return state
    case RECEIVE_LABELS:
      state = {
        ...state,
        fetching: false,
        fetched: true
      }

      if (action.error) {
        state.error = action.error
      } else {
        state.labels = action.data
      }
      return state
    case UPDATE_MODAL:
      return { ...state, modal: action.data }
    case SET_GRID:
      return { ...state, grid: action.data }
    case SELECT_TASK:
      return { ...state, selectedTaskId: action.data }
    default:
      return state
  }
}

export default reducer
