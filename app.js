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

let rawdata = fs.readFileSync('com.squareup.javapoet.ParameterSpecTest.json');
let values = JSON.parse(rawdata);
fullQualifiedName = values["qualifiedName"]

var tabinitial = [];
var tabcurrent = [];

app.get('/data/:note/:velocity', function(req, res){
    var note = req.params.note;
    var velocity = req.params.velocity;
    if (note == 0 && velocity ==0){
      var tab = [];// JSON.parse(JSON.stringify(tabinitial))
      var o1 = {};
      o1.name = 'coverMutant' + fullQualifiedName;
      o1.value = values["data"][0]["nbMutantCovered"];
      o1.testadded = values["data"][0]["nbAssertionsAdded"];
      o1.assertadded = values["data"][0]["nbTests"];
      tab.push(o1);

      var o2 = {};
      o2.name = 'killMutant' + fullQualifiedName;
      o2.value =values["data"][0]["nbMutantKilled"];
      o2.testadded = values["data"][0]["nbAssertionsAdded"];
      o2.assertadded = values["data"][0]["nbTests"];

      tab.push(o2);
      for(var i = 1; i < 8;i++){
        var o1 = {};
        o1.name = 'coverageTest' + i;
        o1.value = getRandomInt(0,100);
        tab.push(o1);
        var o2 = {};
        o2.name = 'killMutant' + i;
        o2.value = getRandomInt(0,100);
        o1.testadded = getRandomInt(0,10)
        o1.assertadded = getRandomInt(0,10)
        o2.testadded = getRandomInt(0,10)
        o2.assertadded = getRandomInt(0,10)

        tab.push(o2);
      }      
      tabinitial= tab;
    }else 
    {
      var tab =  JSON.parse(JSON.stringify(tabcurrent))    
      
      if (note ==0 || note ==16){
      tab.splice(0, 2);
      var o1 = {};
      o1.name = 'coverageTest' + 0;
      o1.value = getRandomInt(0,100);
      var o2 = {};
      o2.name = 'killMutant' + 0;
      o2.value = getRandomInt(0,100);
      o1.testadded = getRandomInt(0,10)
      o1.assertadded = getRandomInt(0,10)
      o2.testadded = getRandomInt(0,10)
      o2.assertadded = getRandomInt(0,10)
      tab.splice(0, 0, o2);
      tab.splice(0, 0, o1);
    }
    else if (note ==1 || note ==17){
      tab.splice(2, 2);
      var o1 = {};
      o1.name = 'coverageTest' + 1;
      o1.value = getRandomInt(0,100);
      var o2 = {};
      o2.name = 'killMutant' + 1;
      o2.value = getRandomInt(0,100);
      o1.testadded = getRandomInt(0,10)
      o1.assertadded = getRandomInt(0,10)
      o2.testadded = getRandomInt(0,10)
      o2.assertadded = getRandomInt(0,10)

      tab.splice(2, 0, o2);
      tab.splice(2, 0, o1);
    }
    else if (note ==2 || note ==18){
      tab.splice(4, 2);
      var o1 = {};
      o1.name = 'coverageTest' + 2;
      o1.value = getRandomInt(0,100);
      var o2 = {};
      o2.name = 'killMutant' + 2;
      o2.value = getRandomInt(0,100);
      o1.testadded = getRandomInt(0,10)
      o1.assertadded = getRandomInt(0,10)
      o2.testadded = getRandomInt(0,10)
      o2.assertadded = getRandomInt(0,10)

      tab.splice(4, 0, o2);
      tab.splice(4, 0, o1);
    }
    else if (note ==3 || note ==19){
      tab.splice(6, 2);
      var o1 = {};
      o1.name = 'coverageTest' + 3;
      o1.value = getRandomInt(0,100);
      var o2 = {};
      o2.name = 'killMutant' + 3;
      o2.value = getRandomInt(0,100);
      o1.testadded = getRandomInt(0,10)
      o1.assertadded = getRandomInt(0,10)
      o2.testadded = getRandomInt(0,10)
      o2.assertadded = getRandomInt(0,10)

      tab.splice(6, 0, o2);
      tab.splice(6, 0, o1);
    }
    else if (note ==4 || note ==20){
      tab.splice(8, 2);
      var o1 = {};
      o1.name = 'coverageTest' + 4;
      o1.value = getRandomInt(0,100);
      var o2 = {};
      o2.name = 'killMutant' + 4;
      o2.value = getRandomInt(0,100);
      o1.testadded = getRandomInt(0,10)
      o1.assertadded = getRandomInt(0,10)
      o2.testadded = getRandomInt(0,10)
      o2.assertadded = getRandomInt(0,10)

      tab.splice(8, 0, o2);
      tab.splice(8, 0, o1);
    }
    else if (note ==5 || note ==21){
      tab.splice(10, 2);
      var o1 = {};
      o1.name = 'coverageTest' + 5;
      o1.value = getRandomInt(0,100);
      var o2 = {};
      o2.name = 'killMutant' + 5;
      o2.value = getRandomInt(0,100);
      o1.testadded = getRandomInt(0,10)
      o1.assertadded = getRandomInt(0,10)
      o2.testadded = getRandomInt(0,10)
      o2.assertadded = getRandomInt(0,10)

      tab.splice(10, 0, o2);
      tab.splice(10, 0, o1);
    }
    else if (note ==6 || note ==22){
      tab.splice(12, 2);
      var o1 = {};
      o1.name = 'coverageTest' + 6;
      o1.value = getRandomInt(0,100);
      var o2 = {};
      o2.name = 'killMutant' + 6;
      o2.value = getRandomInt(0,100);
      o1.testadded = getRandomInt(0,10)
      o1.assertadded = getRandomInt(0,10)
      o2.testadded = getRandomInt(0,10)
      o2.assertadded = getRandomInt(0,10)

      tab.splice(12, 0, o2);
      tab.splice(12, 0, o1);
    }
    else if (note ==7 || note ==23){
      tab.splice(14, 2);
      var o1 = {};
      o1.name = 'coverageTest' + 7;
      o1.value = getRandomInt(0,100);
      var o2 = {};
      o2.name = 'killMutant' + 7;
      o2.value = getRandomInt(0,100);
      o1.testadded = getRandomInt(0,10)
      o1.assertadded = getRandomInt(0,10)
      o2.testadded = getRandomInt(0,10)
      o2.assertadded = getRandomInt(0,10)

      tab.splice(14, 0, o2);
      tab.splice(14, 0, o1);
    }
    tabcurrent =  JSON.parse(JSON.stringify(tab))    
  }
    res.json(tab);
});
  
app.post('/upload', function(req, res){

});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
