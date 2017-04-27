import {
  execute as commonExecute,
  expandReferences
} from 'language-common';
var request = require('sync-request');
// import request from 'request';
import {
  resolve as resolveUrl
} from 'url';
import base64 from 'base-64';
import utf8 from 'utf8';
import {
  resumen
} from './resumen.min.js';

var parser = require('xml2json');
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

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
/**
 * Make a GET request and POST the response somewhere else without failing.
 */
export function tito(params) {

  var insertDocuments = function(db, jsonArray, callback) {
    // Get the documents collection
    var collection = db.collection('simce_2015_school_records');
    // Insert some documents
    collection.insertMany(
      jsonArray
    , function(err, result) {
      assert.equal(err, null);
      console.log(result.insertedCount);
      callback(result);
    });
  }

  return state => {

    const { codes } = expandReferences(params)(state);
    const { baseUrl, salt, mongoUrl } = state.configuration;

    var schools = [];

    codes.forEach(function (code) {
      // var code = element;
      var getEndpoint = ("data/ficha_est-" + code + "_" + resumen(salt + base64.encode("ficha-" + code + ".xml")) + ".xml");
      var url = resolveUrl(baseUrl + '/', getEndpoint);
      console.log("Performing a GET on URL: " + url);

      try {
        var res = request('GET', url);
        const jsonBody = JSON.parse(parser.toJson(res.getBody()));
        console.log("Successfully fetched RBD " + code);
        schools.push(jsonBody.establecimientos.estab);
        console.log(jsonBody);
      } catch (e) {
        console.log("Failed to fetch RBD " + code);
      }
    });

    // Connection URL
    var url = mongoUrl

    // Use connect method to connect to the server
    MongoClient.connect(url, {
      // server: {
        // socketOptions: {
          connectTimeoutMS:360000,
          socketTimeoutMS:360000
        // }
      // }
    }, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to server");

      insertDocuments(db, schools, function() {
        db.close();
      });
    });

  };
};

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
