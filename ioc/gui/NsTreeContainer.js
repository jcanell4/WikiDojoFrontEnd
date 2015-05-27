
define([
    "dojo/_base/declare", // declare
    "dojo/text!./templates/ContentTabDokuwikiNsTree.html",
    "dijit/layout/ContentPane",
    'dijit/layout/_LayoutWidget',
    'dijit/_TemplatedMixin',
    "dojo/store/JsonRest",
    "dijit/Tree",
    "dijit/tree/ObjectStoreModel",
    "dojo/NodeList-dom" // NodeList.style
], function (declare, template, ContentPane, _LayoutWidget, _TemplatedMixin, 
                JsonRest, Tree, ObjectStoreModel) {
    var ret = declare([ContentPane, _TemplatedMixin, _LayoutWidget],

        /**
         * Aquest widget afegeix un panell amb un arbre.
         *
         * @class NsTreeContainer
         * @extends dijit.layout.ContentPane
         * @extends dijit._LayoutWidget
         * @extends dijit._TemplatedMixin
         */
        {
            // summary:
            templateString: template,
            treeDataSource: null,
            parameters: undefined,
            onlyDirs: undefined,
            sortBy: undefined,
            /*,pageDataSource: null*/
            rootValue:      "_",
            tree:           null,
            openOnClick: false,
            processOnClickAndOpenOnClick:false,
            
            /** @override */
            buildRendering: function () {
                this.inherited(arguments);
                var vid = this.id;
                var tds = this.treeDataSource;
                var root = this.rootValue;
                var self = this;
                this.tree = new Tree({
                    id: vid + "_nTree",

                    model: new ObjectStoreModel({
                        store: new JsonRest({
                            target: tds,

                        getChildren: function (object) {
                            return this.get(object.id).then(
                                function (fullObject) {
                                    return fullObject.children;
                                },
                                function (error) {/*console.log(error);*/
                                }
                            );
                        }
                        }),

                        getRoot: function (onItem) {
                            this.store.get(root).then(onItem);
                        },

                        mayHaveChildren: function (object) {
                            return object.type === "d";
                        },

                        getLabel: function (object) {
                            return object.name;
                        }
                    }),

                    persist: false,

                    onClick: function(item, node, event){
                        if(self.processOnClickAndOpenOnClick && this.model.mayHaveChildren(item)){
                            this._onExpandoClick({node: node, item: item});
                        }
                    }
                    
                });
//                var tree = this.tree;
//                //           this.tree.model.store.query(this.getSectok());
//                aspect.after(this.tree, "_adjustWidths", function () {
//                    //               tree._adjustWidths();
//                    var parentNode = tree.domNode.parentNode;
//                    var node = query(".dijitTreeRow", tree.domNode)[0];
//                    parentNode.style.width = "" + node.offsetWidth + "px";
//                }, true);

                this.tree.openOnClick= self.openOnClick && !this.processOnClickAndOpenOnClick;
                    

                this.updateSectok();
            },

//            /** @override */
//            updateRendering: function () {
//                this.inherited(arguments);
//                this.tree._adjustWidths();
//            },

            /** @override */
            startup: function () {
                this.inherited(arguments);
                this.tree.placeAt(this.id + "_tree");
                this.tree.startup();
            },


            /**
             * TODO[Xavi] no es crida enlloc, es modifica le valor a updateSectok
             * @param {string} urlStr
             */
            setTreeDatasource: function (/*String*/ urlStr) {
                this.treeDataSource = urlStr;
                this.updateSectok();
            },

            /**
             * TODO[Xavi] S'hauria d'implementar una interficie amb aquest métode, així es podria controlar
             * quins métodes s'afegeixen a toUpdateSectok (o fer un watch directament a sectok
             * @param {string} sectok
             */
            updateSectok: function (sectok) {
                if (!sectok) {
                    if(this.getSectok){
                        sectok = this.getSectok();
                    }else{
                        sectok='0';
                    }
                }
                this._updateParams();                             
                this.tree.model.store.target = this.treeDataSource 
                                                    + sectok 
                                                    + "/"
                                                    + this.parameters;
            },
            
            _updateParams: function(){
                if(!this.parameters){
                    this.parameters="";
                    if(this.sortBy){
                        this.parameters = this.onlyDirs?"t/":"f/";
                        this.parameters += this.sortBy; 
                        this.parameters += "/"; 
                    }else if(this.onlyDirs){
                        this.parameters = "t/";
                    }
                }                  
            },


            /**
             * Elimina i torna a afegir l'arbre.
             *
             * @override
             */
            refresh: function () {
                // Destruct the references to any selected nodes so that
                // the refreshed tree will not attempt to unselect destructed nodes
                // when a new selection is made.
                // These references are contained in Tree.selectedItem,
                // Tree.selectedItems, Tree.selectedNode, and Tree.selectedNodes.
                this.tree.dndController.selectNone();

                //			this.tree.model.store.clearOnClose = true; //no és necessari
                //			this.tree.model.store.close(); produeix error

                // Completely delete every node from the dijit.Tree
                this.tree._itemNodesMap = {};
                this.tree.rootNode.state = "UNCHECKED";
                //			this.tree.model.root.children = null; produeix error

                // Destroy the widget
                this.tree.rootNode.destroyRecursive();

                // Recreate the model, (with the model again)registry.byId
                //			this.tree.model.constructor(dijit.byId(this.tree.id).model);
                //this.tree.model.constructor(registry.byId(this.tree.id).model);
                this.tree.model.constructor(this.tree.model);

                // Rebuild the tree
                this.tree.postMixInProperties();
                this.tree._load();
            },
            
            _openOnClickGetter: function(){
                return this.openOnClick;
            },
            
            _openOnClickSetter:function(value){
                this.openOnClick = value;
                this.tree.set("openOnClick", this.openOnClick && !this.processOnClickAndOpenOnClick);
            },
            
            _processOnClickAndOpenOnClickGetter: function(){
                return this.processOnClickAndOpenOnClick;
            },
            
            _processOnClickAndOpenOnClickSetter:function(value){
                this.processOnClickAndOpenOnClick=value;
                this.tree.set("openOnClick", this.openOnClick && !this.processOnClickAndOpenOnClick);
            }
            

        });
    return ret;
});
