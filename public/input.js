

const SIGNALS = {
    START: 'start',
    AMPLIFY: 'amplify',
    SAVE: 'save'
}

class Input extends Triggerer {

    constructor() {
        super([SIGNALS.START, SIGNALS.SAVE, SIGNALS.AMPLIFY])
    }

}