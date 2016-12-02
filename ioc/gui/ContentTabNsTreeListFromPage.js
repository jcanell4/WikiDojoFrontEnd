define([
    "dojo/_base/declare", // declare
    "dojo/dom-attr",
    "dijit/layout/ContentPane",
    "dojo/query",
    "dojo/dom-construct",
    "ioc/gui/ContentTabDokuwikiNsTree"
], function (declare, att, ContentPane, query, domConstruct, NsTree) {
    var ret = declare("ioc.gui.ContentTabNsTreeListFromPage", [ContentPane],

        /**
         * Converteix enllaços normals en crides AJAX.
         *
         * @class ContentTabDokuwikiPage
         * @extends dijit.layout.ContentPane
         * @extends Request
         */
        {

            /** @override */
            startup: function () {
                this.inherited(arguments);
                /*TO DO: */
                this._render(this.data);
            },            
            setData: function(data){
                this._render(data)
            },
            _render: function(data){
//                var trees = [];
                var render = domConstruct.toDom("<div>"+data+"</div>");
        
                query("a", render).forEach(function(node){
//                    var tree;
                    var treeParams = {};
                    var arr = att.get(node, "href").split("?");            
                    if (arr.length > 1) {
                        var aId = arr[1].split("="),
                             id = aId.length>1?aId[1]:aId[0];
                        treeParams.treeDataSource = this.treeDataSource;
                        treeParams.fromRoot = id;
                        treeParams.sortBy = this.sortBy;
                        treeParams.onlyDirs = this.onlyDirs;
                        treeParams.expandProject = this.expandProject;
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
                            this.query = "id="+this.fromRoot+(item.id?":"+item.id:"");
                            return this.query;
                        };
                    }
                    this.addChild(new NsTree(treeParams));
//                    trees.push(new NsTree(treeParams));
                }.bind(this));                                
            }
        });
    return ret;
});
