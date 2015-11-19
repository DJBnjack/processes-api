var express = require('express');
var processes = require('./api/processes.js');

var app = express();

// Setup process api
var router = express.Router();
processes.setupProcessApi(router);
app.use('/', router);

// Disable cache
app.disable('etag');

// Fire it up
app.listen(3000);


