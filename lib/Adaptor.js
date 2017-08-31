'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastReferenceValue = exports.dataValue = exports.dataPath = exports.merge = exports.each = exports.alterState = exports.sourceValue = exports.fields = exports.field = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.execute = execute;
exports.getSomeData = getSomeData;

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

var _url = require('url');

var request = require('sync-request');

var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');
var Buffer = require('buffer/').Buffer; // note: the trailing slash is important!

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

/**
 * Make a GET request and POST the response somewhere else without failing.
 */
function getSomeData(params) {

  var getDocs = function getDocs(db, filter, callback) {
    // Get the documents collection
    var collection = db.collection('simce_2016_school_records');
    // Insert some documents
    collection.readyMany(filter, function (err, result) {
      assert.equal(err, null);
      console.log(result);
      callback(result);
    });
  };

  return function (state) {
    var _expandReferences = (0, _languageCommon.expandReferences)(params)(state),
        documentFilter = _expandReferences.documentFilter;

    var _state$configuration = state.configuration,
        connection_string = _state$configuration.connection_string,
        db_name = _state$configuration.db_name,
        username = _state$configuration.username,
        password = _state$configuration.password;

    // NOTE: or use a different way of connecting... you could use your username
    // and password method, for example...

    var url = connection_string;

    // Use connect method to connect to the server
    MongoClient.connect(url, {
      // server: {
      // socketOptions: {
      // 100 second timout
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000
      // }
      // }
    }, function (err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to server");

      getDocs(db, documentFilter, function () {
        db.close();
      });
    });
  };
};
