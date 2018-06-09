const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dataRouter = require('./data-router.js');

const internalRouter = require('./internal-router.js');
const projectRouter = require('./project-router.js');

const app = express();
app.set('view engine', 'pug')
app.set('json spaces', 2);

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/raw', express.static(path.join(__dirname, 'data')));
app.use('/project', projectRouter);

app.use('/internal', internalRouter);

app.use('/data', dataRouter);
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'index.html'));
});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
