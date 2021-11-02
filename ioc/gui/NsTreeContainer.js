define([
    "dojo/_base/declare",
    "dojo/text!./templates/ContentTabDokuwikiNsTree.html",
    "dijit/layout/ContentPane",
    'dijit/layout/_LayoutWidget',
    'dijit/_TemplatedMixin',
    "dojo/store/JsonRest",
    "dojo/store/Observable",
    "dijit/Tree",
    "dijit/tree/ObjectStoreModel",
    "dojo/NodeList-dom" // NodeList.style
], function (declare, template, ContentPane, _LayoutWidget, _TemplatedMixin, 
                JsonRest, Observable, Tree, ObjectStoreModel) {

    /**
     * Aquest widget afegeix un panell amb un arbre.
     *
     * @class NsTreeContainer
     * @extends dijit.layout.ContentPane
     * @extends dijit._LayoutWidget
     * @extends dijit._TemplatedMixin
     */
    var ret = declare("ioc.gui.NsTreeContainer", [ContentPane, _TemplatedMixin, _LayoutWidget], {
        
        templateString: template,
        treeDataSource: null,
        parameters:     undefined,
        sortBy:         undefined,
        onlyDirs:       undefined,
        hiddenProjects: undefined,
        expandProject:  undefined,
        rootValue:      "_",
        tree:           null,
        urlBaseTyped:   undefined,
        openOnClick:                  false,  //TRUE és el valor per defecte en el widget
        processOnClickAndOpenOnClick: false,
        preventProcessClick:          true,
        fromRoot:   undefined,

        /** @override */
        //model.store.target = this.treeDataSource + sectok + "/" + this.parameters;

        buildRendering: function () {
            this.inherited(arguments);
            var vid   = this.id;
            var tds   = this.treeDataSource;
            var root  = this.rootValue;
            var self  = this;
            this.tree = new Tree({
                id: vid + "_nTree",

                model: new ObjectStoreModel({
                    store: new Observable(new JsonRest({
                        target: tds + (self.getSectok ? self.getSectok() : '0')+"/"+self._updateParams(),

                        getChildren: function (object) {
                            return this.get(object.id).then(
                                function (fullObject) {
                                    return fullObject.children;
                                },
                                function (error) {/*console.log(error);*/}
                            );
                        }
                    })),

                    getRoot: function (onItem) {
                        this.store.get(root).then(onItem);
                    },

                    mayHaveChildren: function (object) {
                        var type = object.type.split("#");
                        return type[0] === "d" ||
                               (type[0] === "p" && self.expandProject) ||
                               type[0] === "pd" ||
                               (type[0] === "po" && self.expandProject);
                    },

                    getLabel: function (object) {
                        return object.name;
                    }
                }),

                persist: false,

                onClick: function(params /*{0:{id,name,type},1:{this},2:{mouseEvent click}}*/){
                    var clickOpenAndProcess = self.getProcessOnClickAndOpenOnClick(params[0].type);
                    var clickOpen = this.model.mayHaveChildren(params[0]) || clickOpenAndProcess;
                    if (clickOpen) {
                        this._onExpandoClick({node: params[1], item: params[0]});
                    }
                    self.preventProcessClick = clickOpen && !clickOpenAndProcess;
                }
            });

            this.tree.openOnClick = this.openOnClick && !this.getProcessOnClickAndOpenOnClick();

            this.tree.getIconClassOrig = this.tree.getIconClass;

            var self = this;

            this.tree.getIconClass = function(item, opened) {
                var ret = this.getIconClassOrig(item, opened);
                var type = item.type.split("#");
                if (type[0] === "p") {
                    ret = (opened && self.expandProject) ? "iocIconProjectOpened" : "iocIconProjectClosed";
                }else if (type[0] === "po") {
                    ret = (opened && self.expandProject) ? "dijitIconBookmark" : "dijitIconChart";
                }else if (type[0] === "s") {
                    ret = (opened && self.expandProject) ? "dijitIconKey" : "dijitIconConfigure";
                }
                return ret;
            };

            this.updateSectok();
        },

        /** @override */
        startup: function () {
            this.inherited(arguments);
            this.tree.placeAt(this.id + "_tree");
            this.tree.startup();
        },

        getProcessOnClickAndOpenOnClick: function(parm) {
            var ret;
            if (typeof this.processOnClickAndOpenOnClick === "function" && parm) {
                ret = this.processOnClickAndOpenOnClick(parm);
            }else if(Array.isArray(this.processOnClickAndOpenOnClick) && parm){
                ret = false;
                for(var i=0; !ret && i<this.processOnClickAndOpenOnClick.length; i++){
                    ret = parm===this.processOnClickAndOpenOnClick[i];
                }
            }
            else
                ret = this.processOnClickAndOpenOnClick;
            return ret;
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
                sectok = this.getSectok ? this.getSectok() : '0';
            }
            this._updateParams();                             
            this.tree.model.store.target = this.treeDataSource 
                                                + sectok 
                                                + "/"
                                                + this.parameters;
        },

        _updateParams: function() {
            if (!this.parameters) {
                this.parameters = (this.sortBy ? "" + this.sortBy + "/" : "0/") 
                                        + (this.onlyDirs ? "t/" : "f/") 
                                        + (this.expandProject ? "t/" : "f/")
                                        + (this.hiddenProjects ? "t/" : "f/")
                                        + (this.fromRoot ? this.fromRoot + "/" : "");
            }
            return this.parameters;
        },

        /**
         * Elimina i torna a afegir l'arbre.
         * @override
         */
        refresh: function () {
            // TODO[Xavi] revisar, produeix l'error inicial en refrescar el tree (quan es passa per paràmetre)
            console.warn("Alerta! aquí es produeix l'error inicial de Dojo");

            // Destruct the references to any selected nodes so that
            // the refreshed tree will not attempt to unselect destructed nodes
            // when a new selection is made.
            // These references are contained in Tree.selectedItem,
            // Tree.selectedItems, Tree.selectedNode, and Tree.selectedNodes.
            this.parameters = false;
            this.tree.dndController.selectNone();

            // Completely delete every node from the dijit.Tree
            this.tree._itemNodesMap = {};
            this.tree.rootNode.state = "UNCHECKED";

            // Destroy the widget
            this.tree.rootNode.destroyRecursive();

            // Recreate the model, (with the model again)registry.byId
            this.tree.model.constructor(this.tree.model);

            // Rebuild the tree
            this.tree.postMixInProperties();
            this.tree._load();
        },

        deleteNode: function(nsPath){
            if(this.tree._itemNodesMap && this.tree._itemNodesMap[nsPath]){
                this.tree.dndController.selectNone();
                this.tree._itemNodesMap[nsPath][0].destroyRecursive();
                delete this.tree._itemNodesMap[nsPath];
            }                
        },

        expandBranche: function(nsPath){
            var stPath="";
            var aPath = nsPath.split(':');
            aPath.unshift("");
            for (var i=0;i<aPath.length;i++) {
                if (i > 1) {
                    stPath = stPath + ":";
                }
                stPath = stPath + aPath[i];
                aPath[i]=stPath;
            }

            this.tree.set("path", aPath);
        },

        _openOnClickGetter: function(){
            return this.openOnClick;
        },

        _openOnClickSetter:function(value){
            this.openOnClick = value;
            this.tree.set("openOnClick", this.openOnClick && !this.getProcessOnClickAndOpenOnClick());
        },

        _processOnClickAndOpenOnClickGetter: function(){
            return this.getProcessOnClickAndOpenOnClick();
        },

        _processOnClickAndOpenOnClickSetter:function(value){
            this.processOnClickAndOpenOnClick=value;
            this.tree.set("openOnClick", this.openOnClick && !this.processOnClickAndOpenOnClick);
        }

    });
        
    return ret;
});
