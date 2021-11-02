const nodeMajor = parseInt(process.versions.node.split('.')[0]);

if (nodeMajor >= 16) {
  const undici = require("undici");

  undici.fetch.ponyfill = true;

  module.exports = exports = undici.fetch;
  exports.fetch = undici.fetch;
  exports.Headers = undici.Headers;
  exports.Request = undici.Request;
  exports.Response = undici.Response;

  // Needed for TypeScript consumers without esModuleInterop.
  exports.default = fetch;
} else {
  const nodeFetch = require("node-fetch");
  const realFetch = nodeFetch.default || nodeFetch;

  const fetch = function (url, options) {
    // Support schemaless URIs on the server for parity with the browser.
    // Ex: //github.com/ -> https://github.com/
    if (/^\/\//.test(url)) {
      url = "https:" + url;
    }
    return realFetch.call(this, url, options);
  };

  fetch.ponyfill = true;

  module.exports = exports = fetch;
  exports.fetch = fetch;
  exports.Headers = nodeFetch.Headers;
  exports.Request = nodeFetch.Request;
  exports.Response = nodeFetch.Response;

  // Needed for TypeScript consumers without esModuleInterop.
  exports.default = fetch;
}