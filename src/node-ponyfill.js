const nodeMajor = parseInt(process.versions.node.split('.')[0])

if (nodeMajor >= 16) {
  const undici = require('undici')

  const fetch = function (requestOrUrl, options) {
    if (typeof requestOrUrl === 'string') {
      return fetch(new Request(requestOrUrl, options))
    }
    requestOrUrl.headers = requestOrUrl.headers || new undici.Headers({})
    requestOrUrl.headers.delete('connection')
    return undici.fetch(requestOrUrl)
  }

  function Request (requestOrUrl, options) {
    if (typeof requestOrUrl === 'string') {
      options = options || {}
      options.headers = options.headers || {}
      delete options.headers.connection
      delete options.headers.Connection
      return new undici.Request(requestOrUrl, options)
    }
    const newRequestObj = requestOrUrl.clone()
    newRequestObj.headers = newRequestObj.headers || new undici.Headers({})
    newRequestObj.headers.delete('connection')
    return newRequestObj
  }

  fetch.ponyfill = true

  module.exports = exports = fetch
  exports.fetch = fetch
  exports.Headers = undici.Headers
  exports.Request = Request
  exports.Response = undici.Response

  // Needed for TypeScript consumers without esModuleInterop.
  exports.default = fetch
} else {
  const nodeFetch = require('node-fetch')
  const realFetch = nodeFetch.default || nodeFetch

  const fetch = function (requestOrUrl, options) {
    if (typeof requestOrUrl === 'string') {
      // Support schemaless URIs on the server for parity with the browser.
      // Ex: //github.com/ -> https://github.com/
      if (/^\/\//.test(requestOrUrl)) {
        requestOrUrl = 'https:' + requestOrUrl
      }
      return fetch(new nodeFetch.Request(requestOrUrl, options))
    }
    requestOrUrl.headers.set('Connection', 'keep-alive')
    return realFetch(requestOrUrl)
  }

  fetch.ponyfill = true

  module.exports = exports = fetch
  exports.fetch = fetch
  exports.Headers = nodeFetch.Headers
  exports.Request = nodeFetch.Request
  exports.Response = nodeFetch.Response

  // Needed for TypeScript consumers without esModuleInterop.
  exports.default = fetch
}
