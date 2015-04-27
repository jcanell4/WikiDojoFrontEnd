define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/StateUpdaterProcessor",
], function (declare, StateUpdaterProcessor) {
    var ret = declare([StateUpdaterProcessor],

        /**
         * @class RemoveAllContentProcessor
         * @extends StateUpdaterProcessor
         */
        {
            type: "removeall",

            /**
             *
             * @param {{container: string}} value
             * @param {Dispatcher} dispatcher
             *
             * @override
             */
            process: function (value, dispatcher) {
                dispatcher.removeAllChildrenWidgets(value.container);

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

