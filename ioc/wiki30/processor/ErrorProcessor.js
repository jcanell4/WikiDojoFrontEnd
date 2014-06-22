define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/AbstractResponseProcessor"

], function (declare, AbstractResponseProcessor) {

    var ret = declare("ioc.wiki30.processor.ErrorProcessor", [AbstractResponseProcessor],

        /**
         * @class ioc.wiki30.processor.ErrorProcessor
         * @extends {ioc.wiki30.processor.AbstractResponseProcessor}
         */
        {

            type: "error",

            /**
             * @param {*} value
             * @param {ioc.wiki30.Dispatcher} dispatcher
             *
             * @override
             */
            process: function (value, dispatcher) {
                this._processError(value, dispatcher);
            },

            /**
             * Processa un missatge d'error.
             *
             * @param {string} message
             * @param dispatcher
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


