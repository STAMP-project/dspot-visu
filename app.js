const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dataRouter = require('./data-router.js');

const app = express();

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', dataRouter);
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'index.html'));
});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
