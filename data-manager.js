const fs = require('fs');
const path = require('path');
const jsonfile = require('jsonfile');


//TODO: This could be stored in a configuration file
const DATA_DIR = './data/traccar';
const PROJECT = 'traccar';

function getProjectData() {
    const project = jsonfile.readFileSync(path.join(DATA_DIR, PROJECT + '.json'));
    return project.classTimes.map(record =>
        getTesClassData(
            jsonfile.readFileSync(
                path.join(DATA_DIR, record.fullQualifiedName + '.json'))));
}

function getTesClassData(testClassRecord) {
    const result = {
        name: testClassRecord.qualifiedName,
        origCovered: testClassRecord.originalNbMutantCovered,
        origKilled: testClassRecord.originalNbMutantKilled,
        maxKilled: 0,
        maxCovered: 0,
        maxTests: testClassRecord.maxTests,
        maxAssertions: testClassRecord.maxAssertions,
        matrix: createMatrix(testClassRecord.maxTests + 1, testClassRecord.maxAssertions + 1), //Plus one to include the test without amplification
    }

    for(let item of testClassRecord.data) {
        result.matrix[item.nbTests][item.nbAssertionsAdded] = {covered: item.nbMutantCovered, killed: item.nbMutantKilled};
        result.maxKilled = Math.max(item.nbMutantKilled, result.maxKilled);
        result.maxCovered = Math.max(item.nbMutantCovered, result.maxCovered);
    }

    return result;

}

function createMatrix(rows, columns) {
    let result = new Array(rows);
    for(let i = 0; i < rows; i++)
        result[i] = new Array(columns);
    return result;
}

module.exports = getProjectData();