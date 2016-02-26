define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/AbstractResponseProcessor"
], function (declare, AbstractResponseProcessor) {
    var ret = declare([AbstractResponseProcessor],
        /**
         * @class LockDataProcessor
         * @extends AbstractResponseProcessor
         * @author Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "lock_data",

            /**
             * Processa un missatge de tipus lock_data que actualitza el bloqueig corresponent
             *
             * @param {string} value - Missatge que es mostrarà
             * @param {Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {
                this._process(value, dispatcher);
            },

            /**
             * Configura el dialge amb el text passat com argument i el mostra.
             *
             * @param data
             * @param {Dispatcher} dispatcher
             * @private
             */
            _process: function (data, dispatcher) {
                //console.log("LockDataProcessor#_process", data);
                dispatcher.getLockManager().update(data); //arriba en segons
            }
        });
    return ret;
});


