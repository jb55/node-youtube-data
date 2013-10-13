
var DataQuery = require('./data');
var Query = require('./query');
var AnalyticsQuery = require('./analytics');
var OAuth2Client = require('googleapis').OAuth2Client;
var yt = {};

yt.data = DataQuery;
yt.query = Query;
yt.analytics = AnalyticsQuery;
yt.OAuth2Client = OAuth2Client;

module.exports = yt;
