import { UPDATE_SLIDER, UPDATE_LABELS } from '../actions'

const initial = {
  sliderValue: 50,
  classes: []
}

const reducer = (state = initial, action) => {
  switch (action.type) {
    case UPDATE_SLIDER:
      return Object.assign({}, state, { sliderValue: action.data })
    case UPDATE_LABELS:
      return Object.assign({}, state, {
        classes: action.data.features[0].properties.label,
        labels: action.data
      })
    default:
      return state
  }
}

export default reducer
