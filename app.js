const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.set('view engine', 'pug')
app.set('json spaces', 2);

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data')));

app.get('/packing/:project/', function(request, response) {
  response.render('packing.pug', {project: request.params.project});
});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
