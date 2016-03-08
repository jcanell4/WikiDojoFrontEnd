define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/AbstractResponseProcessor",
    "dijit/registry"
], function (declare, AbstractResponseProcessor, registry) {
    var ret = declare([AbstractResponseProcessor],

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
               var tree = registry.byId(value.treeId);
               tree.deleteItem(value.itemId);
            },
        });
    return ret;
});