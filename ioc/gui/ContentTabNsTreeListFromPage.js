define([
    "dojo/_base/declare",
    "dojo/dom-attr",
    "dijit/layout/ContentPane",
    "dojo/query",
    "dojo/dom-construct",
    "ioc/gui/ContentTabDokuwikiNsTree"
], function (declare, att, ContentPane, query, domConstruct, NsTree) {
    /**
     * Construye un array de árboles NsTree, uno por cada directorio
     * (se usa en el tab 'Dreceres')
     */
    var ret = declare("ioc.gui.ContentTabNsTreeListFromPage", [ContentPane], {

        /** @override */
        startup: function () {
            this.inherited(arguments);
            this._render(this.data);
        },            
        setData: function(params){
            this.destroyDescendants();
            this._render(params.data);
        },
        _render: function(data){
            var render = domConstruct.toDom("<div>"+data+"</div>");

            query("a", render).forEach(function(node){
                var treeParams = {};
                var arr = att.get(node, "href").split("?");            
                if (arr.length > 1) {
                    var aId = arr[1].split("=");
                    var id = aId.length>1?aId[1]:aId[0];
                    treeParams.treeDataSource = this.treeDataSource;
                    treeParams.fromRoot = id;
                    treeParams.sortBy = this.sortBy;
                    treeParams.onlyDirs = this.onlyDirs;
                    treeParams.expandProject = this.expandProject;
                    treeParams.processOnClickAndOpenOnClick=this.processOnClickAndOpenOnClick;
                    treeParams.standbyId = this.standbyId;
                    if(this.urlBase){
                        treeParams.urlBase = this.urlBase;    
                    }
                    if(this.typeDictionary){
                        treeParams.typeDictionary = this.typeDictionary;
                    }else if(this.urlBaseTyped){
                        treeParams.urlBaseTyped = this.urlBaseTyped;                    
                    }
                    treeParams.updateQuery = function(item){
                        if(item.id.length===0){
                            this.query = "id="+this.fromRoot;
                        }else{
                            this.query = "id="+item.id;
                        }

                        return this.query;
                    };
                }
                this.addChild(new NsTree(treeParams));
                
            }.bind(this));                                
        },

        refresh: function(extra) {
            if (extra.old_ns) {
                var pattern = new RegExp(extra.old_ns, "g");
                this.setData({"data":this.data.replace(pattern, extra.new_ns)});
            }else if (extra.html_sc) {
                this.setData({"data":extra.html_sc});
            }
        }
    });

    return ret;
});
