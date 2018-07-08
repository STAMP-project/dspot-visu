//nanoKontrol2 Interaction code
(function  () {
    
        const DEVICE_PREFIX = "nanoKONTROL2";
    
        let MIDIError = {
            NotSupported: {code: 1, message: "MIDI interaction is not supported in this environment."},
            NoAccess: {code: 2, message: "MIDI access not granted."},
            DeviceNotFound: {code: 4, message: "MIDI device not found."}
        };
    
        function Event() {
    
            this.registeredCallbacks = [];
    
            this.register = function (callback) {
                if(this.registeredCallbacks.indexOf(callback) < 0) {
                    this.registeredCallbacks.push(callback);
                }
            }
    
            this.unregister = function (callback) {
                let index = this.registeredCallbacks.indexOf(callback);
                if(index < 0) return;
                this.registeredCallbacks.splice(index, 1);
            }
    
            this.fire = function () {
                let values = arguments;
                this.registeredCallbacks.forEach(callback => {
                    callback.apply(undefined, values);
                });
            }
        }
    
        let NanoKontrolInput = {
    
            error: new Event(),
    
            message: new Event(),
    
            connect: function () {
                if(!navigator.requestMIDIAccess) {
                    this.error.fire(MIDIError.NotSupported);
                    return;
                }
    
                requestAccess();
            },
        };
    
        function requestAccess() {
            navigator.requestMIDIAccess(
                {sysex: false}).then(registerToDevice,
                () => NanoKontrolInput.error.fire(MIDIError.NoAccess)
            );
        }
    
        function registerToDevice(access) {
            let inputs = access.inputs.values();
            for(let input = inputs.next(); input && !input.done; input = inputs.next()) {
                let device = input.value;
                if(device.name.startsWith(DEVICE_PREFIX)) {
                    device.onmidimessage = processMessage;
                    return;
                }
            }
            NanoKontrolInput.error.fire(MIDIError.DeviceNotFound);
        }
    
        function processMessage(evt) {
            let [command, note, velocity] = evt.data;
            NanoKontrolInput.message.fire(command, note, velocity);
        }
    
        //Exports
        window.NanoKontrolInput = NanoKontrolInput;
    })();