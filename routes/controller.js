
/**
 * Handles the non-realtime responsibilities of the app including
 * serving pages and creating new flips.
 */

var model = require('../model').get();

var HOSTNAME = 'flipster-michaelcandido.nodejitsu.com';

exports.index = function (req, res) {
  res.render('index', req.query);
};

exports.newFlip = function (req, res) {
  var error = false;
  if (!('threshold' in req.body))
    error = 'invalid request';
  else {
    var threshold = parseInt(req.body.threshold);
    if (isNaN(threshold))
      error = 'number of participants was not a number';
    else if (threshold < 1)
      error = 'cannot have fewer than 1 watcher';
  }

  if (error)
    res.redirect('/?error=' + encodeURIComponent(error));
  else
    res.redirect('/flip/' + model.createFlip(req.body.title, threshold));
};

exports.viewFlip = function (req, res) {
  if (!model.exists(req.params.fid))
    res.redirect('/flipnotfound');
  else {
    var fid = req.params.fid; // TODO: check invalid conditions
    res.render('flip', {
      fid: fid,
      title: model.getTitle(fid),
      result: model.getResult(fid),
      link: 'http://' + HOSTNAME + '/flip/' + fid
    });
  }
};

exports.notFound = function (req, res) {
  res.render('flipnotfound');
};

exports.defaultAction = function(req, res) {
  res.redirect('/flipnotfound');
};
