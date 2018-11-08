'use strict'

export const UPDATE_SLIDER = 'UPDATE_SLIDER'
export const UPDATE_LABELS = 'UPDATE_LABELS'

export function updateSlider (value) {
  return { type: UPDATE_SLIDER, data: value }
}

export function updateLabels (data) {
  return { type: UPDATE_LABELS, data }
}
