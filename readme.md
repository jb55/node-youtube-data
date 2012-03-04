node-youtube-data
=================

Get data from YouTube as JSON

Examples
--------

```coffeescript
yt = require('youtube-data')
_ = require('underscore')._

yt.query()
  .videos('monstercatmedia')
  .results(50)
  .orderByPublished()
  .simple()
  .run (err, data) ->
    return console.log err if err

    console.log data.feed.entry
```

Work in progress
----------------

I have only implemented the bare minimum, the api will expand with time and pull
requests ;)



