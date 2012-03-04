(function() {
  var ext, fmt, video, _,
    __slice = Array.prototype.slice;

  _ = require('underscore')._;

  fmt = module.exports;

  video = fmt.video = {};

  video.entry = {};

  ext = function() {
    var obj, objs, start, _i, _len;
    objs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    start = {};
    for (_i = 0, _len = objs.length; _i < _len; _i++) {
      obj = objs[_i];
      _.extend(start, obj);
    }
    return start;
  };

  video.entry.simple = function(entry) {
    return {
      title: entry.title.$t,
      rating: ext(entry.gd$rating, entry.yt$rating, entry.yt$statistics)
    };
  };

}).call(this);
