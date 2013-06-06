
/**
 * Manages connected sockets and handles the realtime responsibilites
 * of the app, including updating the connected user list and flipping
 * coins.
 */

var util = require('util')
  , model = require('./model').get();

var watchers = {}, watcherTags = {};

function massEmit(sockets, event, data) {
  for (var i = 0; i < sockets.length; i++)
    sockets[i].emit(event, data);
}

function addWatcher(toAdd, fid) {
  if (!(fid in watchers))
    watchers[fid] = [];

  var group = watchers[fid];
  for (var i = 0; i < group.length; i++)
    toAdd.emit('addWatcher', getWatcherTag(fid, group[i]));
  group.push(toAdd);
  model.incrementWatchers(fid);
  massEmit(group, 'addWatcher', getWatcherTag(fid, toAdd));
  updateCount(fid);
}

function removeWatcher(toRemove, fid) {
  var group = watchers[fid];
  group.splice(group.indexOf(toRemove), 1); // remove from array
  model.decrementWatchers(fid);
  massEmit(group, 'removeWatcher', getWatcherTag(fid, toRemove));
  updateCount(fid);

  freeWatcherTag(fid, toRemove);

  if (group.length == 0)
    delete watchers[fid]
}

function updateCount(fid) {
  var list = watchers[fid];
  massEmit(list, 'count', {
    total: model.getWatcherCount(fid),
    remaining: model.getRemaining(fid)
  });
  massEmit(list, model.isReady(fid) ? 'ready' : 'notready');
}

function getWatcherTag(fid, watcherSocket) {
  if (!(fid in watcherTags)) {
    watcherTags[fid] = {
      tags: {},
      counter: 0
    };
  }
      
  if (!(watcherSocket.id in watcherTags[fid].tags)) {
    var addr = watcherSocket.handshake.address.address;
    watcherTags[fid].tags[watcherSocket.id] =
      util.format('Anonymous %d - %s', ++watcherTags[fid].counter, addr);
  }

  return watcherTags[fid].tags[watcherSocket.id];
}

function freeWatcherTag(fid, watcherSocket) {
  delete watcherTags[fid].tags[watcherSocket.id];
  var isEmpty = true;
  if (isDictionaryEmpty(watcherTags[fid].tags))
    delete watcherTags[fid];
}

function isDictionaryEmpty(dict) {
  for (var k in dict)
    return false;
  return true;
}

// socket handler function for the socket.io server
exports.handler = function (socket) {
  socket.on('fid', function (fid) {
    if (model.exists(fid)) {
      addWatcher(socket, fid);

      socket.on('flip', function () {
        if (model.getResult(fid) !== null)
          socket.emit('error', 'coin already flipped');
        else {
          massEmit(watchers[fid], 'flipped', model.performFlip(fid));
        }       
      });
      socket.on('disconnect', function () { removeWatcher(socket, fid); });
    } else {
      socket.emit('error', 'flip does not exist');
      socket.disconnect();
    }
  });
};
