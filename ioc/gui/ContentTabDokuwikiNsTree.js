define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/Request",
    "ioc/gui/NsTreeContainer",
    "dojo/aspect",    
    "dojo/query",
    "dojo/_base/lang"
], function (declare, Request, NsTreeContainer, aspect, query, lang) {
    var ret = declare("ioc.gui.ContentTabDokuwikiNsTree", [NsTreeContainer, Request],

        /**
         * Aquest widget sobreescriu l'onclick a l'arbre.
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
                    if (!nsTree.preventProcessClick){
                        nsTree.item = item;
                        nsTree.query = "id="+item.id;

                        /* Inici fragment nou */
                        if (nsTree.typeDictionary[item.type]) {
                            var type = nsTree.typeDictionary[item.type];
                            nsTree.urlBase = type.urlBase;

                            for (var i=0; i<type.params.length; i++) {
                                nsTree.query += '&' + type.params[i] + '=' + item[type.params[i]];
                            }
                        /* Fi fragment nou */
                        } else if (nsTree.urlBaseTyped[nsTree.item.type]) {
                            nsTree.urlBase = nsTree.urlBaseTyped[nsTree.item.type];
                        }else {
                            nsTree.urlBase = nsTree.urlBaseTyped["*"];
                        }

                        nsTree.sendRequest();
                    }
                };
                var tree = this.tree;
                aspect.after(this.tree, "_adjustWidths", function () {
                    var parentNode = tree.domNode.parentNode;
                    var node = query(".dijitTreeRow", tree.domNode)[0];
                    parentNode.style.width = "" + node.offsetWidth + "px";
                }, true);

                this.watch("urlBase", this.setUrlBaseTypedDefault.bind(this));
                if(this.urlBase){
                    this.setUrlBaseTypedDefault();
                }                
            },
            /** @override */
            updateRendering: function () {
                this.inherited(arguments);
                this.tree._adjustWidths();
            },             
            
            setUrlBaseTypedDefault: function () {
                //console.log('#ContentTabDokuwikiNsTree#setUrlBaseTypedDefault', this.urlBaseTyped);
                if(!this.urlBaseTyped){
                    this.urlBaseTyped = {};
                }
                this.urlBaseTyped['*'] = this.urlBase;
            },
        });
    return ret;
});
