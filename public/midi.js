
function setMIDIInputControl(name, onMessage, onFailure) {
    if(navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({sysex: false}).then((access) => {
            let inputs = access.inputs.values();
            for (var input = inputs.next(); input && !input.done; input = inputs.next()) 
            {
                console.log(input.value.name);
                if(input.value.name.startsWith(name)) {
                    input.value.onmidimessage = onMessage;

                    return;
                }
            }
            onFailure({support: true, granted: true, found: false});
        },
        () => onFailure({support: true, granted: false, found: true}));
    }
    else {
        onFailure({support: false, granted: false, found: false})
    }
}