request = require 'request'
sax = require('sax')

class YoutubeData
  constructor: (opts={}) ->
    strict = true
    @request()
    parser = opts.parser or {}
    parser.makeParser = parser.makeParser or -> sax.parser strict
    parser.makeStream = parser.makeStream or -> sax.createStream strict
    parser.parse      = parser.parse   or (p, d)  -> p.write d
    parser.close      = parser.close   or (p)     -> p.close
    parser.onopen     = parser.onopen  or (p, cb) -> p.on 'opentag', cb
    parser.ontext     = parser.ontext  or (p, cb) -> p.on 'text', cb
    parser.onclose    = parser.onclose or (p, cb) -> p.on 'closetag', cb
    parser.onend      = parser.onend   or (p, cb) -> p.on 'end', cb
    parser.onerror    = parser.onerror or (p, cb) -> p.on 'error', cb
    @parser = parser

YoutubeData::channelParser = (parser, cb) ->
  mkEntry = ->
    terms: []
    group: {}
  data =
    entries: []
  entry = mkEntry()
  nodeStack = []

  context = (numAbove=1) ->
    top = nodeStack.length - 1
    nodeStack[top - numAbove]

  isIn = (n, numAbove=1) ->
    context(numAbove) is n

  @parser.onopen parser, (node) ->
    { name, attributes } = node
    nodeStack.push name

    if isIn 'entry'
      switch name
        when 'category'      then entry.terms.push(attributes.term)
        when 'yt:statistics' then entry.stats = attributes
        when 'gd:rating'
          entry.rating = attributes
          delete entry.rating.rel

  @parser.ontext parser, (t) ->
    if isIn 'entry'
      name = context 0
      entry[name] = t

  @parser.onclose parser, (tag) ->
    nodeStack.pop()
    switch tag
      when 'entry'
        data.entries.push(entry)
        entry = mkEntry()

  @parser.onend parser, -> cb(null, data)
  @parser.onerror parser, (err) -> cb(err)
  return parser

YoutubeData::request = ->
  @method = 'request'
  @

YoutubeData::stream = ->
  @method = 'stream'
  @

YoutubeData::xml = ->
  @method = 'data'
  @

YoutubeData::makeParser = ->
  if @method is 'request' or @method is 'stream'
    @parser.makeStream()
  else
    @parser.makeParser()

YoutubeData.init = (opts) ->
  new YoutubeData opts

YoutubeData::channel = (obj, cb) ->
  parser = @makeParser()
  parser = @channelParser parser, cb

  if @method is 'data'
    @parser.parse parser, obj
    @parser.close parser
  else if @method is 'request'
    url = 'http://gdata.youtube.com/feeds/api/videos?author=' + obj
    request(url).pipe(parser)

  return parser

module.exports = YoutubeData
