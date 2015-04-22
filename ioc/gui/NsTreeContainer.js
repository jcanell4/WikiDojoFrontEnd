/*
Et proposo dividir la classe actual (ioc/gui/ContentTabDokuwikiNsTree) en dues:

    ioc/gui/NsTreeContainer: igual a ioc/gui/ContentTabDokuwikiNsTree,
    però eliminat la part d'herència el Request + l'onClick

ioc/gui/ContentTabDokuwikiNsTree: que hereti de NsTreeContainer i Request i afegeixi
 la funció onClick orginal per tal que acabi fent el mateix que la implementació actual.

    Un com feta la implementació, a nosaltres ens interessarà la classe ioc/gui/NsTreeContainer i
    caldrà crear una instància programàticament.
     EL datasource d'on treure els nodes de l'arbre és:
     treeDataSource:'lib/plugins/ajaxcommand/ajaxrest.php/ns_tree_rest/.

SI ho implementes correctament, no et caldrà fer massa més canvis.
Només donar el treeDataSource en el moment de fer la instanciació
i fer l'StartUp (imprescindible quan els widgets es creen programaticament.

T'atreveixes? Ànims. Qualsevol dubte ja saps.
*/

define([
    "dojo/_base/declare", // declare
    "dojo/query",
    "dojo/text!./templates/ContentTabDokuwikiNsTree.html",
    "dijit/layout/ContentPane",
    'dijit/layout/_LayoutWidget',
    'dijit/_TemplatedMixin',
    "dojo/store/JsonRest",
    "dijit/Tree",
    "dojo/aspect",
    "dijit/tree/ObjectStoreModel",
    "ioc/wiki30/dispatcherSingleton",
    "dijit/Dialog",
    "dijit/form/Button",
    "dojo/NodeList-dom" // NodeList.style

], function (declare, query, template, ContentPane, _LayoutWidget, _TemplatedMixin, JsonRest, Tree, aspect,
             ObjectStoreModel, dispatcher, Dialog, Button) {
    var ret = declare("ioc.gui.NsTreeContainer", [ContentPane, _TemplatedMixin, _LayoutWidget],

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
            /*,pageDataSource: null*/
            rootValue:      "_",
            tree:           null,
            //       ,widgetsInTemplate: true

            /** @override */
            buildRendering: function () {
                this.inherited(arguments);
                var vid = this.id;
                var tds = this.treeDataSource;
                var root = this.rootValue;
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

                    openOnClick: true

                });
                var tree = this.tree;
                //           this.tree.model.store.query(this.getSectok());
                aspect.after(this.tree, "_adjustWidths", function () {
                    //               tree._adjustWidths();
                    var parentNode = tree.domNode.parentNode;
                    var node = query(".dijitTreeRow", tree.domNode)[0];
                    parentNode.style.width = "" + node.offsetWidth + "px";
                }, true);
            },

            /** @override */
            updateRendering: function () {
                this.inherited(arguments);
                this.tree._adjustWidths();
            },

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
                    sectok = this.getSectok();
                }
                this.tree.model.store.target = this.treeDataSource + sectok + "/";
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
            }

        });
    return ret;
});