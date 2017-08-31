import { execute as commonExecute, expandReferences } from 'language-common';
var request = require('sync-request');
import { resolve as resolveUrl } from 'url';
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var Buffer = require('buffer/').Buffer  // note: the trailing slash is important!

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
export function getSomeData(params) {

  var getDocs = function(db, filter, callback) {
    // Get the documents collection
    var collection = db.collection('simce_2016_school_records');
    // Insert some documents
    collection.readyMany(
      filter
    , function(err, result) {
      assert.equal(err, null);
      console.log(result);
      callback(result);
    });
  }

  return state => {

    const { documentFilter } = expandReferences(params)(state);
    const { connection_string, db_name, username, password } = state.configuration;

    // NOTE: or use a different way of connecting... you could use your username
    // and password method, for example...
    const url = connection_string

    // Use connect method to connect to the server
    MongoClient.connect(url, {
      // server: {
        // socketOptions: {
          // 100 second timout
          connectTimeoutMS:10000,
          socketTimeoutMS:10000
        // }
      // }
    }, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to server");

      getDocs(db, documentFilter, function() {
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
