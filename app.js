const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const jsonfile = require('jsonfile');

const app = express();
app.set('view engine', 'pug')
app.set('json spaces', 2);

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data')));

app.get('/slides/:project/', function (request, response) {

  // Early (way too early) functionality
  const info = jsonfile.readFileSync('projects.json');
  const projects = info.filter(p => p.name === request.params.project)
  
  if(projects.length === 0) {
    response.status(404);
    return;
  }

  response.render('slides.pug', { 
    project: projects[0],
    keyboard: request.query.keyboard !== undefined,
    full_panel: request.query.panel !== undefined
  });
});

app.get('/packing/:project/', function(request, response) {
  response.render('packing.pug', {
    project: request.params.project,
    keyboard: request.query.keyboard !== undefined,
    full_panel: request.query.panel !== undefined
  });
});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
