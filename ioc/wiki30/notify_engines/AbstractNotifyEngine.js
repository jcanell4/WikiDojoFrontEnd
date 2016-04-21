define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver',
], function (declare, EventObserver) {

    var NotifyEngineException = function (message) {
        this.message = message;
        this.name = "NotifyEngineException";
    };

    return declare([EventObserver], {

        constructor: function (args) {
            this.dispatcher = args.dispatcher;
        },

        init: function (args) {
            throw new NotifyEngineException("S'ha d'implementar a la subclasse");
        },

        update: function (args) {
            throw new NotifyEngineException("S'ha d'implementar a la subclasse");
        },

        shutdown: function () {
            throw new NotifyEngineException("S'ha d'implementar a la subclasse");
        }
    });

});
