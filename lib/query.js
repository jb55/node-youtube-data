(function() {
  var EventEmitter, Query, fmt, qs, request, _,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  qs = require('querystring');

  _ = require('underscore')._;

  request = require('request');

  fmt = require('./formatting');

  EventEmitter = require('events').EventEmitter;

  Query = (function(_super) {

    __extends(Query, _super);

    Query["new"] = function() {
      return new Query;
    };

    function Query(opts) {
      if (opts == null) opts = {};
      this.qs = opts.qs || {};
      this.opts = {};
    }

    Query.prototype.results = function(r) {
      var maxResults;
      maxResults = r;
      if (this.maxResults > 50) maxResults = 50;
      this.qs["max-results"] = maxResults;
      return this;
    };

    Query.prototype.orderByViewCount = function() {
      this.orderBy('viewCount');
      return this;
    };

    Query.prototype.orderByPublished = function() {
      this.orderBy('published');
      return this;
    };

    Query.prototype.orderByRelevance = function() {
      this.orderBy('relevance');
      return this;
    };

    Query.prototype.orderBy = function(ordering) {
      this.qs.orderby = ordering;
      return this;
    };

    Query.prototype.page = function(page) {
      this.opts.page = page;
      if (this.p) this.opts.page = 1;
      return this;
    };

    Query.prototype.pages = function(start, end) {
      this.opts.start = start;
      this.opts.end = end;
      return this;
    };

    Query.prototype.all = function(all) {
      if (all == null) all = true;
      this.opts.all = all;
      return this;
    };

    Query.prototype.startAt = function(ind) {
      this.qs["start-index"] = ind;
      return this;
    };

    Query.prototype.author = function(author) {
      this.qs.author = author;
      return this;
    };

    Query.prototype.type = function(type) {
      this.opts.type = type;
      return this;
    };

    Query.prototype.user = function(user) {
      this.type("users");
      this.opts.id = user;
      return this;
    };

    Query.prototype.videos = function(author) {
      this.type("videos");
      if (author) this.author(author);
      return this;
    };

    Query.prototype.simple = function(simple) {
      if (simple == null) simple = true;
      this.opts.simple = simple;
      return this;
    };

    Query.generateQs = function(qs_) {
      var defaultOpts;
      defaultOpts = {
        alt: 'json',
        v: 2
      };
      _.extend(defaultOpts, qs_);
      return defaultOpts;
    };

    Query.doRequest = function(querystring, opts, cb) {
      var id, qs_, simple, type, url;
      qs_ = qs.stringify(Query.generateQs(querystring));
      type = opts.type, simple = opts.simple;
      if (!type) return cb("Query type not selected. eg. query.videos('author')");
      id = opts.id ? "/" + opts.id : "";
      url = "http://gdata.youtube.com/feeds/api/" + type + id + "?" + qs_;
      return request(url, function(err, res, body) {
        var json;
        if (err) return cb(err);
        try {
          json = JSON.parse(body);
        } catch (e) {
          return cb(e);
        }
        if (simple && type === 'videos') {
          json.feed.entry = _.map(json.feed.entry, fmt.video.entry.simple);
        }
        return cb(null, json);
      });
    };

    Query.prototype.run = function(cb) {
      var entries, go, maxLen, startAt,
        _this = this;
      if (this.opts.all) {
        entries = [];
        maxLen = this.qs["max-length"] = this.qs["max-length"] || 50;
        startAt = this.qs["start-index"] = this.qs["start-index"] || 1;
        go = function(qs_) {
          return Query.doRequest(qs_, _this.opts, function(err, data) {
            var entry, numEntries, _i, _len, _ref;
            if (err) return cb(err);
            _this.emit('result', data);
            numEntries = data.feed.entry.length;
            _ref = data.feed.entry;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              entry = _ref[_i];
              entries.push(entry);
            }
            if (numEntries === 0 || numEntries < maxLen) {
              data.feed.entry = entries;
              return cb(null, data);
            } else {
              qs_["start-index"] = startAt += maxLen;
              return go(qs_);
            }
          });
        };
        go(this.qs);
      } else {
        Query.doRequest(this.qs, this.opts, cb);
      }
      return this;
    };

    return Query;

  })(EventEmitter);

  module.exports = Query;

}).call(this);
