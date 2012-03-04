(function() {
  var YoutubeData, qs, query, request, _;

  request = require('request');

  qs = require('querystring');

  _ = require('underscore')._;

  query = require('./query');

  YoutubeData = (function() {

    function YoutubeData(opts) {
      if (opts == null) opts = {};
      this.request();
    }

    return YoutubeData;

  })();

  YoutubeData.prototype.request = function() {
    this.method = 'request';
    return this;
  };

  YoutubeData.init = function(opts) {
    return new YoutubeData(opts);
  };

  YoutubeData.prototype.query = function() {
    return query["new"]();
  };

  YoutubeData.prototype.channel = function(chan, opts, cb) {
    var defaultOpts, maxResults, qs_, url;
    if (_.isFunction(opts)) {
      cb = opts;
      opts = {};
    }
    defaultOpts = {
      author: chan,
      alt: 'json',
      v: 2
    };
    opts = _.extend(defaultOpts, opts);
    maxResults = opts["max-results"] || opts.maxresults;
    if (maxResults > 50) maxResults = 50;
    opts["max-results"] = maxResults;
    qs_ = qs.stringify(opts);
    url = "http://gdata.youtube.com/feeds/api/videos?" + qs_;
    return request(url, function(err, res, body) {
      var json;
      if (err) return cb(err);
      try {
        json = JSON.parse(body);
      } catch (e) {
        return cb(e);
      }
      return cb(null, json);
    });
  };

  module.exports = YoutubeData;

}).call(this);
