import { REQUEST_PROJECTS, RECEIVE_PROJECTS } from '../actions'

const initial = {
  projects: null
}

const reducer = (state = initial, action) => {
  switch (action.type) {
    case REQUEST_PROJECTS:
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
    default:
      return state
  }
}

export default reducer
