request = require 'request'
qs = require 'querystring'
_ = require('underscore')._
query = require './query'

class YoutubeData
  constructor: (opts={}) ->
    @request()

YoutubeData::request = ->
  @method = 'request'
  @

YoutubeData.init = (opts) ->
  new YoutubeData opts

YoutubeData::query = ->
  query.new()

YoutubeData::channel = (chan, opts, cb) ->
  if _.isFunction opts
    cb = opts
    opts = {}

  defaultOpts =
    author: chan
    alt: 'json'
    v: 2

  opts = _.extend defaultOpts, opts

  maxResults = opts["max-results"] or opts.maxresults
  maxResults = 50 if maxResults > 50
  opts["max-results"] = maxResults

  qs_ = qs.stringify opts
  url = "http://gdata.youtube.com/feeds/api/videos?" + qs_

  request url, (err, res, body) ->
    return cb err if err
    try
      json = JSON.parse body
    catch e
      return cb(e)
    return cb null, json

module.exports = YoutubeData
