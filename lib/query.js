(function() {
  var EventEmitter, Query, fmt, qs, request, _,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  qs = require('querystring');

  _ = require('underscore')._;

  request = require('request');

  fmt = require('./formatting');

  EventEmitter = require('events').EventEmitter;

  Query = (function(_super) {
    var ignoredParams, optsToQs, qsParams;

    __extends(Query, _super);

    Query["new"] = function() {
      return new Query;
    };

    optsToQs = {
      results: "max-results",
      startAt: "start-index"
    };

    qsParams = ["results", "orderby", "author", "startAt"];

    ignoredParams = {
      users: ["results", "author", "orderby", "startAt", "all"]
    };

    function Query(opts) {
      if (opts == null) opts = {};
      this.opts = {};
    }

    Query.prototype.results = function(r) {
      var maxResults;
      maxResults = r;
      if (this.maxResults > 50) maxResults = 50;
      this.opts.results = maxResults;
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
      this.opts.orderby = ordering;
      return this;
    };

    Query.prototype.all = function(all) {
      if (all == null) all = true;
      this.opts.all = all;
      return this;
    };

    Query.prototype.startAt = function(ind) {
      this.opts.startAt = ind;
      return this;
    };

    Query.prototype.author = function(author) {
      if (!author) return this.opts.author;
      this.opts.author = author;
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

    Query.prototype.responses = function(id) {
      this.type("videos");
      this.opts.id = "" + id + "/responses";
      return this;
    };

    Query.prototype.comments = function(id) {
      this.type("videos");
      this.opts.id = "" + id + "/comments";
      return this;
    };

    Query.prototype.videos = function(author) {
      if (!author) return this.opts.author;
      this.type("videos");
      if (author) this.author(author);
      return this;
    };

    Query.prototype.simple = function(simple) {
      if (simple == null) simple = true;
      this.opts.simple = simple;
      return this;
    };

    Query.generateQs = function(opts) {
      var c, k, qs_, v;
      qs_ = {
        alt: 'json',
        v: 2
      };
      c = function(k) {
        return optsToQs[k] || k;
      };
      for (k in opts) {
        if (!__hasProp.call(opts, k)) continue;
        v = opts[k];
        if (__indexOf.call(qsParams, k) < 0) continue;
        if (Query.typeIgnoresParam(k, opts.type)) continue;
        qs_[c(k)] = v;
      }
      return qs_;
    };

    Query.doRequest = function(opts, cb) {
      var id, qs_, simple, type, url;
      qs_ = qs.stringify(Query.generateQs(opts));
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

    Query.typeIgnoresParam = function(p, type) {
      return __indexOf.call(ignoredParams[type] || [], p) >= 0;
    };

    Query.prototype.ignoresParam = function(p) {
      return Query.typeIgnoresParam(p, this.opts.type);
    };

    Query.prototype.run = function(cb) {
      var entries, go, maxLen, startAt,
        _this = this;
      cb = _.bind(cb, this);
      if (this.opts.all && !this.ignoresParam('all')) {
        entries = [];
        maxLen = this.opts.results = this.opts.results || 50;
        startAt = this.opts.startAt = this.opts.startAt || 1;
        go = function(opts) {
          return Query.doRequest(opts, function(err, data) {
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
              opts.startAt = startAt += maxLen;
              return go(opts);
            }
          });
        };
        go(this.opts);
      } else {
        Query.doRequest(this.opts, cb);
      }
      return this;
    };

    return Query;

  })(EventEmitter);

  module.exports = Query;

}).call(this);
