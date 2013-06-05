
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , io = require('socket.io')
  , path = require('path')
  , model = require('./model').get()
  , comm = require('./comm')

var app = express();

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function (req, res) {
  res.render('index', req.query);
});
app.post('/', function (req, res) {
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
  else {
    var fid = model.createFlip(req.body.title, threshold);
    res.redirect('/flip/' + fid)
  }
});

app.get('/flip/:fid', function (req, res) {
  if (!model.exists(req.params.fid))
    res.redirect('/flipnotfound');
  else {
    var fid = req.params.fid; // TODO: check invalid conditions
    res.render('flip', {
      fid: fid,
      title: model.getTitle(fid),
      result: model.getResult(fid)
    });
  }
});

app.get('/flipnotfound', function (req, res) {
  res.render('flipnotfound');
});

app.get('*', function(req, res) {
  res.redirect('/flipnotfound');
});

var server = http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
io.listen(server).sockets.on('connection', comm.handler);
