(function() {
  var YoutubeData, request, sax;

  request = require('request');

  sax = require('sax');

  YoutubeData = (function() {

    function YoutubeData(opts) {
      var parser, strict;
      if (opts == null) opts = {};
      strict = true;
      this.request();
      parser = opts.parser || {};
      parser.makeParser = parser.makeParser || function() {
        return sax.parser(strict);
      };
      parser.makeStream = parser.makeStream || function() {
        return sax.createStream(strict);
      };
      parser.parse = parser.parse || function(p, d) {
        return p.write(d);
      };
      parser.close = parser.close || function(p) {
        return p.close;
      };
      parser.onopen = parser.onopen || function(p, cb) {
        return p.on('opentag', cb);
      };
      parser.ontext = parser.ontext || function(p, cb) {
        return p.on('text', cb);
      };
      parser.onclose = parser.onclose || function(p, cb) {
        return p.on('closetag', cb);
      };
      parser.onend = parser.onend || function(p, cb) {
        return p.on('end', cb);
      };
      parser.onerror = parser.onerror || function(p, cb) {
        return p.on('error', cb);
      };
      this.parser = parser;
    }

    return YoutubeData;

  })();

  YoutubeData.prototype.channelParser = function(parser, cb) {
    var context, data, entry, isIn, mkEntry, nodeStack;
    mkEntry = function() {
      return {
        terms: [],
        group: {}
      };
    };
    data = {
      entries: []
    };
    entry = mkEntry();
    nodeStack = [];
    context = function(numAbove) {
      var top;
      if (numAbove == null) numAbove = 1;
      top = nodeStack.length - 1;
      return nodeStack[top - numAbove];
    };
    isIn = function(n, numAbove) {
      if (numAbove == null) numAbove = 1;
      return context(numAbove) === n;
    };
    this.parser.onopen(parser, function(node) {
      var attributes, name;
      name = node.name, attributes = node.attributes;
      nodeStack.push(name);
      if (isIn('entry')) {
        switch (name) {
          case 'category':
            return entry.terms.push(attributes.term);
          case 'yt:statistics':
            return entry.stats = attributes;
          case 'gd:rating':
            entry.rating = attributes;
            return delete entry.rating.rel;
        }
      }
    });
    this.parser.ontext(parser, function(t) {
      var name;
      if (isIn('entry')) {
        name = context(0);
        return entry[name] = t;
      }
    });
    this.parser.onclose(parser, function(tag) {
      nodeStack.pop();
      switch (tag) {
        case 'entry':
          data.entries.push(entry);
          return entry = mkEntry();
      }
    });
    this.parser.onend(parser, function() {
      return cb(null, data);
    });
    this.parser.onerror(parser, function(err) {
      return cb(err);
    });
    return parser;
  };

  YoutubeData.prototype.request = function() {
    this.method = 'request';
    return this;
  };

  YoutubeData.prototype.stream = function() {
    this.method = 'stream';
    return this;
  };

  YoutubeData.prototype.xml = function() {
    this.method = 'data';
    return this;
  };

  YoutubeData.prototype.makeParser = function() {
    if (this.method === 'request' || this.method === 'stream') {
      return this.parser.makeStream();
    } else {
      return this.parser.makeParser();
    }
  };

  YoutubeData.init = function(opts) {
    return new YoutubeData(opts);
  };

  YoutubeData.prototype.channel = function(obj, cb) {
    var parser, url;
    parser = this.makeParser();
    parser = this.channelParser(parser, cb);
    if (this.method === 'data') {
      this.parser.parse(parser, obj);
      this.parser.close(parser);
    } else if (this.method === 'request') {
      url = 'http://gdata.youtube.com/feeds/api/videos?author=' + obj;
      request(url).pipe(parser);
    }
    return parser;
  };

  module.exports = YoutubeData;

}).call(this);
