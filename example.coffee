yt = require('./lib/index')
_ = require('underscore')._

q = yt.query()
      .videos('monstercatmedia')
      .results(50)
      .orderByPublished()
      .all()
      .simple()
      .run (err, data) ->
        return console.log data, err if err

q.on 'result', (data) ->
  num = data.feed.entry.length
  console.log "Got results, #{ num } entries"

