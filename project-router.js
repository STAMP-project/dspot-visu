const fs = require('fs');
const express = require('express');
const glob = require('glob');
const jsonfile = require('jsonfile');
const debug = require('debug')('stamp');


let router = express.Router();

router.get('/:project/view/', function (req, res) {
    res.render('dots.pug', {project: req.params.project});
});

router.get('/:project/mutants/', function (req, res) {
    const inspected = new Set();
    const result = [];

    let files = glob.sync(`data/${req.params.project}/*_0_0.json`);
    if (files.length === 0) {
        res.status(404).send([]);
        return;
    }

    for(let path of files) {
        let content = jsonfile.readFileSync(path);
        for(let mutant of content['mutants']) {
            let id = getID(mutant);
            if(inspected.has(id)) continue;
            inspected.add(id);
            result.push({
                className: mutant.fullQualifiedClassName,
                method: mutant.methodName,
                line: mutant.line,
                mutator: mutant.idMutator,
                id: id //Just to avoid creating the same function on the client side
            });
        }
    }

    res.json(result);
});

function getID(mutant) {
    return `${mutant.fullQualifiedClassName}.${mutant.methodName}:${mutant.line}:${mutant.idMutator}`;
}

router.get('/:project/tests/', function (req, res) {
    let tests = [];

    let files = glob.sync(`data/${req.params.project}/*_0_0.json`).map(
        path => path.slice(0, - "_0_0.json".length) + '.json');
    
    if(files.length === 0) {
        res.status(404).json([]);
        return;
    }
    
    for(let path of files) {
        let content = jsonfile.readFileSync(path);
        tests.push({
            name: content.qualifiedName,
            covered: content.originalNbMutantCovered,
            killed: content.originalNbMutantKilled,
            tests: content.maxTests,
            assertions: content.maxAssertions + 1
        });
    }

    res.json(tests);

});

router.get('/:project/detection/:test_class/:assertions/:tests/', function (req, res) {
    const path = `data/${req.params.project}/${req.params.test_class}_${req.params.assertions}_${req.params.tests}.json`;
    if(!fs.existsSync(path)) {
        res.status(404).json({});
        return;
    }

    let content = jsonfile.readFileSync(path);
    let result = content.mutants
            .filter(m => m.status != 'NO_COVERAGE')
            .map( m => {
                return { 
                    className: m.fullQualifiedClassName,
                    method: m.methodName,
                    line: m.line,
                    mutator: m.idMutator,
                    id: getID(m), // Just to avoid having the same function on the client side
                    detected: m.status === 'KILLED' };
            });

    res.json({
        name: content.qualifiedName,
        assertions: content.nbAssertions,
        tests: content.nbTest,
        mutants: result
    });
});

module.exports = router;

