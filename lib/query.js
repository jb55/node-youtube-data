
var gapi = require('googleapis');
var parseJSON = require('safe-json-parse');
var avar = require('avar');
var debug = require('debug')('query');
var OAuth2Client = gapi.OAuth2Client;

module.exports = Query;

function Query(query, opts) {
  if (!(this instanceof Query))
    return new Query(query, opts);
  debug("namespace '%s'", query.namespace);
  debug("version '%s'", query.version);
  this.opts = opts || {};
  this.query = query;
}

Query.api = avar(gapi
  .discover('youtubeAnalytics', 'v1')
  .discover('youtube', 'v3')
  .execute
  .bind(gapi));


Query.prototype.all = function(all) {
  if (all == null) all = true;
  this.opts.all = all;
  return this;
};


Query.prototype.run = function(done) {
  var self = this;
  Query.api.get(function (err, client) {
    if (err) return done(err);
    var req = self.query.path(client);
    if (self.opts.oauth) req.withAuthClient(self.opts.oauth);
    req.execute(function (err, response) {
      done(err, response);
    });
  });
};


Query.prototype.oauth = function(client) {
  if (client == null) return this.opts.oauth;
  this.opts.oauth = client;
  return this;
};

