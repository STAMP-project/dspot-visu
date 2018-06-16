class InputKeyboard extends Input {

    constructor() {
        super(); //TODO: Add Signals for save and start.

        this.keyMapping = {
            33: {unit: 0, attr: "assertions", delta: -1},
            64: {unit: 0, attr: "assertions", delta:  1},
            35: {unit: 1, attr: "assertions", delta: -1},
            36: {unit: 1, attr: "assertions", delta:  1},
            37: {unit: 2, attr: "assertions", delta: -1},
            94: {unit: 2, attr: "assertions", delta:  1},
            38: {unit: 3, attr: "assertions", delta: -1},
            42: {unit: 3, attr: "assertions", delta:  1},
            
            49: {unit: 0, attr: "tests", delta: -1},
            50: {unit: 0, attr: "tests", delta:  1},
            51: {unit: 1, attr: "tests", delta: -1},
            52: {unit: 1, attr: "tests", delta:  1},
            53: {unit: 2, attr: "tests", delta: -1},
            54: {unit: 2, attr: "tests", delta:  1},
            55: {unit: 3, attr: "tests", delta: -1},
            56: {unit: 3, attr: "tests", delta:  1},

        };
    }


    initialize(tests) {
        this.inputs = tests.map(t => {
            console.log(t);
           return {
               tests: 0,
               topTests: t.tests,
               assertions: 0,
               topAssertions: t.assertions,
           };
        });

        window.onkeypress = this.processEvent.bind(this);
    }

    processEvent(evt) {

        if(evt.keyCode === 32) {
            this.trigger(SIGNALS.START);
            return;
        }

        if(evt.keyCode === 19 && evt.ctrlKey) {
            this.trigger(SIGNALS.SAVE);
            return;
        }

        let parameters = this.keyMapping[evt.keyCode];
        if(parameters === undefined) return;
        
        if(parameters.unit >= this.inputs.length)
        return;
        
        let unit = this.inputs[parameters.unit];
        let value = unit[parameters.attr] + parameters.delta;
        let topAttr = 'top' + parameters.attr[0].toUpperCase() + parameters.attr.slice(1);
        if(value < 0 || value >= unit[topAttr])
            return; //Out of bound
        let message = {unit: parameters.unit};
        message[parameters.attr] = value;
        unit[parameters.attr] = value; //TODO: This should be done in the controller

        this.trigger(SIGNALS.AMPLIFY, message);
    }
}