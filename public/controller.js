
const DetectionStatus = {
    Detected: 2,
    Covered: 1,
    NotCovered: 0
}

class MutantStatus {

    constructor() {
        this.detected = new Set();
        this.covered = new Set();
    }

    addDetection(test) {
        this.detected.add(test);
    }

    addCoverage(test) {
        this.covered.add(test);
    }

    remove(test) {
        this.detected.delete(test);
        this.covered.delete(test);
    }

    get isDetected() {
        return this.detected.size > 0;
    }

    get isOnlyCovered() {
        return this.covered.size > 0;
    }

    get status() {
        if(this.isDetected) return DetectionStatus.Detected;
        if(this.isOnlyCovered) return DetectionStatus.Covered;
        return DetectionStatus.NotCovered;
    }

    reset() {
        this.detected.clear();
        this.covered.clear();
    }

}

class Controller {

    constructor(visualization, controlPanel, inputManager) {
        this.visualization = visualization;
        this.controlPanel = controlPanel;
        this.inputManager = inputManager;

        this.doUpdate = this.update.bind(this);
        this.doAmplify = this.onInput.bind(this);
    }

    initialize() {
        let self = this;

        let requests = Promise.all([
            $.ajax(`/project/${PROJECT}/mutants/`).then((data) => {
                self.initializeMutants(data);
                self.visualization.initialize(self.mutants);
                console.log("Mutants initialized");
            }),

            $.ajax(`/project/${PROJECT}/tests/`).then((data) => {
                self.initializeTests(data);
                self.controlPanel.initialize(self.tests);
                self.inputManager.initialize(self.tests);
                self.controlPanel.update();
                console.log("Tests initialized");

                })])
        .then(
            x => {
                this.inputManager.on(SIGNALS.START, this.startAmplification.bind(this))
            }
        );
    }

    initializeMutants(data) {
        this.mutants = data;
        this.mutants.forEach(m => m.status = new MutantStatus());
    }

    startAmplification() {
        this.mutants.forEach(m => m.status.reset());
        this.tests.forEach(t => t.amplification = {tests: 0, assertions: 0});
        this.inputManager.off(SIGNALS.AMPLIFY, this.doAmplify);
        this.controlPanel.update();
        Promise.all(this.tests.map(
            test => $.ajax(`/project/${PROJECT}/detection/${test.name}/${test.amplification.assertions}/${test.amplification.tests}/`)
            .then(this.doUpdate)        
        )).then(res => this.inputManager.on(SIGNALS.AMPLIFY, this.doAmplify));
    }

    initializeTests(data) {
        this.tests = data.map( record => {
            record.amplification = {tests: 0, assertions: 0};
            return record;
        });
    }

    onInput(input) { //TODO: Rethink again, let the input manager send both things, maybe with two different events.
        if(input.unit >= this.tests.length) return;

        let test = this.tests[input.unit];
        let currentAmplification = test.amplification;

        let params = {tests: currentAmplification.tests, assertions: currentAmplification.assertions };
        const validate = (field) => {
            if(input[field] === undefined) return;
            if(input[field] < 0 || input[field] > test[field]) {
                console.error(`Wrong ${field} value: ${input[field]} not in [0,${test[field]}] for ${test.name}`);
                return;
            }
            params[field] = input[field];
        };

        validate('tests'); validate('assertions');
        if(params.tests === currentAmplification.tests && params.assertions === currentAmplification.assertions)
        return; // No amplification 
        
        //TODO: Change the amplification values only when the result is returned?
        test.amplification = params;
        this.controlPanel.update();
    
        let self = this;

        $.ajax(`/project/${PROJECT}/detection/${test.name}/${test.amplification.assertions}/${test.amplification.tests}/`)
            .then(this.doUpdate);
    }

    update(data) {
        this.updateMutants(data);
        this.updateDisplay();
        this.visualization.update();
    }
    
    updateMutants(data) {
        for(let mutant of this.mutants) {
            mutant.status.remove(data.test_class);
        }
        
        for(let record of data.mutants) {
            // console.log("updating " + record.id);
            let mutant = this.mutants[record.id];
            //debugger;
            if(record.detected)
                mutant.status.addDetection(data.test_class);
            else
                mutant.status.addCoverage(data.test_class);
        }
        
    }

    updateDisplay() {
        let covered = 0
        let killed = 0;

        for(let mutant of this.mutants) {
            if(mutant.status.isDetected) killed++;
            else if(mutant.status.isOnlyCovered) covered++;
        }
        
        $('.display.covered').text(covered);
        $('.display.killed').text(killed);
    }

    saveVisualization() {

    }

    get _styles() {
        let styles = '<defs><style type="text/css"><![CDATA[';
        for(let sheet of document.styleSheets)
            for(let rule of sheet.cssRules)
                styles += ' ' + rule.cssText
        return styles + ']]></style></defs>';
    }

    get visualizationImage() {

        //TODO: This is not working for the moment
        let outputCanvas = document.createElement('svg');
        outputCanvas.innerHTML = this._styles + this.container.html();
        let serializer = new XMLSerializer();
        let result = serializer.serializeToString(outputCanvas);

        if(!result.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
            result = result.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if(!result.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
            result = result.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }

        return '<?xml version="1.0" standalone="no"?>' + result;

    }
}