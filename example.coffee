yt = require('./lib/index').init()
_ = require('underscore')._

yt.query()
  .videos('monstercatmedia')
  .results(50)
  .orderByPublished()
  .simple()
  .run (err, data) ->
    return console.log err if err

    console.log data.feed.entry


