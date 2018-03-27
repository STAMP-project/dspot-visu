const express = require('express');
const data = require('./data-manager.js');

let router = express.Router();

router.get('/baseline', function(req, res) {
    const result = data.map(item => { 
        return {
            name: item.name,
            origCovered: item.origCovered,
            origKilled: item.origKilled,
            maxKilled: item.maxKilled,
            maxCovered: item.maxCovered,
            maxTests: item.maxTests,
            maxAssertions: item.maxAssertions,
        };
    });
    res.json(result);
});

router.get('/result/:target/:tests/:assertions', function(req, res) {
    let target = validateInteger(req.params.target, data.length - 1, 'target');
    let tests = validateInteger(req.params.tests, data[target].maxTests, 'value of added tests');
    let assertions = validateInteger(req.params.assertions, data[target].maxAssertions, 'value of added assertions');
    let result = data[target].matrix[tests][assertions];
    if(result === undefined)
        result = {killed: data[target].origKilled, covered: data[target].origCovered}; //Fallback to some parameter sets without values, i.e. 0 tests multiple assertions
    res.json(result);
});

function validateInteger(value, max, name) {
    const result = parseInt(value);
    if (result !== NaN && result >= 0 && result <= max)
        return result;
    throw new Error("The " + name + " must be a non-negative integer lower or equal than " + max + " instead of '" + value + "'.");
}

module.exports = router;