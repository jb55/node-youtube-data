
var _ = require('underscore')._;

module.exports = AnalyticsQuery;

function AnalyticsQuery(opts) {
  this.opts = opts || {};
  this.data = opts.data || {};
}


/**
 * The unique YouTube channel id
 *
 * @param {Function} fn
 * @api public
 */
AnalyticsQuery.prototype.channel = function(cid) {
  this.data.ids = "channel==" + cid;
  return this;
}


/**
 * The start date for fetching YouTube Analytics data.
 *
 * @param {Date} start date
 * @api public
 */
AnalyticsQuery.prototype.startDate = function(d) {
  this.data["start-date"] = d;
  return this;
}


/**
 * The end date for fetching YouTube Analytics data.
 *
 * @param {Function} end date
 * @api public
 */
AnalyticsQuery.prototype.endDate = function(d) {
  this.data["end-date"] = d;
  return this;
}


/**
 * List of metrics to gather. See the list full list
 * [here](https://developers.google.com/youtube/analytics/v1/dimsmets/mets)
 *
 * @param {Array of String} array of metrics
 * @api public
 */
AnalyticsQuery.prototype.metrics = function(xs) {
  this.data["metrics"] = xs.join(",");
  return this;
}


/**
 * List of dimensions to gather. eg. ["ageGroup", "gender"]. Full list
 * [here](https://developers.google.com/youtube/analytics/v1/dimsmets/mets)
 *
 * @param {Array of String} array of dimensions
 * @api public
 */
AnalyticsQuery.prototype.dimensions = function(xs) {
  this.data["dimensions"] = xs.join(",");
  return this;
}


/**
 * Filters to apply when retrieving analytics data
 *
 * @example
 *
 *   .filter({
 *     video: 'dMH0bHeiRNg',
 *     country: 'IT'
 *   });
 *
 * @param {Object} array of dimensions
 * @api public
 */
AnalyticsQuery.prototype.filter = function(filters) {
  filters = _(filters).map(function (val, key) {
    return key + "==" + val;
  });
  this.data["filters"] = filters.join(";");
  return this;
}



/**
 * Filters to apply when retrieving analytics data
 *
 * @param {Object} keys and values to filter on
 * @api public
 */
AnalyticsQuery.prototype.filter = function(filters) {
  filters = _(filters).map(function (val, key) {
    return key + "==" + val;
  });
  this.data["filters"] = filters.join(";");
  return this;
}



/**
 * The maximum number of rows to include in the response.
 *
 * @param {Integer} 1+
 * @api public
 */
AnalyticsQuery.prototype.maxResults = function(max) {
  this.data["max-results"] = max;
  return this;
}



/**
 * The maximum number of rows to include in the response.
 *
 * @param {Integer} 1+
 * @api public
 */
AnalyticsQuery.prototype.maxResults = function(max) {
  this.data["max-results"] = max;
  return this;
}



/**
 * Sort on metrics or dimensions. Default sort order is ascending. Prefix string
 * with '-' to signify descending.
 *
 * @example
 *
 *   .sort(["-likes"])
 *
 * @param {Array} array of strings
 * @api public
 */
AnalyticsQuery.prototype.sort = function(max) {
  this.data["max-results"] = max;
  return this;
}



/**
 * An index of the first entity to retrieve. Use this parameter as a pagination
 * mechanism along with the max-results parameter (one-based, inclusive).
 *
 * @param {Integer} 1+
 * @api public
 */
AnalyticsQuery.prototype.startIndex = function(i) {
  this.data["start-index"] = i;
  return this;
}



/**
 * Select what fields to return
 *
 * @example
 *
 *   .fields(["kind", "columnHeaders(columnType,dataType)"])
 *
 * @param {Array} 1+
 * @api public
 */
AnalyticsQuery.prototype.fields = function(xs) {
  this.data["fields"] = xs.join(",");
  return this;
}



