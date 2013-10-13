
var qs        = require('querystring');
var _         = require('underscore')._;
var request   = require('request');
var parseJSON = require('safe-json-parse');
var fmt       = require('./formatting');
var util      = require('util');

var EventEmitter = require('events').EventEmitter;

var optsToQs = {
  results: "max-results",
  startAt: "start-index",
  categories: "category"
};

var qsParams = ["results", "orderby", "author", "startAt", "category"];
var typeParams = {
  users: ["results", "author", "orderby", "startAt", "all"]
};

function DataQuery(opts) {
  if (!(this instanceof DataQuery)) return new DataQuery(opts);
  EventEmitter.call(this);
  this.opts = opts || {};
}

DataQuery.namespace = "youtube";
DataQuery.version = "v3";

util.inherits(DataQuery, EventEmitter);

DataQuery.prototype.results = function(r) {
  if (r > 50) r = 50;
  this.opts.results = r;
  return this;
};


DataQuery.prototype.orderByViewCount = function() {
  this.orderBy('viewCount');
  return this;
};


DataQuery.prototype.orderByPublished = function() {
  this.orderBy('published');
  return this;
};


DataQuery.prototype.orderByRelevance = function() {
  this.orderBy('relevance');
  return this;
};


DataQuery.prototype.orderBy = function(ordering) {
  this.opts.orderby = ordering;
  return this;
};

DataQuery.prototype.category = function(category) {
  if (_.isArray(category)) category = category.join(" ");
  this.opts.category = category;
  return this;
};

DataQuery.prototype.author = function(author) {
  if (!author) return this.opts.author;
  this.opts.author = author;
  return this;
};

DataQuery.prototype.type = function(type) {
  this.opts.type = type;
  return this;
};

DataQuery.prototype.user = function(user) {
  this.type("users");
  this.opts.id = user;
  return this;
};

DataQuery.prototype.responses = function(id) {
  this.type("videos");
  this.opts.id = "" + id + "/responses";
  return this;
};

DataQuery.prototype.channels = function(id) {
  this.type("channels");
  return this;
};

DataQuery.prototype.comments = function(id) {
  this.type("videos");
  this.opts.id = "" + id + "/comments";
  return this;
};

DataQuery.prototype.req = function(req) {
  this.opts.v3req = req;
};

DataQuery.prototype.requestMod = function(fn) {
  (this.opts.requestMods = this.opts.requestMods || []).push(fn);
  return this;
};

DataQuery.prototype.oauth = function(token) {
  this.requestMod(function(opts){
    opts.headers = opts.headers || {};
    opts.headers.Authorization = "Bearer " + token;
  });
  return this;
};

DataQuery.prototype.videos = function(author) {
  this.type("videos");
  if (author) this.author(author);
  return this;
};

DataQuery.prototype.simple = function(simple) {
  if (simple == null) simple = true;
  this.opts.simple = simple;
  return this;
};

DataQuery.prototype.url = function() {
  return DataQuery.url(this.opts);
};

DataQuery.url = function(opts) {
  var type = opts.type;
  var qs_ = qs.stringify(DataQuery.generateQs(opts));
  var id = opts.id ? "/" + opts.id : "";
  return "http://gdata.youtube.com/feeds/api/" + type + id + "?" + qs_;
};

DataQuery.generateQs = function(opts) {
  var qs_ = { alt: 'json', v: 2 };
  var c = function(k) { return optsToQs[k] || k; };
  var notIn = function(xs, x) { return qsParams.indexOf(x) < 0; };

  _.each(opts, function(v, k) {
    if (notIn(qsParams, k)) return;
    if (DataQuery.typeIgnoresParam(k, opts.type)) return;
    qs_[c(k)] = v;
  });

  return qs_;
};

DataQuery.v3req = function(opts, cb) {
  var req = opts.v3req;
  var url = 'https://www.googleapis.com/youtube/v3/' + req.route;
  var reqOpts = DataQuery.reqOpts(opts, url);

  reqOpts.method = req.method || 'GET';
  reqOpts.form = req.data;

  return request(reqOpts, function(err, res, body) {
    if (err) return cb(err);

    parseJSON(body, function (err, json) {
      if (json && json.errors != null) return cb(json);
      return cb(null, json);
    });

  });
};

DataQuery.reqOpts = function(opts, url) {
  var reqOpts = { url: url };

  _.each(opts.requestMods || [], function(mod){
    mod(reqOpts);
  });

  return reqOpts;
};

DataQuery.req = function(opts, cb) {
  var qs_ = qs.stringify(DataQuery.generateQs(opts));
  var type = opts.type;
  var simple = opts.simple;

  if (opts.v3req) return DataQuery.v3req(opts, cb);

  if (!type)
    return cb("DataQuery type not selected. eg. query.videos('author')");

  var id = opts.id ? "/" + opts.id : "";
  var url = "http://gdata.youtube.com/feeds/api/" + type + id + "?" + qs_;
  var reqOpts = DataQuery.reqOpts(opts, url);

  return request(reqOpts, function(err, res, body) {
    var json;
    if (err) return cb(err);

    try { json = JSON.parse(body); }
    catch (e) { return cb(e); }

    if (simple && type === 'videos')
      json.feed.entry = _.map(json.feed.entry, fmt.video.entry.simple);

    return cb(null, json);
  });
};

DataQuery.typeIgnoresParam = function(p, type) {
  return (typeParams[type] || []).indexOf(p) >= 0;
};

DataQuery.prototype.ignoresParam = function(p) {
  return DataQuery.typeIgnoresParam(p, this.opts.type);
};

DataQuery.prototype.run = function(cb) {
  var self = this;
  cb = _.bind(cb, this);

  if (this.opts.all && !this.ignoresParam('all')) {
    var entries = [];
    var maxLen = this.opts.results = this.opts.results || 50;
    var startAt = this.opts.startAt = this.opts.startAt || 1;

    var go = function(opts) {
      return DataQuery.req(opts, function(err, data) {
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
    DataQuery.req(this.opts, function(err, data){
      if (err) return cb(err, data);
      self.emit("result", data);
      cb(err, data);
    });
  }

  return this;
};

var extendy = {
  method: function (name, fn) {
    DataQuery.prototype[name] = function () {
      var xs = 1 <= arguments.length? [].slice.call(arguments, 0) : [];
      fn.apply(this, xs);
      return this;
    };
  }
};

// rating methods
require('./rating')(extendy, DataQuery);

module.exports = DataQuery;
