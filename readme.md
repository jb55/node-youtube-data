node-youtube-data
=================

Get data from YouTube as JSON

Examples
--------

```js
var yt = require('youtube-data')

yt.query()
  .videos('monstercatmedia')
  .results(50)
  .orderByPublished()
  .simple()
  .run(function(err, data){
    if (err) console.log(err)
    console.log(data.feed.entry)
  })
```

Work in progress
----------------

I have only implemented the bare minimum, the api will expand with time and pull
requests ;)



