
var qs      = require('querystring');
var _       = require('underscore')._;
var request = require('request');
var fmt     = require('./formatting');
var util    = require('util');

var EventEmitter = require('events').EventEmitter;

var optsToQs = {
  results: "max-results",
  startAt: "start-index"
  categories: "category"
};
var qsParams = ["results", "orderby", "author", "startAt", "category"];
var typeParams = {
  users: ["results", "author", "orderby", "startAt", "all"]
};

function Query(opts) {
  this.opts = opts || {};
}

util.inherits(Query, EventEmitter);

Query["new"] = function() {
  return new Query();
};

Query.prototype.results = function(r) {
  var maxResults = r;
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

Query.prototype.category = function(category) {
  if (_.isArray(category)) category = category.join(" ");
  this.opts.category = category;
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

Query.prototype.channels = function(id) {
  this.type("channels");
  return this;
};

Query.prototype.comments = function(id) {
  this.type("videos");
  this.opts.id = "" + id + "/comments";
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

Query.prototype.url = function() {
  return Query.url(this.opts);
};

Query.url = function(opts) {
  var type = opts.type;
  var qs_ = qs.stringify(Query.generateQs(opts));
  var id = opts.id ? "/" + opts.id : "";
  return url = "http://gdata.youtube.com/feeds/api/" + type + id + "?" + qs_;
};

Query.generateQs = function(opts) {
  var qs_ = { alt: 'json', v: 2 };
  var c = function(k) { return optsToQs[k] || k; };
  var notIn = function(xs, x) { return qsParams.indexOf(x) < 0; };

  _.each(opts, function(v, k) {
    if (notIn(qsParams, k)) return;
    if (Query.typeIgnoresParam(k, opts.type)) return;
    qs_[c(k)] = v;
  });

  return qs_;
};

Query.doRequest = function(opts, cb) {
  var qs_ = qs.stringify(Query.generateQs(opts));
  var type = opts.type;
  var simple = opts.simple;

  if (!type)
    return cb("Query type not selected. eg. query.videos('author')");

  var id = opts.id ? "/" + opts.id : "";
  var url = "http://gdata.youtube.com/feeds/api/" + type + id + "?" + qs_;

  return request(url, function(err, res, body) {
    var json;
    if (err) return cb(err);

    try { json = JSON.parse(body); }
    catch (e) { return cb(e); }

    if (simple && type === 'videos')
      json.feed.entry = _.map(json.feed.entry, fmt.video.entry.simple);

    return cb(null, json);
  });
};

Query.typeIgnoresParam = function(p, type) {
  return (typeParams[type] || []).indexOf(p) >= 0;
};

Query.prototype.ignoresParam = function(p) {
  return Query.typeIgnoresParam(p, this.opts.type);
};

Query.prototype.run = function(cb) {
  var self = this;
  cb = _.bind(cb, this);

  if (this.opts.all && !this.ignoresParam('all')) {
    var entries = [];
    var maxLen = this.opts.results = this.opts.results || 50;
    var startAt = this.opts.startAt = this.opts.startAt || 1;

    var go = function(opts) {
      return Query.doRequest(opts, function(err, data) {
        if (err) return cb(err);
        self.emit('result', data);

        var entry = data.feed.entry;
        var numEntries = entry.length;

        _.each(data.feed.entry, function(entry){
          entries.push(entry);
        });

        if (numEntries === 0 || numEntries < maxLen) {
          data.feed.entry = entries;
          return cb(null, data);
        } 
        else {
          opts.startAt = startAt += maxLen;
          return go(opts);
        }
      });
    };

    go(this.opts);
  } 
  else {
    Query.doRequest(this.opts, cb);
  }

  return this;
};

module.exports = Query;
