(function() {
  var qs, query, request, yt, _;

  request = require('request');

  qs = require('querystring');

  _ = require('underscore')._;

  query = require('./query');

  yt = {};

  yt.query = function() {
    return query["new"]();
  };

  module.exports = yt;

}).call(this);
