define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/AbstractResponseProcessor"
], function (declare, AbstractResponseProcessor) {
    var ret = declare("ioc.wiki30.processor.AlertProcessor", [AbstractResponseProcessor],
        /**
         * @class AlertProcessor
         * @extends AbstractResponseProcessor
         */
        {
            type: "alert", // TODO[Xavi] moure la declaració al constructor?

            /**
             * @param {*} value
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {
                this._processAlert(value, dispatcher);
            },

            /**
             * @param {string} alert
             * @param {ioc.wiki30.Dispatcher} dispatcher
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


