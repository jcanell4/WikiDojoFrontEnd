define([
    "ioc/wiki30/Dispatcher"
], function (Dispatcher) {
    // TODO[Xavi] Això no pot funcionar, la instance sempre es undefined
    var instance;
    instance = (instance || new Dispatcher());
    return instance;
});


