
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

}

class Controller {

    constructor(visualization, controlPanel, inputManager) {
        this.visualization = visualization;
        this.controlPanel = controlPanel;
        this.inputManager = inputManager;
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
        .then(this.initialMutantStatus.bind(this));
    }

    acceptInput() {
        console.log("Ready to accept input");
        this.inputManager.onInput(this.onInput.bind(this));
    }

    initializeMutants(data) {
        // debugger;
        this.mutantById = {};
        let self = this;
        this.mutants = data.map(record => {
            record.status = new MutantStatus();
            self.mutantById[record.id] = record;
            return record;  
        });
    }

    initialMutantStatus() {
        console.log("Getting the initial state for mutants");
        const self = this;

        let requests = this.tests.map( test =>
            $.ajax(`/project/${PROJECT}/detection/${test.name}/${test.amplification.assertions}/${test.amplification.tests}/`)
            .then((data) => {
                self.updateMutants(data);
                self.visualization.update(); //TODO: This should be done at the end
            })
        )
        Promise.all(requests).then(this.acceptInput.bind(this));
    }

    initializeTests(data) {
        this.tests = data.map( record => {
            record.amplification = {tests: 0, assertions: 0};
            return record;
        });
    }

    onInput(input) { //TODO: Rethink this. Probably set events for the input manager instead of a callback
        if(input.command !== undefined) 
            this.handleCommand(input);
        else if(input.unit !== undefined) 
            this.handleAmplificationUnit(input);
    }


    handleAmplificationUnit(input) {

        if(input.unit >= this.tests.length) return;

        let test = this.tests[input.unit];
        let currentAmplification = test.amplification;

        let params = {tests: currentAmplification.tests, assertions: currentAmplification.assertions };
        // debugger;
        const validate = (field) => {
            if(input[field] === undefined) return;
            if(input[field] < 0 || input[field] >= test[field]) {
                console.error(`Wrong ${field} value: ${input[field]} not in [0,${test[field]}) for ${test.name}`);
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
            .then((data) => {
                self.updateMutants(data);
                self.visualization.update();
            });
    }

    handleCommand(input) {
        console.log(this.visualization.image);
    }
    

    updateMutants(data) {
        for(let mutant of this.mutants) {
            mutant.status.remove(data.name);
        }
        for(let record of data.mutants) {
            let mutant = this.mutantById[record.id];

            if(record.detected) {
                mutant.status.addDetection(data.name);
            }
            else {
                mutant.status.addCoverage(data.name);
            }
        }
    }
}