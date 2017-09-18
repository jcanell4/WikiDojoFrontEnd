define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/AbstractResponseProcessor",
     "dijit/registry"
], function (declare, AbstractResponseProcessor, Registry) {
    var ret = declare([AbstractResponseProcessor],
        /**
         * @class ContentToolTimerProcessor
         * @extends AbstractResponseProcessor
         */
        {
            type: "timer",

            /**
             * Processa un missatge de tipus alert el que fa que es configuri un dialeg i es mostri.
             *
             * @param {string} value - Missatge que es mostrarà
             * @param {Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {
                var timer = Registry.byId(value.id);
                if(timer){
                    switch (value.action){
                        case "stop":
                            timer.stopTimer();
                            break;
                    }                    
                }
            },

        });
    return ret;
});


