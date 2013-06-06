
 /**
  * Dynamic UI plumbing for the flip view. Connects a socket to the
  * server and updates the UI as events arrive.
  */

var _flipjs = (function () {

  var ROTATION = 1080, ROTATION_OFFSET = 180, ROTATION_TIME_RATIO = 25 / 18;

  var fid, result, flipper, status, watcherList, remaining, coin;

  function flipCoin(_result) {
    var rotation = ROTATION + (_result ? 0 : ROTATION_OFFSET);
    coin.children().stop().transition({
      rotateX: '+=' + rotation + 'deg'
    }, rotation * ROTATION_TIME_RATIO, function () {
      result = _result;
      updateRemaining();
    });
  }

  function updateCount(count) {
    var n = count.total;
    status.text(n + ' ' + (n == 1 ? 'person' : 'people') + ' connected');
    updateRemaining(count.remaining);
  }

  function updateRemaining(rem) {
    if (result === null) {
      remaining.text(rem > 0 ? rem + ' remaining' : 'ready to flip!');
      flipper.show();
    } else {
      remaining.text('Flip result: ' + (result ? 'heads' : 'tails') + '!');
      flipper.hide();
    }
  }

  // rendering work
  $(function () {
    if (result === undefined)
      throw new Error('result not initialized');

    flipper     = $('input[name="flipper"]'), status    = $('#status-bar'),
    watcherList = $('#watcher-list')        , remaining = $('#remaining') ,
    coin        = $('.coin');

    if (result === false) {
      coin.children().css({ rotateX: '+=' + ROTATION_OFFSET + 'deg' });
      updateRemaining();
    }
  });

  // connection work
  $(function () {
    if (fid === undefined)
      throw new Error('fid not initialized');

    var watchers = {}, socket = io.connect('/');

    socket.on('connect', function () { socket.emit('fid', fid); });
    socket.on('disconnect', function () {
      status.text('not connected...');
      watcherList.empty();
      remaining.text('');
    });
    socket.on('ready', function () {
      flipper.removeAttr('disabled');
    });
    socket.on('notready', function () {
      flipper.attr('disabled', 'disabled');
    });
    // note that a count event is sent immediately after connection
    socket.on('count', updateCount);
    socket.on('addWatcher', function (tag) {
      var view = $('<li>' + tag + '</li>');
      watcherList.append(watchers[tag] = view);
    });
    socket.on('removeWatcher', function (tag) {
      if (tag in watchers)
        watchers[tag].remove();
    });
    socket.on('flipped', flipCoin);
    socket.on('error', function (msg) { alert(msg); });
    flipper.click(function () { socket.emit('flip'); });
  });

  // return an initializer function
  return function (data) {
    fid = data.fid;
    result = data.result;
  };

})();
