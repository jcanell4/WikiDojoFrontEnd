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
             * @param {string} alert - Missatge que es mostrarà
             * @param {Dispatcher} dispatcher
             * @private
             */
            _process: function (data, dispatcher) {
                alert("works! " + data.timeout);

                // TODO:
                // 1. obtenir el content tool corresponent a data.id del dispatcher
                // 2. Si el timeout es -1 cridar a unlock, el document no ha pogut ser bloquejat
                // 3. Si el timeout es >0 refrescar el lock amb aquesta quanitat de segons

            }
        });
    return ret;
});


