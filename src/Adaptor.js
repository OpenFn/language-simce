import {
  execute as commonExecute,
  expandReferences
} from 'language-common';
import request from 'request';
import {
  resolve as resolveUrl
} from 'url';
import base64 from 'base-64';
import utf8 from 'utf8';
import {
  resumen
} from './resumen.min.js';
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
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null
  }

  return state => {
    return commonExecute(...operations)({ ...initialState,
      ...state
    })
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
export function tito(params) {

  return state => {

    const { codes, postUrl } = expandReferences(params)(state);
    const { baseUrl, salt } = state.configuration;

    for (var i = 0; i < codes.length; i++) {

      const code = codes[i];
      // TODO: fix this out.

      const getEndpoint = ("data/ficha_est-" + code + "_" + resumen(salt + base64.encode("ficha-" + code + ".xml")) + ".xml")

      const url = resolveUrl(baseUrl + '/', getEndpoint)

      console.log("Performing an error-less GET on URL: " + url);

      function assembleError({
        response,
        error
      }) {
        if (response && ([200, 201, 202].indexOf(response.statusCode) > -1)) return false;
        if (error) return error;
        return new Error(`Server responded with ${response.statusCode}`)
      };

      return new Promise((resolve, reject) => {

        request({
          url: url,
          method: 'GET',
        }, function(error, response, body) {
          console.log(body);
          const jsonBody = JSON.parse(parser.toJson(body));
          request.post({
            url: postUrl,
            json: jsonBody
          }, function(error, response, postResponseBody) {
            error = assembleError({
              error,
              response
            })
            if (error) {
              console.error("POST failed.")
              reject(error);
            } else {
              console.log("POST succeeded.");
              jsonBody.attemptedRbd = code,
              resolve(jsonBody);
            }
          })
        });

      }).then((data) => {
        const nextState = { ...state,
          lastRun: data
        };
        return nextState;
      })
    }
  }
}

export {
  field,
  fields,
  sourceValue,
  alterState,
  each,
  merge,
  dataPath,
  dataValue,
  lastReferenceValue
}
from 'language-common';
