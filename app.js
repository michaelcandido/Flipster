
/**
 * Sets up the server for the app and passes off requests to the
 * controller.
 */

var express = require('express')
  , http = require('http')
  , io = require('socket.io')
  , path = require('path')
  , controller = require('./routes/controller')
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

app.get('/', controller.index);
app.post('/', controller.newFlip);
app.get('/flip/:fid', controller.viewFlip);
app.get('/flipnotfound', controller.notFound);
app.get('*', controller.defaultAction);

var server = http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
io.listen(server).sockets.on('connection', comm.handler);
