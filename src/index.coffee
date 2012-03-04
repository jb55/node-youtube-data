request = require 'request'
qs = require 'querystring'
_ = require('underscore')._
query = require './query'

yt = {}

yt.query = ->
  query.new()

module.exports = yt
