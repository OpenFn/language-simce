'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastReferenceValue = exports.dataValue = exports.dataPath = exports.merge = exports.each = exports.alterState = exports.sourceValue = exports.fields = exports.field = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.execute = execute;
exports.tito = tito;

var _languageCommon = require('language-common');

Object.defineProperty(exports, 'field', {
  enumerable: true,
  get: function get() {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, 'fields', {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, 'sourceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, 'alterState', {
  enumerable: true,
  get: function get() {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, 'each', {
  enumerable: true,
  get: function get() {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, 'merge', {
  enumerable: true,
  get: function get() {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, 'dataPath', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, 'dataValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, 'lastReferenceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.lastReferenceValue;
  }
});

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _url = require('url');

var _base = require('base-64');

var _base2 = _interopRequireDefault(_base);

var _utf = require('utf8');

var _utf2 = _interopRequireDefault(_utf);

var _resumenMin = require('./resumen.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parser = require('xml2json');

/** @module Adaptor */

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for http.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @constructor
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
function execute() {
  for (var _len = arguments.length, operations = Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  var initialState = {
    references: [],
    data: null
  };

  return function (state) {
    return _languageCommon.execute.apply(undefined, operations)(_extends({}, initialState, state));
  };
}

// export function tito(xyz, salt) {
//
//   return state => {
//   		console.log("../data/ficha_est-" + xyz + "_" + resumen(salt + base64.encode("ficha-" + xyz + ".xml")) + ".xml");
//   }
//
// }

/**
 * Make a GET request and POST the response somewhere else without failing.
 */
function tito(params) {

  return function (state) {
    var _expandReferences = (0, _languageCommon.expandReferences)(params)(state),
        codes = _expandReferences.codes,
        postUrl = _expandReferences.postUrl;

    var _state$configuration = state.configuration,
        baseUrl = _state$configuration.baseUrl,
        salt = _state$configuration.salt;

    var _loop = function _loop() {

      var code = codes[i];

      var getEndpoint = "data/ficha_est-" + code + "_" + (0, _resumenMin.resumen)(salt + _base2.default.encode("ficha-" + code + ".xml")) + ".xml";

      var url = (0, _url.resolve)(baseUrl + '/', getEndpoint);

      console.log("Performing an error-less GET on URL: " + url);

      function assembleError(_ref) {
        var response = _ref.response,
            error = _ref.error;

        if (response && [200, 201, 202].indexOf(response.statusCode) > -1) return false;
        if (error) return error;
        return new Error('Server responded with ' + response.statusCode);
      };

      return {
        v: new Promise(function (resolve, reject) {

          (0, _request2.default)({
            url: url,
            method: 'GET'
          }, function (error, response, body) {
            console.log(body);
            var jsonBody = JSON.parse(parser.toJson(body));
            _request2.default.post({
              url: postUrl,
              json: jsonBody
            }, function (error, response, postResponseBody) {
              error = assembleError({
                error: error,
                response: response
              });
              if (error) {
                console.error("POST failed.");
                reject(error);
              } else {
                console.log("POST succeeded.");
                jsonBody.attemptedRbd = code, resolve(jsonBody);
              }
            });
          });
        }).then(function (data) {
          var nextState = _extends({}, state, {
            lastRun: data
          });
          return nextState;
        })
      };
    };

    for (var i = 0; i < codes.length; i++) {
      var _ret = _loop();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }
  };
}
