(function() {
  var Query, fmt, qs, request, _;

  qs = require('querystring');

  _ = require('underscore')._;

  request = require('request');

  fmt = require('./formatting');

  Query = (function() {

    Query["new"] = function() {
      return new Query;
    };

    function Query(opts) {
      if (opts == null) opts = {};
      this.qs = opts.qs || {};
      this.opts = {};
      this.pagination = {};
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
      this.pagination.page = page;
      if (this.p) this.pagination.page = 1;
      return this;
    };

    Query.prototype.pages = function(start, end) {
      this.pagination.start = start;
      this.pagination.end = end;
      return this;
    };

    Query.prototype.all = function(all) {
      if (all == null) all = true;
      this.pagination.all = all;
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

    Query.prototype.generateQs = function() {
      var defaultOpts;
      defaultOpts = {
        alt: 'json',
        v: 2
      };
      _.extend(defaultOpts, this.qs);
      return defaultOpts;
    };

    Query.prototype.run = function(cb) {
      var qs_, simple, type, url, _ref;
      qs_ = qs.stringify(this.generateQs());
      _ref = this.opts, type = _ref.type, simple = _ref.simple;
      if (!type) return cb("Query type not selected. eg. query.videos('author')");
      url = "http://gdata.youtube.com/feeds/api/" + type + "?" + qs_;
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

    return Query;

  })();

  module.exports = Query;

}).call(this);
