
class InputMIDI extends Input {

    constructor() {
        super();
    }

    initialize(tests) {
        this.initializeScales(tests);
        this.initializeDevice();
    }

    initializeScales(tests) {
        this.scales = tests.map(t => {
            return {
                slider: d3.scaleQuantize().domain([0, 127]).range(d3.range(t.tests)),
                knob: d3.scaleQuantize().domain([0, 127]).range(d3.range(t.assertions)),
            }
        });
    }

    initializeDevice() {
        navigator.requestMIDIAccess({sysex: false}).then(
            this.registerToDevice.bind(this), 
            () => { console.error("No access to MIDI devices"); }
        );
    }

    registerToDevice(access) {
        
        //TODO: Reset all controls
        const PREFIX = "nanoKONTROL2";
        let inputs = access.inputs.values();
        
        for(let input = inputs.next(); input && !input.done; input = inputs.next()) { 
        
            let device = input.value;
            if(device.name.startsWith(PREFIX)) {
                device.onmidimessage = this.processMessage.bind(this);
                return;
            }
        }

        console.error("MIDI device not found");
    }

    processMessage(evt) {
        let [command, note, velocity] = evt.data;
        let unit;
        let isSlider = (note >= 0 && note <= 7); // All sliders
        let isKnob = (note >= 16 && note <= 23); // All knobs

        if(isSlider) 
            unit = note;
        else if(isKnob) 
            unit = note - 16;
        else 
            return;

        if(unit < 0 || unit >= this.scales.length)
            return;

        let payload = { unit: unit };
        if(isSlider) payload.tests = this.scales[unit].slider(velocity);
        if(isKnob) payload.assertions = this.scales[unit].knob(velocity);
       
        
        this.callback(payload);
    }

    onInput(callback) {
        this.callback = callback;
    }

}