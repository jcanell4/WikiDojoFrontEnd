define([
    "dojo/_base/declare",
    "dijit/registry",
    //"dijit/layout/ContentPane",
    "ioc/gui/ContentTool",
    "ioc/wiki30/processor/AbstractResponseProcessor",
    "ioc/dokuwiki/guiSharedFunctions",
    "ioc/gui/metaContentToolFactory",
    "dojo/dom-style",
    'dojo/query',
    'dojo/on',
    'dojo/dom'
], function (declare, registry, ContentTool, AbstractResponseProcessor, guiSharedFunctions, metaContentToolFactory, domStyle, dojoQuery, on, dom) {
    var ret = declare("ioc.wiki30.processor.MetaInfoProcessor", [AbstractResponseProcessor],
        /**
         * @class MetaInfoProcessor
         * @extends AbstractResponseProcessor
         * @author Josep Cañellas <jcanell4@ioc.cat>, Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "meta",

            process: function (value, dispatcher) {
                this._processMetaInfo(value, dispatcher);
                this._processContentCache(dispatcher, value);
            },

            /**
             * Elimina tots els widgets del contenidor de metadades i crea un de nou amb la informació del contingut
             * passat com argument.
             *
             * @param {{id: string, meta:Content[]}} content
             * @param {Dispatcher} dispatcher
             * @returns {number} sempre es 0
             * @private
             */
            _processMetaInfo: function (content, dispatcher) {
                var widgetCentral = registry.byId(dispatcher.containerNodeId).selectedChildWidget,
                    nodeMetaInfo = registry.byId(dispatcher.metaInfoNodeId),
                    cp,
                    m,
                    defaultSelected,
                    selectedPane,
                    firstPane,
                    currentMetaContent,
                    contentCache;


                //dispatcher.removeAllChildrenWidgets(nodeMetaInfo);


                for (m in content.meta) {

                    if (widgetCentral && widgetCentral.id === content.id) { // aquesta metainfo pertany a la pestanya activa
                        currentMetaContent = content.meta[m];

                        if (!registry.byId(currentMetaContent.id)) { // TODO[Xavi] comprovar si fa falta aquesta comprovació

                            cp = this._createContentTool(currentMetaContent, dispatcher, content.id);

                            // TODO[Xavi] extreure a un mètode la adició al contenidor
                            nodeMetaInfo.addChild(cp);
                            nodeMetaInfo.resize();

                            if (!firstPane) {
                                firstPane = cp.id;
                            }

                            if (content.defaultSelected) {
                                defaultSelected = cp.id;
                            }

                            //guiSharedFunctions.addWatchToMetadataPane(cp, content.id, cp.id, dispatcher);
                            guiSharedFunctions.addChangeListenersToMetadataPane(cp.domNode.id, dispatcher)

                        } else {
                            console.log("ja existeix");
                            //alert("JA EXISTEIX!");

                        }
                    }
                }


                contentCache = dispatcher.getContentCache(content.id);
                selectedPane = contentCache.getCurrentId("metadataPane");

                if (selectedPane) {
                    // Es el panell que hem seleccionat abans

                } else if (defaultSelected) {
                    // està marcat per defecte
                    selectedPane = defaultSelected;
                } else {
                    // No hi ha cap marcat, establim el primer com a marcat
                    selectedPane = firstPane;

                }

                nodeMetaInfo.selectChild(selectedPane);

                return 0;
            },

            /**
             * TODO[Xavi] Els paràmetres estan al contrari que a la resta de mètodes, canviar per consistencia?
             *
             * Afegeix les metadades al contentCache.
             *
             * @param {Dispatcher} dispatcher
             * @param {{id: string, meta:Content[]}} value
             * @private
             */
            _processContentCache: function (dispatcher, value) {
                // TODO[Xavi] Actulament no es fa servir per a res

            },

            /**
             * Comprova si existeix algun dels ids passats com arguments a les metadata i retorna la primera
             * coincidencia. L'ordre en que es passen els ids es el mateix en el que es comprovaran, així que s'han de
             * passar en l'ordre d'importancia.
             *
             * @param {Object[]} metadata - Hash amb totes les metadades passades
             * @param {string[]} ids - array amb les ids a comprovar per ordre
             * @private
             */
            //_setSelectedPane: function (metadata, ids) {
            //    for (var i = 0, len = metadata.length; i < len; i++) {
            //        for (var j = 0; j < ids.length; j++) {
            //            if (metadata[i]['id'] == ids[j]) {
            //                return ids[j]
            //            }
            //        }
            //    }
            //},

            _convertMetaData: function (content) {
                return {
                    id:    this._buildContentId(content), // El id corresponent a la metadata s'estableix al DokuModelAdapter
                    data:  content.content || ' ',
                    title: content.title
                };
            },


            _newCreateContentTool: function (content, dispatcher, docId) {
                var meta = this._convertMetaData(content),
                    c = new ContentTool({
                        id:         meta.id,
                        title:      meta.title,
                        data:       meta.data,
                        dispatcher: dispatcher,
                        docId:      docId,
                        action:     'view'
                    });

                return new metaContentToolFactory.buildMetaContentTool(c);

                //return declare.safeMixin(c, new MetaContentTool());

            },

            /**
             * Crea un ContentTool apropiat i el retorna.
             *
             * @param {object} content
             * @param {Dispatcher} dispatcher
             * @returns {ContentTool}
             * @param {string} docId
             * @private
             */
            _createContentTool: function (content, dispatcher, docId) {
                return this._newCreateContentTool(content, dispatcher, docId) ;
                /*

                var meta = this._convertMetaData(content),

                    contentTool = new ContentTool({
                        id:         meta.id,
                        title:      meta.title,
                        data:       meta.data,
                        dispatcher: dispatcher,
                        docId:      docId,
                        action:     'view',


                        postLoad: function () {
                            var self = this;

                            this.registerToEvent("document_closed", function (data) {
                                var parent;

                                if (data.id == self.docId) {
                                    parent = self._getContainer(); // Sí, s'ha de posar dues vegades
                                    parent.removeChild(self);
                                    self.destroyRecursive();
                                }
                            });


                            this.registerToEvent("document_selected", function (data) {
                                var selectedPane,
                                    parent;

                                if (data.id == self.docId && self.domNode && self.action == data.action) {
                                    self.showContent();
                                    selectedPane = self.dispatcher.getContentCache(self.docId).getCurrentId('metadataPane');

                                    console.log("selectedPane:", selectedPane, "id:",self.id);
                                    if (selectedPane == self.id) {
                                        parent = self._getContainer(); // Sí, s'ha de posar dues vegades
                                        parent.selectChild(self);
                                        console.log("child selected");
                                    }
                                }
                            });


                            this.registerToEvent("document_unselected", function (data) {
                                if (data.id == self.docId && self.domNode) {
                                    self.hideContent();
                                }
                            });

                            this.watch("selected", function (name, oldValue, newValue) {
                                var contentCache = this.dispatcher.getContentCache(this.docId);

                                if (newValue) {
                                    console.log("selected POSTLOAD:", this.id);

                                    if (contentCache) {
                                        contentCache.setCurrentId("metadataPane", this.id)
                                    }

                                }
                            })


                        },

                        _getContainer: function() {
                            return this.getParent().getParent();
                        }



                    });

                dispatcher.contentCache[docId].putMetaData(contentTool);

                return contentTool;
                */
            },

            /**
             * Contrueix la id a partir del content passat com argument. Ens assegurem que només hi ha un punt on ho hem
             * de canviar si volem una estructura diferent.
             *
             * @param content
             * @returns {string}
             * @private
             */
            _buildContentId: function (content) {
                return content.id;
            }



        });
    return ret;
});

