qs = require 'querystring'
_  = require('underscore')._
request = require 'request'
fmt = require './formatting'

class Query
  @new = () ->
    return new Query

  constructor: (opts={}) ->
    @qs = opts.qs or {}
    @opts = {}
    @pagination = {}

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
    @pagination.page = page
    @pagination.page = 1 if @p
    @

  pages: (start, end) ->
    @pagination.start = start
    @pagination.end = end
    @

  all: (all=true) ->
    @pagination.all = all
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

  generateQs: ->
    defaultOpts =
      alt: 'json'
      v: 2

    _.extend defaultOpts, @qs

    return defaultOpts

  run: (cb) ->
    qs_ = qs.stringify @generateQs()
    { type, simple } = @opts

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

module.exports = Query
