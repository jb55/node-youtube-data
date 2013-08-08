
var _ = require('underscore')._;
var fmt = module.exports;
var video = fmt.video = {};

video.entry = {};

video.entry.simple = function(entry) {
  return {
    title: entry.title.$t,
    rating: _.extend(entry.gd$rating, entry.yt$rating, entry.yt$statistics),
    id: _.last(entry.id.$t.split(':'))
  };
};
