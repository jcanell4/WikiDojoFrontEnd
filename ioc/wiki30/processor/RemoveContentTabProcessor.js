define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/StateUpdaterProcessor",
    "dijit/registry"
], function (declare, StateUpdaterProcessor, registry) {
    var ret = declare([StateUpdaterProcessor],

        /**
         * @class RemoveContentTabProcessor
         * @extends StateUpdaterProcessor
         */
        {

            type: "remove",

            /**
             * @param {*} value
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {
                dispatcher.removeWidgetChild(dispatcher.containerNodeId, value); // TODO[Xavi] No existeix aquest mètode al dispatcher
                this.inherited(arguments);
            },


            /**
             *
             * TODO[Xavi] No trobo on es crida
             *
             * @param dispatcher
             * @param value
             */
            updateState: function (dispatcher, value) {
                delete dispatcher.contentCache[value]
                delete dispatcher.getGlobalState().pages[value];
                var container = registry.byId(dispatcher.containerNodeId);
                dispatcher.getGlobalState().currentTabId = container.selectedChildWidget.id;
            }
        });
    return ret;
});

