yt = require('../lib/index')
_ = require('underscore')._

accumEntry = (e1, e2) ->
  add = (fn) -> parseInt(fn(e1.rating)) + parseInt(fn(e2.rating))
  rating:
    numDislikes:   add (r) -> r.numDislikes
    numLikes:      add (r) -> r.numLikes
    favoriteCount: add (r) -> r.favoriteCount
    viewCount:     add (r) -> r.viewCount

buildMetrics = (author, subscribers, entries) ->
  { rating: { numDislikes
  , numLikes
  , favoriteCount
  , viewCount }} = _.reduce entries, accumEntry,
    rating:
      numDislikes: 0
      numLikes: 0
      favoriteCount: 0
      viewCount: 0

  [ author
  , numDislikes
  , numLikes
  , favoriteCount
  , viewCount
  , entries.length
  , subscribers
  ]

headers = [
    "channel"
  , "dislikes"
  , "likes"
  , "favorites"
  , "views"
  , "videos"
  , "subscribers"
]

console.log headers.join(", ")

q = yt.query()
      .videos('monstercatmedia')
      .results(50)
      .orderByPublished()
      .all()
      .simple()
      .run (err, videos) ->
        return console.log videos, err if err
        yt.query().user('monstercatmedia').run (err, user) ->
          return console.log user, err if err
          { subscriberCount } = user.entry.yt$statistics
          { entry } = videos.feed
          metrics = buildMetrics 'monstercatmedia', subscriberCount, entry
          console.log metrics.join(", ")


