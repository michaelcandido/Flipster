
var Model = require('../model').Model;

exports.tests = {
  setUp: function (done) {
    this.model = new Model;
    this.fid = this.model.createFlip('title', 10);
    done();
  },

  testCreateAndLookup: function (test) {
    test.equals('title', this.model.getTitle(this.fid));
    test.equals(10, this.model.getThreshold(this.fid));
    test.equals(0, this.model.getWatcherCount(this.fid));
    test.equals(null, this.model.getResult(this.fid));

    test.done();
  },

  testIncrementAndDecrement: function (test) {
    this.model.incrementWatchers(this.fid);
    
    test.equals(1, this.model.getWatcherCount(this.fid));
    this.model.incrementWatchers(this.fid);
    test.equals(2, this.model.getWatcherCount(this.fid));
    this.model.decrementWatchers(this.fid);
    test.equals(1, this.model.getWatcherCount(this.fid));

    test.done();
  },

  testReadiness: function (test) {
    for (var i = 1; i <= 10; i++) {
      test.ok(!this.model.isReady(this.fid));
      this.model.incrementWatchers(this.fid);
      test.equals(10 - i, this.model.getRemaining(this.fid));
    }
    
    test.ok(this.model.isReady(this.fid));
    this.model.decrementWatchers(this.fid);
    test.ok(!this.model.isReady(this.fid));

    for (var i = 0; i < 5; i++) {
      this.model.incrementWatchers(this.fid);
      test.ok(this.model.isReady(this.fid));
    }

    test.done();
  }
};
