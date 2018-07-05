const fs = require('fs');
const express = require('express');
const glob = require('glob');
const jsonfile = require('jsonfile');
const debug = require('debug')('stamp');


let router = express.Router();

//TODO: take this out of here
router.get('/:project/view/', function (req, res) {
    res.render('dots.pug', {project: req.params.project});
});

router.get('/:project/mutants/', function (req, res) {
    //Mutants are identified by the order they have in the file

    let files = glob.sync(`data/${req.params.project}/*_0_0.json`);
    if (files.length === 0) {
        res.status(404).send([]);
        return;
    }

    let mutantData = jsonfile.readFileSync(files[0])['mutants'];
    res.json(mutantData.map(
        (mutant, index) => {
            mutant.id = index;
            return mutant;
        }
    ));
});

router.get('/:project/tests/', function (req, res) {
    let path = `data/${req.params.project}/${req.params.project}.json`;
    if(!fs.existsSync(path)) {
        res.status(404).json({});
        return;
    }
    let content = jsonfile.readFileSync(path);
    res.json(content.tests);
});

router.get('/:project/detection/:test_class/:assertions/:tests/', function (req, res) {
    const path = `data/${req.params.project}/${req.params.test_class}_${req.params.assertions}_${req.params.tests}.json`;
    if(!fs.existsSync(path)) {
        res.status(404).json({});
        return;
    }

    let content = jsonfile.readFileSync(path);
    let result = content.mutants
            .map( (m, index) => {
                m.id = index;
                m.detected = m.status === 'KILLED' || m.status === 'TIMED_OUT';
                return m;
            })
            .filter(m => m.status !== 'NO_COVERAGE');
    content.mutants = result;
    res.json(content);
});

module.exports = router;

