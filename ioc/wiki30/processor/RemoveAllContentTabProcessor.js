define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/RemoveAllContentProcessor",
], function (declare, RemoveAllContentProcessor) {
    var ret = declare([RemoveAllContentProcessor],

        /**
         * @class RemoveAllContentTabProcessor
         * @extends RemoveAllContentProcessor
         */
        {
            type: "removeall",

            /**
             * TODO[Xavi] El valor en aquest cas sempre ha de ser buit, no es fa servir
             *
             * @param {*} value
             * @param {Dispatcher} dispatcher
             *
             * @override
             */
            process: function (value, dispatcher) {
                arguments[0] = {container: dispatcher.containerNodeId};
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

