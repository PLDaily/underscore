(function() {
  var root = this;

  var _ = function(obj) {
    if(obj instanceof _) return obj;
    if(!(this instanceof _)) return new _(obj);
  }

  if(typeof exports !== 'undefined') {
    module.exports = _;
  }else {
    root._ = _;
  }

  function abc() {
    console.log(arguments);
    console.log(Object.prototype.toString.call(arguments));
  }

  abc(1, 2, 3);

  var optimizeCb = function(func, context, argCount) {
    return function(value, index, collection) {
      return func.call(context, value, index, collection);
    }
  }

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    }
  }


  var getLength = property('length');
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;


  var isArrayLike = function(collection) {
    var length = getLength(collection);
  }

  _.each = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context)
    var i, length;

    if(isArrayLike(obj)) {
      for(i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    }else {
      var keys = _.keys(obj);
      for(i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    }
  }


  if(typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    })
  }

}.call(this))