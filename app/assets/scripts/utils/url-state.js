'use strict'

/**
 * Decodes the state from the url query param
 *
 * @return {object} The state
 */
export function stateFromUrl () {
  return null
}

/**
 * Returns a redux store middleware function that updates the url with
 * a new encoded state every time there's a change.
 *
 * @return {function} Redux middleware function
 */
export function createUrlUpdater () {
  return store => next => action => {
    // We want the state after it is updated.
    return next(action)
  }
}
