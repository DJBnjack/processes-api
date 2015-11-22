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

// Get processes
router.get('/processes', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  processes.getProcesses(info => res.send(info));
});

router.get('/processes/:guid', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  processes.getProcess(req.params.guid, info => res.send(info));
});

// Create process
router.post('/processes', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  processes.createProcess(function(info){
    io.emit('updated', 'processes'); 
    res.send(info);
  });
});

// Delete processes
router.delete('/processes', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  processes.deleteProcesses(function(info){
    io.emit('updated', 'processes'); 
    res.send(info);
  });
});

router.delete('/processes/:guid', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  processes.deleteProcess(req.params.guid, function(info){
    io.emit('updated', 'processes'); 
    res.send(info);
  });
});

app.use('/', router);

// Disable cache
app.disable('etag');

// Fire it up
app.listen(3000);
