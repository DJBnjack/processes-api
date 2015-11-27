var request = require('request');
var btoa = function (str) {return new Buffer(str).toString('base64');};
var baseNeoURL = '';

var setBaseURL = function(url) {
  baseNeoURL = url;
} 

// This should work in node.js and other ES5 compliant implementations.
function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

var authorizationHeader = {	'Authorization': 'Basic ' + btoa("neo4j:vetman2") };  
var uuid = require('node-uuid');

var executeStatements = function(statements, callback){
  if (baseNeoURL === '') return; 
  
  var options = {
    url: baseNeoURL + '/db/data/transaction/commit',
    headers: authorizationHeader,
    json: true,
    method: 'POST',
    body: { "statements" : statements}
  };
  
  request(options, function (error, response, body) {
    if (response == undefined) {
      console.log('error', error);
      console.log('response', response);
      console.log('body', body);
    } else if (!error && response.statusCode == 200) {
      callback(JSON.stringify(body.results[0].data, null, 2));
    } else if (response.statusCode == 404) {
      callback(JSON.stringify("Not found", null, 2));
    }
  });
}

function getProcesses(callback) {
  var statement = 
  {
    "statement": "MATCH (n:node {type:'process'}) RETURN n",
    "resultDataContents":["row"]
  };
  
  executeStatements([statement], callback);
};

function getProcess(guid, callback) {
  var statement = 
  {
    "statement": "MATCH (n:node {type:'process', guid: '" + guid + "'}) RETURN n",
    "resultDataContents":["row"]
  };
  
  executeStatements([statement], callback);
}

function deleteProcess(guid, callback) {
  var statement = {	"statement": "MATCH (n:node {type:'process', guid: '" + guid + "'}) DETACH DELETE n" };
  executeStatements([statement], callback);
};

function deleteProcesses(callback) {
  var statement = {	"statement": "MATCH (n) DETACH DELETE n" };
  executeStatements([statement], callback);
};

function createProcess(body, callback) {
  var nodes = [
    "(z:node {name:'<NAME>', type:'process', state:'new', guid:'<GUID>'})",
    "(a:node {name:'Start', type:'start', state:'new'})",
    "(b:node {name:'Wait for approval', type:'input', state:'new'})",
    "(c:node {name:'End', type:'end', state:'new'})"
  ];

  var templateString = "";
  nodes.forEach(function(value, index, array){
    if (index < array.length-1){
      templateString += value + "-[:link]->";
    } else {
      templateString += value;
    }
  });

  var instanceString = templateString.replace(/<GUID>/g, uuid.v4());
  if (!isEmptyObject(body)) {
    instanceString = instanceString.replace(/<NAME>/g, body.name);    
  } else {
    instanceString = instanceString.replace(/<NAME>/g, "Name undefined");
  }
  
  var statement = { "statement": "Create p="+instanceString };
  executeStatements([statement], callback);
}

function updateProcess(guid, callback) {
  var templateString = "MATCH (n {type: 'process', guid: '<GUID>'}) "+
    "WITH n "+
    "SET n.state = 'finished' "+
    "RETURN n";
    
  var instanceString = templateString.replace(/<GUID>/g, guid);
  var statement = { "statement": instanceString };
  executeStatements([statement], callback);
}

module.exports.getProcesses = getProcesses;
module.exports.getProcess = getProcess;
module.exports.deleteProcess = deleteProcess;
module.exports.deleteProcesses = deleteProcesses;
module.exports.createProcess = createProcess;
module.exports.updateProcess = updateProcess;
module.exports.setBaseURL = setBaseURL;