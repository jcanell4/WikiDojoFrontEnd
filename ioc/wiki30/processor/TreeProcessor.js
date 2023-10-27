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

            type: "tree",

            /**
             * @param {*} value
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {
                if(value.do == "remove_item"){
                    this._deleteItem(value.treeId, value.itemId);
                }
                if(value.do == "add_item"){
                    this._addItem(value.treeId, value.itemId);
                }
            },
            
            _deleteItem: function(treeId, itemId){
               var tree = registry.byId(treeId);
               tree.deleteNode(itemId);                
            },
            
            _addItem: function(treeId, nsPath){
                var tree = registry.byId(treeId);
                tree.refresh();  //TODO [JOSEP] De moment ho dieixem aixi, pero caldria refrescar nomes la branca, no pas tot l'arbre!
                tree.expandBranche(nsPath);
            }
        });
    return ret;
});