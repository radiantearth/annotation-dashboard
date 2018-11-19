import { REQUEST_PROJECTS, RECEIVE_PROJECTS, REQUEST_ANNOTATIONS,
  RECEIVE_ANNOTATIONS } from '../actions'

const initial = {
  projects: null,
  annotations: null
}

const reducer = (state = initial, action) => {
  switch (action.type) {
    case REQUEST_PROJECTS:
    case REQUEST_ANNOTATIONS:
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
    default:
      return state
  }
}

export default reducer
