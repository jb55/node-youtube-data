
var test = require('tape');
var yt = require('../lib');
var fmt = require('../lib/formatting');

test(function (t) {
  t.plan(6);

  var expectedEntries = 50;
  var maxPerReq = 50;
  var requests = 0;

  var query =
    yt.data()
      .videos('monstercatmedia')
      .results(expectedEntries + 2)
      .orderByPublished()
      .run(go);

  query.on('result', function() { requests++; });

  function go(err, data) {
    t.notOk(err, "no error");

    var expectedReqs = Math.ceil(expectedEntries / maxPerReq);
    var entries = data.feed.entry;
    var entry = entries[0];
    var simple = fmt.video.entry.simple(entry);

    t.equal(requests, expectedReqs, "number of requests");
    t.equal(entries.length, expectedEntries, "equal results");
    t.equal(simple.title, entry.title.$t, "parser titles");
    t.ok('numLikes' in simple.rating, "numLikes in rating");
    t.ok('viewCount' in simple.rating, "viewCount in rating");
  }
});

