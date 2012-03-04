qs               = require 'querystring'
{ _ }            = require('underscore')
request          = require 'request'
fmt              = require './formatting'
{ EventEmitter } = require 'events'

class Query extends EventEmitter
  @new = () ->
    return new Query

  constructor: (opts={}) ->
    @qs = opts.qs or {}
    @opts = {}

  results: (r) ->
    maxResults = r
    maxResults = 50 if @maxResults > 50
    @qs["max-results"] = maxResults
    @

  orderByViewCount: () ->
    @orderBy('viewCount')
    @

  orderByPublished: () ->
    @orderBy('published')
    @

  orderByRelevance: () ->
    @orderBy('relevance')
    @

  orderBy: (ordering) ->
    @qs.orderby = ordering
    @

  page: (page) ->
    @opts.page = page
    @opts.page = 1 if @p
    @

  pages: (start, end) ->
    @opts.start = start
    @opts.end = end
    @

  all: (all=true) ->
    @opts.all = all
    @

  startAt: (ind) ->
    @qs["start-index"] = ind
    @

  author: (author) ->
    @qs.author = author
    @

  type: (type) ->
    @opts.type = type
    @

  videos: (author) ->
    @type("videos")
    @author(author) if author
    @

  simple: (simple=true) ->
    @opts.simple = simple
    @

  @generateQs: (qs_) ->
    defaultOpts =
      alt: 'json'
      v: 2

    _.extend defaultOpts, qs_

    return defaultOpts

  @doRequest: (querystring, opts, cb) ->
    qs_ = qs.stringify Query.generateQs(querystring)
    { type, simple } = opts

    unless type
      return cb "Query type not selected. eg. query.videos('author')"

    url = "http://gdata.youtube.com/feeds/api/#{ type }?#{ qs_ }"

    request url, (err, res, body) ->
      return cb err if err
      try
        json = JSON.parse body
      catch e
        return cb(e)

      if simple and type is 'videos'
        json.feed.entry = _.map json.feed.entry, fmt.video.entry.simple

      return cb null, json

  run: (cb) ->

    if @opts.all
      entries = []
      maxLen = @qs["max-length"] = @qs["max-length"] or 50
      startAt = @qs["start-index"] = @qs["start-index"] or 1

      go = (qs_) =>
        Query.doRequest qs_, @opts, (err, data) =>
          return cb err if err
          @emit 'result', data

          numEntries = data.feed.entry.length

          for entry in data.feed.entry
            entries.push entry

          # we got less then expected, that must mean there are no more after
          # this page
          if numEntries is 0 or (maxLen and numEntries < maxLen)
            data.feed.entry = entries
            return cb null, data
          else
            qs_["start-index"] = startAt += maxLen
            go qs_

      go @qs
    else
      Query.doRequest @qs, @opts, cb

    @


module.exports = Query
