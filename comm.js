
var model = require('./model').get();

var watchers = {};

function getWatcherTag(watcherSocket) {
  return watcherSocket.id + '@' + watcherSocket.handshake.address.address;
}

function massEmit(sockets, event, data) {
  for (var i = 0; i < sockets.length; i++)
    sockets[i].emit(event, data);
}

function updateCount(fid) {
  var list = watchers[fid];
  massEmit(list, 'count', {
    total: model.getWatcherCount(fid),
    remaining: model.getRemaining(fid)
  });
  massEmit(list, model.isReady(fid) ? 'ready' : 'notready');
}

function addWatcher(toAdd, fid) {
  if (!(fid in watchers))
    watchers[fid] = [];

  var group = watchers[fid];
  for (var i = 0; i < group.length; i++)
    toAdd.emit('addWatcher', getWatcherTag(group[i]));
  group.push(toAdd);
  model.incrementWatchers(fid);
  massEmit(group, 'addWatcher', getWatcherTag(toAdd));
  updateCount(fid);
}

function removeWatcher(toRemove, fid) {
  var group = watchers[fid];
  group.splice(group.indexOf(toRemove), 1); // remove from array
  model.decrementWatchers(fid);
  massEmit(group, 'removeWatcher', getWatcherTag(toRemove));
  updateCount(fid);

  if (group.length == 0)
    delete watchers[fid];
}

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
