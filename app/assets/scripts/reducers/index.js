'use strict'
import {featureCollection as fc} from '@turf/helpers'
import intersect from '@turf/intersect'
import cloneDeep from 'lodash.clonedeep'
import { SETUP_MODAL } from '../utils/constants'

import { REQUEST_PROJECTS, RECEIVE_PROJECTS, REQUEST_ANNOTATIONS,
  RECEIVE_ANNOTATIONS, REQUEST_LABELS, RECEIVE_LABELS, UPDATE_MODAL, SET_GRID,
  SELECT_TASK, UPDATE_ANNOTATION, VALIDATE_GRID, SET_DRAW_LABEL,
  REQUEST_PROJECT, RECEIVE_PROJECT, APPEND_ANNOTATION, REQUEST_EXPORTS,
  RECEIVE_EXPORTS, ADD_PROJECT, DELETE_PROJECT, INVALIDATE_PROJECT
} from '../actions'

const initial = {
  projects: [],
  annotations: null,
  setUp: {},
  modal: SETUP_MODAL,
  grid: fc([]),
  selectedTaskId: null,
  drawLabel: null,
  labels: [],
  project: {},
  exports: []
}

const reducer = (state = initial, action) => {
  switch (action.type) {
    case REQUEST_PROJECT:
    case REQUEST_PROJECTS:
    case REQUEST_ANNOTATIONS:
    case REQUEST_LABELS:
    case REQUEST_EXPORTS:
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
        state.projects = action.data
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
        state.drawLabel = action.data[0]
      }
      return state
    case RECEIVE_PROJECT:
      state = {
        ...state,
        fetching: false,
        fetched: true
      }

      if (action.error) {
        state.error = action.error
      } else {
        state.project = action.data
      }
      return state
    case RECEIVE_EXPORTS:
      state = {
        ...state,
        fetching: false,
        fetched: true
      }

      if (action.error) {
        state.error = action.error
      } else {
        state.exports = action.data.results
      }
      return state
    case UPDATE_MODAL:
      return { ...state, modal: action.data }
    case SET_GRID:
      // TODO: review this idea and performance
      // upon setting the grid, intersect it with the annotations
      const grid = action.data
      state.annotations.forEach(a => {
        grid.features.some(feat => {
          const intersection = intersect(feat, a)
          if (intersection) {
            a.properties.tile = feat.id
            return true
          }
        })
      })
      return { ...state, grid: action.data }
    case SELECT_TASK:
      return { ...state, selectedTaskId: action.data }
    case UPDATE_ANNOTATION:
      const newList = state.annotations.slice(0)
      const index = newList.findIndex(a => a.id === action.data.id)
      newList[index] = action.data
      return { ...state, annotations: newList }
    case VALIDATE_GRID:
      const features = state.grid.features.slice(0)
      const featureIndex = features.findIndex(f => f.id === action.data)
      const f = cloneDeep(features[featureIndex])
      f.properties.status = 'validated'
      features[featureIndex] = f
      return { ...state, grid: fc(features) }
    case SET_DRAW_LABEL:
      return { ...state, drawLabel: action.data }
    case APPEND_ANNOTATION:
      return { ...state, annotations: state.annotations.concat(action.data) }
    case ADD_PROJECT:
      return { ...state, projects: state.projects.concat(action.data) }
    case DELETE_PROJECT:
      return { ...state, projects: state.projects.filter(p => p.id !== action.data) }
    case INVALIDATE_PROJECT:
      return { ...initial, projects: state.projects }
    default:
      return state
  }
}

export default reducer
