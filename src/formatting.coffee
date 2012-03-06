
_ = require('underscore')._

fmt = module.exports
video = fmt.video = {}
video.entry = {}

ext = (objs...) ->
  start = {}
  for obj in objs
    _.extend start, obj
  return start

video.entry.simple = (entry) ->
  title: entry.title.$t
  rating: ext entry.gd$rating, entry.yt$rating, entry.yt$statistics
  id: _.last entry.id.$t.split(':')

