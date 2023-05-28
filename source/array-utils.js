"use strict";

(function (global) {

  function ArrayUtils() { }

  ArrayUtils.shuffle = function(arr) {
    var i, r, tmp;
    for (i = 0; i < arr.length; i++) {
      r = Math.floor(Math.random() * arr.length);
      tmp = arr[r];
      arr[r] = arr[i];
      arr[i] = tmp;
    }
  };

  ArrayUtils.pop = function(arr, n) {
    var i, result = [];
    n = Math.min(n, arr.length);
    for (i = 0; i < n; i++) {
      result.push(arr.pop());
    }
    return result;
  };

  ArrayUtils.count = function(arr, key, value) {
    var i;
    var result = 0;
    for (i = 0; i < arr.length; i++) {
      if (arr[i][key] === value) {
        result += 1;
      }
    }
    return result;
  };

  ArrayUtils.find = function(arr, key, value) {
    var i;
    for (i = 0; i < arr.length; i++) {
      if (arr[i][key] === value) {
        return arr[i];
      }
    }
    return null;
  };

  global.ArrayUtils = ArrayUtils;

}(typeof module !== 'undefined' ? module.exports : new Function('return this;')()));
