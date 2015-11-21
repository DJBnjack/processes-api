var express = require('express');
var processes = require('./api/processes.js');
var io = require('socket.io-emitter')({ host: 'redis.core.djbnjack.svc.tutum.io', port: 6379 });
var os = require("os");

setInterval(function(){
  io.emit('system', 'ping from ' + os.hostname());
}, 5000);

var app = express();

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Pass to next layer of middleware
    next();
});

// Setup process api
var router = express.Router();
processes.setupProcessApi(router);
app.use('/', router);

// Disable cache
app.disable('etag');

// Fire it up
app.listen(3000);


