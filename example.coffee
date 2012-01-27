yt = require('./index').init()

yt.channel 'monstercatmedia', (err, data) ->
  for entry in data.entries
    console.log entry.title
    console.log '\t', entry.stats
    console.log '\t', entry.rating

