const fs = require('fs');
const express = require('express');
const glob = require('glob');
const jsonfile = require('jsonfile');

let router = express.Router();


function getTree(project) {
    return buildTree(getMutants(project));
}

function getMutants(project) {
    let mutants = [];
    for(let path of glob.sync('data/' + project + '/*_0_0.json')) {
        let content = jsonfile.readFileSync(path);
        mutants = mutants.concat(content['mutants']);
    }
    return mutants;
}


function buildTree(mutants) {
    let root = { id: "", children: [] }
    for(let item of mutants) {
        addNode(root, item);
    }
    return root;
}

function addNode(tree, mutant) {
    let path = mutant.fullQualifiedClassName.split('.');
    path = path.concat([mutant.methodName, mutant.line, mutant.idMutator]);
    let current = tree;
    for(let step of path) {
        let child = current.children.find( node => node.id === step );
        if(child === undefined) {
            child = { id: step, children: [] };
            current.children.push(child);
        }
        current = child;
    }
    current.children.push(mutant);
}

router.get('/tree/:project', function (req, res) {
    res.json(getTree(req.params.project));
});

module.exports = router;