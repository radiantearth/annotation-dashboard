'use strict'

export function objForeach (obj, callbackFn) {
  return Object.keys(obj).some(k => callbackFn(obj[k], k))
}
