qs      = require('querystring')
{ _ }   = require('underscore')
request = require('request')
fmt     = require('./formatting')
async   = require('async')

{ EventEmitter } = require 'events'

class Query extends EventEmitter
  @new = () ->
    return new Query

  optsToQs =
    results: "max-results"
    startAt: "start-index"
    categories: "category"

  qsParams = ["results", "orderby", "author", "startAt"]

  ignoredParams =
    users: ["results", "author", "orderby", "startAt", "all"]

  constructor: (opts={}) ->
    @opts = {}

  results: (r) ->
    maxResults = r
    maxResults = 50 if @maxResults > 50
    @opts.results = maxResults
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
    @opts.orderby = ordering
    @

  category: (category) ->
    @opts.category = category
    @

  categories: (categories) ->
    @opts.categories = categories.join(" ")
    @

  all: (all=true) ->
    @opts.all = all
    @

  startAt: (ind) ->
    @opts.startAt = ind
    @

  author: (author) ->
    return @opts.author unless author
    @opts.author = author
    @

  type: (type) ->
    @opts.type = type
    @

  user: (user) ->
    @type("users")
    @opts.id = user
    @

  responses: (id) ->
    @type("videos")
    @opts.id = "#{ id }/responses"
    @

  comments: (id) ->
    @type("videos")
    @opts.id = "#{ id }/comments"
    @

  videos: (author) ->
    @type("videos")
    @author(author) if author
    @

  simple: (simple=true) ->
    @opts.simple = simple
    @

  @generateQs: (opts) ->
    qs_ =
      alt: 'json'
      v: 2

    c = (k) -> optsToQs[k] or k

    for own k, v of opts
      continue if k not in qsParams
      continue if Query.typeIgnoresParam k, opts.type
      qs_[c k] = v

    qs_

  @doRequest: (opts, cb) ->
    qs_ = qs.stringify Query.generateQs(opts)
    { type, simple } = opts

    unless type
      return cb "Query type not selected. eg. query.videos('author')"

    id = if opts.id then "/#{ opts.id }" else ""
    url = "http://gdata.youtube.com/feeds/api/#{ type }#{ id }?#{ qs_ }"

    request url, (err, res, body) ->
      return cb err if err
      try
        json = JSON.parse body
      catch e
        return cb e, body

      if simple and type is 'videos'
        json.feed.entry = _.map json.feed.entry, fmt.video.entry.simple

      return cb null, json

  @typeIgnoresParam: (p, type) -> p in (ignoredParams[type] or [])
  ignoresParam: (p) -> Query.typeIgnoresParam p, @opts.type

  run: (cb) ->
    cb = _.bind cb, @

    if @opts.all and not @ignoresParam 'all'
      entries = []
      maxLen = @opts.results = @opts.results or 50
      startAt = @opts.startAt = @opts.startAt or 1

      go = (opts) =>
        Query.doRequest opts, (err, data) =>
          return cb err, data if err
          @emit 'result', data

          numEntries = data.feed.entry.length

          for entry in data.feed.entry
            entries.push entry

          # we got less then expected, that must mean there are no more after
          # this page
          if numEntries is 0 or numEntries < maxLen
            data.feed.entry = entries
            return cb null, data
          else
            opts.startAt = startAt += maxLen
            go opts

      go @opts
    else
      Query.doRequest @opts, cb

    @


module.exports = Query
