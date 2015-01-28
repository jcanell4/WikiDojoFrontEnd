define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/StateUpdaterProcessor",
    "dojo/query"
], function (declare, StateUpdaterProcessor, query) {
    var ret = declare("ioc.wiki30.processor.RemoveAllContentTabProcessor", [StateUpdaterProcessor],

        /**
         * @class RemoveAllContentTabProcessor
         * @extends StateUpdaterProcessor
         */
        {
            type: "removeall",

            /**
             * @param {*} value
             * @param {Dispatcher} dispatcher
             *
             * @override
             */
            process: function (value, dispatcher) {
                dispatcher.removeAllChildrenWidgets(dispatcher.containerNodeId);
                this.inherited(arguments);
            },

            /**
             * Elimina tots els continguts carregats a la aplicació
             * @param {Dispatcher} dispatcher
             * @param {*} value
             */
            updateState: function (dispatcher, value) {
                dispatcher.contentCache = {};
                dispatcher.getGlobalState().pages = {};
                dispatcher.getGlobalState().currentTabId = null;
            }
        });
    return ret;
});

