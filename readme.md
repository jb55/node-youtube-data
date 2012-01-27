node-youtube-data
=================

Get data from YouTube as JSON

Examples
--------

Direct request

```coffeescript
yt = require('youtube-data').init()

yt.channel 'monstercatmedia', (err, data) ->
  for entry in data.entries
    console.log entry.title
    console.log '\t', entry.stats
    console.log '\t', entry.rating
```

Parse the xml directly

```coffeescript
yt.xml().channel channelXml, (err, data) ->
  console.log "parsed data" unless err
```

Work in progress
----------------

I have only implemented the bare minimum, the api will expand with time and pull
requests ;)



