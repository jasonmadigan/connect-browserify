// Generated by CoffeeScript 1.6.2
(function() {
  var Q, browserify, dirname, extend, fs, join, relative, relativize, resolve, shim, _ref;

  _ref = require('path'), dirname = _ref.dirname, join = _ref.join, resolve = _ref.resolve, relative = _ref.relative;

  fs = require('fs');

  Q = require('kew');

  browserify = require('browserify');

  shim = require('browserify-shim');

  extend = require('xtend');

  relativize = function(entry, requirement, extensions) {
    var expose;

    expose = relative(dirname(entry), requirement);
    expose = expose.replace(/\.[a-z_\-]+$/, '');
    return "./" + expose;
  };

  exports.bundle = function(options) {
    var b, baseDir, expose, extension, k, promise, requirement, shims, transform, v, _i, _j, _k, _len, _len1, _len2, _ref1, _ref2, _ref3, _ref4;

    promise = Q.defer();
    baseDir = dirname(resolve(options.entry));
    b = browserify([options.entry]);
    if (options.extensions != null) {
      _ref1 = options.extensions;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        extension = _ref1[_i];
        b.extension(extension);
      }
    }
    if (options.shims != null) {
      shims = {};
      _ref2 = options.shims;
      for (k in _ref2) {
        v = _ref2[k];
        shims[k] = extend({}, v, {
          path: join(baseDir, v.path)
        });
      }
      b = shim(b, shims);
    }
    if (options.transforms != null) {
      _ref3 = options.transforms;
      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
        transform = _ref3[_j];
        b.transform(transform);
      }
    }
    if (options.requirements != null) {
      _ref4 = options.requirements;
      for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
        requirement = _ref4[_k];
        expose = relativize(options.entry, requirement);
        b.require(requirement, {
          expose: expose
        });
      }
    }
    b.bundle(options, function(err, result) {
      if (err) {
        return promise.reject(err);
      } else {
        return promise.resolve(result);
      }
    });
    return promise;
  };

  exports.serve = function(options) {
    var baseDir, contentType, extensions, isApp, render, rendered, watch;

    render = function() {
      return exports.bundle(options);
    };
    extensions = ['.js'].concat(options.extensions || []);
    isApp = RegExp("(" + (extensions.map(function(x) {
      return x.replace('.', '\\.');
    }).join('|')) + ")$");
    baseDir = dirname(resolve(options.entry));
    contentType = options.contentType || 'application/javascript';
    watch = options.watch === void 0 ? true : options.watch;
    rendered = render();
    if (watch) {
      fs.watch(baseDir, {
        persistent: false
      }, function(ev, filename) {
        if (isApp.test(filename)) {
          return rendered = render();
        }
      });
    }
    return function(req, res, next) {
      res.setHeader('Content-type', contentType);
      return rendered.then(function(result) {
        return res.end(result);
      }).fail(next);
    };
  };

}).call(this);

/*
//@ sourceMappingURL=index.map
*/