var express = require('express');
var bodyParser = require('body-parser');
var processes = require('./api/processes.js');
var client = require('socket.io-client')('http://socketserver-1.messaging.djbnjack.cont.tutum.io:3210');
var SDC = require('statsd-client'),
    sdc = new SDC({host: 'statsd.core.djbnjack.svc.tutum.io'});
// var client = require('socket.io-client')('http://localhost:3210');
var os = require("os");

var sendUpdate = function() {
  client.emit('updated', 'processes'); 
}

client.on('urls', function(msg){
  console.log('Got URLS', msg);  
  processes.setBaseURL(msg.neo4j_url);
  
  // Send ping every minute to socket.io server
  setInterval(function(){
    client.emit('system', 'ping from ' + os.hostname());
  }, 60000);
});

// This should work in node.js and other ES5 compliant implementations.
function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

var app = express();
 
// Add cross-origin headers
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

app.use(bodyParser.json()); // for parsing application/json

app.use(sdc.helpers.getExpressMiddleware('process-api'));

// simple logger for this router's requests
// all requests to this router will first hit this middleware
app.use(function(req, res, next) {
  console.log('%s %s %s', req.method, req.url, req.path);
  if (!isEmptyObject(req.body)) {
    console.log(req.body);
  }
  next();
});

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
  processes.createProcess(req.body, function(info){
    sendUpdate();
    res.send(info);
  });
});

// Update process
router.put('/processes/:guid', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  processes.updateProcess(req.params.guid, function(info){
    sendUpdate();
    res.send(info);
  });
});

// Delete processes
router.delete('/processes', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  processes.deleteProcesses(function(info){
    sendUpdate();
    res.send(info);
  });
});

router.delete('/processes/:guid', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  processes.deleteProcess(req.params.guid, function(info){
    sendUpdate();
    res.send(info);
  });
});

app.use('/', router);

// Disable cache
app.disable('etag');

// Fire it up
app.listen(3000);
