import { execute as commonExecute, expandReferences } from 'language-common';
import request from 'request';
import { resolve as resolveUrl } from 'url';
import base64 from 'base-64';
import utf8 from 'utf8';
import { resumen } from './resumen.min.js';

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
    return commonExecute(...operations)({ ...initialState, ...state })
  };

}

export function tito(xyz, salt) {

  return state => {
  		console.log("../data/ficha_est-" + xyz + "_" + resumen(salt + base64.encode("ficha-" + xyz + ".xml")) + ".xml");
  }

}

/**
 * Make a GET request and POST the response somewhere else without failing.
 */
export function fetchWithErrors(params) {

  return state => {

    const { getEndpoint, query, externalId, postUrl } = expandReferences(params)(state);

    const { username, password, baseUrl, authType } = state.configuration;

    var sendImmediately = authType == 'digest' ? false : true;

    const url = resolveUrl(baseUrl + '/', getEndpoint)

    console.log("Performing an error-less GET on URL: " + url);
    console.log("Applying query: " + JSON.stringify(query))

    function assembleError({ response, error }) {
      if (response && ([200,201,202].indexOf(response.statusCode) > -1)) return false;
      if (error) return error;
      return new Error(`Server responded with ${response.statusCode}`)
    }

    return new Promise((resolve, reject) => {

      request({
        url: url,      //URL to hit
        qs: query,     //Query string data
        method: 'GET', //Specify the method
        auth: {
          'user': username,
          'pass': password,
          'sendImmediately': sendImmediately
        }
      }, function(error, response, body){
        var taggedResponse = {
          response: response,
          externalId: externalId
        }
        console.log(taggedResponse)
        request.post ({
          url: postUrl,
          json: taggedResponse
        }, function(error, response, postResponseBody){
          error = assembleError({error, response})
          if (error) {
            console.error("POST failed.")
            reject(error);
          } else {
            console.log("POST succeeded.");
            resolve(body);
          }
        })
      });

    }).then((data) => {
      const nextState = { ...state, response: { body: data } };
      return nextState;
    })
  }
}

export {
  field, fields, sourceValue, alterState, each,
  merge, dataPath, dataValue, lastReferenceValue
} from 'language-common';
