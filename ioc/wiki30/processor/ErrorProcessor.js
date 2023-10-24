define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/AbstractResponseProcessor"

], function (declare, AbstractResponseProcessor) {

    var ret = declare([AbstractResponseProcessor],
        /**
         * @class ErrorProcessor
         * @extends AbstractResponseProcessor
         */
        {
            type: "error",

            /**
             * @param {*} value
             * @param {Dispatcher} dispatcher
             *
             * @override
             */
            process: function (value, dispatcher) {
                this._processError(value.message, dispatcher);
            },

            /**
             * Processa un missatge d'error.
             *
             * @param {string} message
             * @param {Dispatcher} dispatcher
             * @private
             */
            _processError: function (message, dispatcher) {
                dispatcher.diag.set("title", "ERROR");
                dispatcher.diag.set("content", message);
                dispatcher.diag.show();
            }
        });
    return ret;
});


