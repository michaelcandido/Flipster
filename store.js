
 /**
  * An abstraction of the underlying data store for the model. Can be
  * easily switched out by implementing 4 functions: createFlip,
  * exists, getFlip, and updateFlip.
  */

// Flip objects define an interface for passing data between the store
// and model.
function Flip(title, threshold, result, watcherCount) {
  this.title = title;
  this.threshold = threshold;
  this.result = result !== undefined ? result : null;
  this.watcherCount = watcherCount !== undefined ? watcherCount : 0;
  Object.freeze(this);
}

Flip.prototype.replace = function (props) {
  var f = (function (self) {
    return function (prop) { return prop in props ? props[prop] : self[prop]; };
  })(this); // sorry

  return new Flip(f('title'), f('threshold'), f('result'), f('watcherCount'));
};

// for this demo, we use a simple associative array store

exports.Store = function () {
  var DEFAULT_TITLE = 'Impromptu Coin Flip';

  var flips = {}, flipCounter = 0;

  /**
   * Initializes a new flip, stores it, and returns an fid to refer to it.
   */
  this.createFlip = function (title, threshold) {
    var fid = ++flipCounter;
    flips[fid] = new Flip(title ? title : DEFAULT_TITLE, threshold);
    return fid;
  };

  /**
   * Returns true if a flip with the given fid exists, false
   * otherwise.
   */
  this.exists = function (fid) {
    return fid in flips;
  };

  /**
   * Returns a Flip object representing the flip with the given
   * fid. Calling with an invalid fid will result in undefined
   * behavior.
   */
  this.getFlip = function (fid) {
    return flips[fid];    
  };

  /**
   * Updates the flip corresponding to the given fid with the data in
   * the given record (a Flip object). Returns the new record.
   */
  this.updateFlip = function (fid, record) {
    flips[fid] = record;
    return record;
  };
};
