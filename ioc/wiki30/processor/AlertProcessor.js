define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/AbstractResponseProcessor"
], function (declare, AbstractResponseProcessor) {
    var ret = declare("ioc.wiki30.processor.AlertProcessor", [AbstractResponseProcessor],
        /**
         * @class AlertProcessor
         * @extends AbstractResponseProcessor
         */
        {
            type: "alert",

            /**
             * Processa un missatge de tipus alert el que fa que es configuri un dialeg i es mostri.
             *
             * @param {string} value - Missatge que es mostrarà
             * @param {Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {
                this._processAlert(value, dispatcher);
            },

            /**
             * Configura el dialge amb el text passat com argument i el mostra.
             *
             * @param {string} alert - Missatge que es mostrarà
             * @param {Dispatcher} dispatcher
             * @private
             */
            _processAlert: function (alert, dispatcher) {
                dispatcher.diag.set("title", "ALERTA");
                dispatcher.diag.set("content", alert);
                dispatcher.diag.show();
            }
        });
    return ret;
});


