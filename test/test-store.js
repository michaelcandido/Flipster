
var Store = require('../store.js').Store;

exports.tests = {
  setUp: function (done) {
    this.store = new Store;
    this.fid = this.store.createFlip('title', 5);
    done();
  },

  testFlipExistence: function (test) {
    test.ok(this.store.exists(this.fid));
    test.ok(!this.store.exists(this.fid - 1));

    test.done();
  },

  testCreateAndGetFlip: function (test) {
    var flip = this.store.getFlip(this.fid);
    
    test.equals('title', flip.title);
    test.equals(5, flip.threshold);
    test.equals(null, flip.result);
    test.equals(0, flip.watcherCount);

    // test immutability
    flip.title = 'changed';
    test.equals('title', flip.title);

    test.done();
  },

  testUpdateFlip: function (test) {
    var f1 = this.store.getFlip(this.fid);

    var f2 = f1.replace({
      title: 'new title',
      result: true,
      watcherCount: 2
    });

    test.equals('new title', f2.title);
    test.equals(5, f2.threshold);
    test.equals(true, f2.result);
    test.equals(2, f2.watcherCount);

    var f3 = this.store.updateFlip(this.fid, f2);
    
    test.equals('new title', f3.title);
    test.equals(5, f3.threshold);
    test.equals(true, f3.result);
    test.equals(2, f3.watcherCount);

    test.done();
  },
};
