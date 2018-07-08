class Triggerer {

    constructor(signals) {
        this.register = new Map(signals.map( s => [s, []]));
    }

    callbacksFor(signal) {
        if(!this.register.has(signal))
            throw new Error('Unrecognized signal: ' + signal);
        return this.register.get(signal);
    }

    on(signal, callback) {
        this.callbacksFor(signal).push(callback);
    }

    off(signal, callback) {
        let registeredCallbacks = this.callbacksFor(signal)
        let index = registeredCallbacks.indexOf(callback);
        if(index >= 0)
            registeredCallbacks.pop(index);
    }

    trigger(signal, params) {
        for(let receipt of this.callbacksFor(signal))
            receipt(params);
    }

}