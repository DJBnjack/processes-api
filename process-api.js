var express = require('express');
var processes = require('./api/processes.js');
var io = require('socket.io-emitter')({ host: 'redis.core.djbnjack.svc.tutum.io', port: 6379 });
var os = require("os");

// Send ping every minute to socket.io server
setInterval(function(){
  io.emit('system', 'ping from ' + os.hostname());
}, 60000);

var app = express();

// Setup process api
var router = express.Router();
processes.setupProcessApi(router, io);
app.use('/', router);

// Disable cache
app.disable('etag');

// Fire it up
app.listen(3000);


