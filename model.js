
/**
 * A model of all the coin flips. Maintains the internal state of the app.
 */

var Store = require('./store').Store;
var singleton = null;

exports.get = function () {
  if (!singleton)
    singleton = new exports.Model;
  return singleton;
};

exports.Model = function () {
  var store = new Store;
  
  this.createFlip = store.createFlip;
  this.exists = store.exists;

  this.getTitle = function (fid) {
    return store.getFlip(fid).title;
  };

  this.getThreshold = function (fid) {
    return store.getFlip(fid).threshold;
  };

  this.getWatcherCount = function (fid) {
    var f = store.getFlip(fid);
    return f.watcherCount;
  };

  this.getResult = function (fid) {
    return store.getFlip(fid).result;
  };

  this.isReady = function (fid) {
    var f = store.getFlip(fid);
    return f.watcherCount >= f.threshold;
  };

  this.getRemaining = function (fid) {
    var f = store.getFlip(fid);
    return f.threshold - f.watcherCount;
  };

  this.incrementWatchers = function (fid) {
    var f = store.getFlip(fid);
    f = store.updateFlip(fid, f.replace({ watcherCount: f.watcherCount + 1 }));
    return f.watcherCount;
  };

  this.decrementWatchers = function (fid, watcher) {
    var f = store.getFlip(fid);
    f = store.updateFlip(fid, f.replace({ watcherCount: f.watcherCount - 1 }));
    return f.watcherCount;
  };

  this.performFlip = function (fid) {
    var f = store.getFlip(fid);
    f = store.updateFlip(fid, f.replace({ result: Math.random() >= 0.5 }));
    return f.result;
  };
};
