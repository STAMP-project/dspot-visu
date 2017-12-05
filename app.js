var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var tmp = require('tmp');
var child_process = require('child_process');
var randomstring = require("randomstring");
const glob = require('glob');
var jsel = require('jsel');
var bodyParser = require('body-parser')


app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/data', function(req, res){
 
    var tab = [];

    for(var i = 0; i < 10;i++){
      var o1 = {};
      o1.name = 'coverageTest' + i;
      o1.value = getRandomInt(0,100);
      tab.push(o1);
      var o2 = {};
      o2.name = 'killMutant' + i;
      o2.value = getRandomInt(0,100);
      tab.push(o2);
    }      
    res.json(tab);

});
  
app.post('/upload', function(req, res){

});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
