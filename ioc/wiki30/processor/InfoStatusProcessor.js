define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/StateUpdaterProcessor",
    "dojo/dom"

], function (declare, StateUpdaterProcessor, dom) {
    var ret = declare("ioc.wiki30.processor.InfoStatusProcessor", [StateUpdaterProcessor],
        /**
         * @class ioc.wiki30.processor.InfoStatusProcessor
         * @extends {ioc.wiki30.processor.StateUpdaterProcessor}
         */
        {
            type: "info",

            process: function (value, dispatcher) {
                this._processInfo(value, dispatcher);
                this.inherited(arguments);
            },

            /**
             * Estableix la info al node d'informació del dispatcher.
             *
             * @param {string} info
             * @param {ioc.wiki30.Dispatcher} dispatcher
             *
             * @private
             */
            _processInfo: function (info, dispatcher) {
                dom.byId(dispatcher.infoNodeId).innerHTML = info;
            },

            /**
             * Estableix el valor de la info GloblaState al del valor passat com argument.
             *
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @param {Object.<{id: string, ns: string}>} value
             *
             * @override
             */
            updateState: function (dispatcher, value) {
                dispatcher.getGlobalState().info = value;
            }

        });
    return ret;
});

