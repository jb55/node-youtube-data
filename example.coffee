yt = require('./index').init()
_ = require('underscore')._

yt.channel 'monstercatmedia', opts, (err, data) ->
  return console.log err if err

# for entry in data.feed.entry
#   console.log entry

  for entry in transformed
    console.log entry

