define([
    "dojo/_base/declare",
    "ioc/wiki30/Request",
    "ioc/gui/NsTreeContainer",
    "dojo/aspect",    
    "dojo/query",
    "dojo/_base/lang"
], function (declare, Request, NsTreeContainer, aspect, query, lang) {
    /**
     * Aquest widget sobreescriu l'onclick a l'arbre.
     *
     * @class ContentTabDokuwikiNsTree
     * @extends ioc.gui.NsTreeContainer
     * @extends Request
     */
    var ret = declare("ioc.gui.ContentTabDokuwikiNsTree", [NsTreeContainer, Request],
        {
        constructor: function (args) {
            this.inherited(arguments);
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
                    if (nsTree.updateQuery){
                        nsTree.query = nsTree.updateQuery(item);
                    }else{
                        nsTree.query = "id="+item.id;
                    }

                    if (nsTree.typeDictionary && nsTree.typeDictionary[item.type]) {
                        var type = nsTree.typeDictionary[item.type];
                        nsTree.urlBase = type.urlBase;
                        for (var i=0; i<type.params.length; i++) {
                            nsTree.query += '&' + type.params[i] + '=' + item[type.params[i]];
                        }
                    }else{
                        if (nsTree.urlBaseTyped[nsTree.item.type]) {
                            nsTree.urlBase = nsTree.urlBaseTyped[nsTree.item.type];
                        }
                        else {
                            nsTree.urlBase = nsTree.urlBaseTyped["*"];
                        }

                        if (item.nsproject) {
                            nsTree.query += "&projectOwner="+item.nsproject;
                        }

                        if (item.projectType) {
                            nsTree.query += "&projectSourceType="+item.projectType;
                        }
                    }


                    //console.log("ContentTabDokuwikiNsTree#buildRendering::nsTree.query:", nsTree.query);
                    nsTree.sendRequest();
                }
            };

            var tree = this.tree;
            aspect.after(this.tree, "_adjustWidths", function () {
                var parentNode;
                var node;

                parentNode = tree.domNode.parentNode;
                if (!parentNode){
                    return;
                }
                node = query(".dijitTreeRow", tree.domNode)[0];

                if (node && parentNode.offsetWidth<node.offsetWidth) {
                    parentNode.style.width = "" + node.offsetWidth + "px";
                }else if(node) {
                    if (parentNode.offsetWidth>node.offsetWidth){
                        parentNode.style.width = node.offsetWidth;
                    }
                }else{
                    parentNode.style.width="100%";
                }

            }, true);

            this.watch("urlBase", this.setUrlBaseTypedDefault.bind(this));
            if (this.urlBase){
                this.setUrlBaseTypedDefault();
            }                
        },
        /** @override */
        updateRendering: function () {
            this.inherited(arguments);
            this.tree._adjustWidths();
        },             

        setUrlBaseTypedDefault: function () {
            if(!this.urlBaseTyped){
                this.urlBaseTyped = {};
            }
            this.urlBaseTyped['*'] = this.urlBase;
        },
        resize:function(changeSize,resultSize){
            this.updateRendering();
        }
    });
    return ret;
});
