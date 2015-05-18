define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/Request",
    "ioc/gui/NsTreeContainer"
], function (declare, Request, NsTreeContainer) {
    var ret = declare("ioc.gui.ContentTabDokuwikiNsTree", [NsTreeContainer, Request],

        /**
         * Aquest widget afegeix l'onclick a l'arbre.
         *
         * @class ContentTabDokuwikiNsTree
         * @extends ioc.gui.NsTreeContainer
         * @extends Request
         */
        {
            /** @override */
            buildRendering: function () {
                this.inherited(arguments);
                var nsTree = this;
                this.tree.onClick = function(item){
                    //if(!this.model.mayHaveChildren(item)){
                        nsTree.item = item;
                        nsTree.query = "id="+item.id;
                        nsTree.sendRequest();
                    //}
                };
                //this.tree.openOnClick=true;
            }
        });
    return ret;
});
