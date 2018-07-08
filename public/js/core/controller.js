
const DetectionStatus = {
    Detected: 2,
    Covered: 1,
    NotCovered: 0
};

const TEXT_TO_STATUS = {
    'KILLED': DetectionStatus.Detected,
    'TIMED_OUT': DetectionStatus.Detected,
    'SURVIVED': DetectionStatus.Covered,
    'NO_COVERAGE': DetectionStatus.NotCovered
};


class Mutant {
    constructor(record) {
        Object.assign(this, record);
        this.status = DetectionStatus.NotCovered;
    }

    update(tests) {
        let potential_status = [];
        for(let item of tests) {
            for(let ch of this.changes[item.name]) {
                if(ch.assertions <= item.amplification.assertions && ch.tests <= item.amplification.tests)
                    potential_status.push(TEXT_TO_STATUS[ch.status])
            }
        }
        this.status = Math.max.apply(null, potential_status);
    }

    get isDetected() {
        return this.status === DetectionStatus.Detected;
    }

    get isOnlyCovered() {
        return this.status === DetectionStatus.Covered
    }

    reset() {
        this.status = DetectionStatus.NotCovered
    }
}

class Test {

    constructor(record) {
        Object.assign(this, record);

        this.amplification = {tests: 0, assertions: 0};
    }

    reset() {
        this.amplification.tests = 0;
        this.amplification.assertions = 0;
    }

    amplify(input) {
        let testsAmplified = this.set('tests', input);
        let assertionsAmplified = this.set('assertions', input);
        
        return  testsAmplified || assertionsAmplified; 
    }

    set(parameter, input) {
        let value = input[parameter];
        if(value === undefined) return false;
        if(value < 0 || value > this[parameter])
            throw new Error(`Wrong ${parameter} value ${value} for ${this.name}`);
        if(this.amplification[parameter] === value) return false;
        this.amplification[parameter] = value;
        return true;
    }

}

class Controller {

    constructor(project, visualization, panel, input) {

        this.project = project
        this.visualization = visualization;
        this.panel = panel;
        this.input = input;

        this.doAmplify = this.amplify.bind(this);

        this.initialize();
    }

    initialize() {
        $.ajax(`/data/${this.project}.json`).then((data) => {

            this.tests = data.tests_classes.map(tc => new Test(tc));
            this.mutants = data.mutants.map(rec => new Mutant(rec));

            this.visualization.initialize(this.mutants);
            this.panel.initialize(this.tests);
            this.input.initialize(this.tests);

            this.input.on(SIGNALS.START, this.start.bind(this));

        });

    }

    start() {
        this.tests.forEach(tc => {tc.amplification.tests = 0; tc.amplification.assertions = 0;});
        this.input.off(SIGNALS.AMPLIFY, this.doAmplify);
        this.update();
        this.input.on(SIGNALS.AMPLIFY, this.doAmplify);
    }

    update() {
        this.mutants.forEach(mut => mut.update(this.tests));

        this.panel.update();
        this.updateDisplay();
        this.visualization.update();
    }

    updateDisplay() {
        let covered = 0
        let killed = 0;

        for(let mutant of this.mutants) {
            if(mutant.isDetected) killed++;
            else if(mutant.isOnlyCovered) covered++;
        }

        $('.display.covered').text(covered);
        $('.display.killed').text(killed);

    }

    amplify(params) {
        if(params.unit >= this.tests.length) return;

        let test = this.tests[params.unit];
        if(!test.amplify(params)) return;
        console.log('Updating');
        this.update();
    }


    // saveVisualization() {

    // }

    // get _styles() {
    //     let styles = '<defs><style type="text/css"><![CDATA[';
    //     for(let sheet of document.styleSheets)
    //         for(let rule of sheet.cssRules)
    //             styles += ' ' + rule.cssText
    //     return styles + ']]></style></defs>';
    // }

    // get visualizationImage() {

    //     //TODO: This is not working for the moment
    //     let outputCanvas = document.createElement('svg');
    //     outputCanvas.innerHTML = this._styles + this.container.html();
    //     let serializer = new XMLSerializer();
    //     let result = serializer.serializeToString(outputCanvas);

    //     if(!result.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
    //         result = result.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    //     }
    //     if(!result.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
    //         result = result.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    //     }

    //     return '<?xml version="1.0" standalone="no"?>' + result;

    // }
}