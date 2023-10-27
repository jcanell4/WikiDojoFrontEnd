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
                var contentTool = registry.byId(value);
                
                if(contentTool){
                    contentTool.removeContentTool();
                }
                
                var parent = registry.byId(dispatcher.containerNodeId);
                if(parent.hasChildren()){
                    var toSelect = parent.getChildren()[0];
                    parent.selectChild(toSelect);
                }               
            },
        });
    return ret;
});

