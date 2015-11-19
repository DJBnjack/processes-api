var express = require('express');
var processes = require('./api/processes.js');
var app = express();

// Setup process api
var router = express.Router();
processes.setupProcessApi(router);
app.use('/', router);

// Disable cache
app.disable('etag');

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});


