define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/StateUpdaterProcessor",

], function (declare, StateUpdaterProcessor) {
    var ret = declare([StateUpdaterProcessor],
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
                // console.log("InfoStatusProcessor#_processInfo (no fa res)", info);
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
//                console.log("InfoStatusProcessor#updateState", value);
                if (!value || !value.message) {
                    console.error("Error detectact, la info que ha arribat no es vàlida", value);
                    return;
                }
                var infoManager = dispatcher.getInfoManager();
                infoManager.setInfo(value);                
            }

        });
    return ret;
});

