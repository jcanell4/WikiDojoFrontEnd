define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/StateUpdaterProcessor",

], function (declare, StateUpdaterProcessor) {
    var ret = declare("ioc.wiki30.processor.InfoStatusProcessor", [StateUpdaterProcessor],
        /**
         * @class InfoStatusProcessor
         * @extends StateUpdaterProcessor
         * @author Josep Cañellas <jcanell4@ioc.cat>, Xavier Garcia <xaviergaro.dev@gmail.com>
         */
        {
            type: "info",

            process: function (value, dispatcher) {
                this._processInfo(value, dispatcher);
                this.inherited(arguments);
            },

            /**
             * @param {Info} info
             * @param {Dispatcher} dispatcher
             *
             * @private
             */
            _processInfo: function (info, dispatcher) {
            },

            /**
             * Estableix el valor de la info GloblaState al del valor passat com argument.
             *
             * @param {Dispatcher} dispatcher
             * @param {Info} value
             *
             * @override
             */
            updateState: function (dispatcher, value) {
                var infoManager = dispatcher.getInfoManager();
                infoManager.setInfo(value);

                if (!value.message) {
                    console.error("Error detectact, la info que ha arribat no es vàlida", info)
                }
            }

        });
    return ret;
});

