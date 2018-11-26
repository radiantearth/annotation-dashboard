'use strict'
import {featureCollection as fc} from '@turf/helpers'
import intersect from '@turf/intersect'
import cloneDeep from 'lodash.clonedeep'

import { REQUEST_PROJECTS, RECEIVE_PROJECTS, REQUEST_ANNOTATIONS,
  RECEIVE_ANNOTATIONS, REQUEST_LABELS, RECEIVE_LABELS, UPDATE_MODAL, SET_GRID,
  SELECT_TASK, VALIDATE_ANNOTATION } from '../actions'

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
    case VALIDATE_ANNOTATION:
      const newList = state.annotations.slice(0)
      const index = newList.findIndex(a => a.id === action.data)
      const a = cloneDeep(newList[index])
      a.properties.validated = true
      newList[index] = a
      return { ...state, annotations: newList }
    default:
      return state
  }
}

export default reducer
