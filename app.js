var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');

var log = require('./tetris_log/logHelper');
var router = require('./router/index');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
log.use(app);
app.use('/', router);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

function getLine(offset) {
  var stack = new Error().stack.split('\n'),
      line = stack[(offset || 1) + 1].split(':');
  return parseInt(line[line.length - 2], 10);
}
 
global.__defineGetter__('__line', function () {
  return getLine(2);
});


module.exports = app;
