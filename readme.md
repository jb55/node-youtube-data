# node-youtube-data

Get data from YouTube

[![build status](https://secure.travis-ci.org/jb55/node-youtube-data.png)](http://travis-ci.org/jb55/node-youtube-data)

## Examples

```js
var yt = require('youtube-data')
var token = process.env.OAUTH_TOKEN

yt.query()
  .oauth(token)
  .videos('monstercatmedia')
  .results(50)
  .orderByPublished()
  .simple()
  .run(function(err, data){
    if (err) console.log(err)
    console.log(data.feed.entry)
  })
```

## Methods

### .oauth(token)

Authenticate a request with an oauth access token.

Adds `Authentication: Bearer {token}` to request headers

### ...

More documentation to follow

## Work in progress

I have only implemented the bare minimum, the api will expand with time and pull
requests ;)


