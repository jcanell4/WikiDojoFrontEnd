define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/Request",
    "ioc/gui/NsTreeContainer",
    "dojo/_base/lang"
], function (declare, Request, NsTreeContainer, lang) {
    var ret = declare("ioc.gui.ContentTabDokuwikiNsTree", [NsTreeContainer, Request],

        /**
         * Aquest widget afegeix l'onclick a l'arbre.
         *
         * @class ContentTabDokuwikiNsTree
         * @extends ioc.gui.NsTreeContainer
         * @extends Request
         */
        {
            constructor: function (args) {
                var openOnClick = args.openOnClick? args.openOnClick: true;
                this.set("openOnClick", openOnClick);
            },

            /** @override */
            buildRendering: function () {
                this.inherited(arguments);
                var nsTree = this;
                var oc = lang.hitch(this.tree, this.tree.onClick) ;
                this.tree.onClick = function(item, node){                    
                    oc(arguments);
                    nsTree.item = item;
                    nsTree.query = "id="+item.id;
                    nsTree.sendRequest();
                };
            }
        });
    return ret;
});
