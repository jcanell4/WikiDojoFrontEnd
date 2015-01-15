define([
    "dojo/_base/declare",
    "dijit/registry", //search widgets by id
    "dojo/dom",
    "dijit/layout/ContentPane",
    "ioc/wiki30/processor/AbstractResponseProcessor",
    "dojo/query",
    "dojo/on",
    "ioc/wiki30/GlobalState",
], function (declare, registry, dom, ContentPane, AbstractResponseProcessor, dojoQuery, on, globalState) {
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
             * @param {{docId: string, meta:[{content: string, id: string, title: string}]}} content
             * @param {Dispatcher} dispatcher
             * @returns {number} sempre es 0
             * @private
             */
            _processMetaInfo: function (content, dispatcher) {
                var widgetCentral = registry.byId(dispatcher.containerNodeId).selectedChildWidget,
                    nodeMetaInfo = registry.byId(dispatcher.metaInfoNodeId),
                    widgetMetaInfo,
                    cp,
                    m,
                    currentPaneId,
                    defaultSelected,
                    selectedPane;

                dispatcher.getContentCache(content.docId).removeAllMetaData();
                dispatcher.removeAllChildrenWidgets(nodeMetaInfo);
                for (m in content.meta) {
                    if (widgetCentral && widgetCentral.id === content.docId) { //esta metainfo pertenece a la pestaña activa
                        widgetMetaInfo = registry.byId(content.meta[m].id);
                        if (!widgetMetaInfo) {
                            /*Construeix un nou contenidor de meta-info*/
                            cp = new ContentPane({
                                id:      content.meta[m].id,
                                title:   content.meta[m].title,
                                content: content.meta[m].content
                            });
                            nodeMetaInfo.addChild(cp);
                            nodeMetaInfo.resize();
                            this._addWatchToPane(cp, content.docId, cp.id, dispatcher);
                            this._addChangeListenersToPane(cp.domNode.id, dispatcher)
                        } else {
                            nodeMetaInfo.selectChild(widgetMetaInfo);
                            var node = dom.byId(content.meta[m].id);
                            node.innerHTML = content.meta[m].content;
                        }
                    }
                }


                currentPaneId = dispatcher.getContentCache(content.docId).currentAccordionPaneId;
                defaultSelected = content.defaultSelected;

                if (!currentPaneId && defaultSelected) {
                    dispatcher.getContentCache(content.docId).currentAccordionPaneId = defaultSelected
                }

                selectedPane = this._setSelectedPane(content.meta, [currentPaneId, defaultSelected]);

                if (selectedPane) {
                    nodeMetaInfo.selectChild(selectedPane);
                    dispatcher.getContentCache(content.docId).currentAccordionPaneId = selectedPane;
                }

                return 0;
            },

            /**
             * TODO[Xavi] Els paràmetres estan al contrari que a la resta de mètdoes, canviar per consistencia?
             *
             * Afegeix les metadades al contentCache.
             *
             * @param {Dispatcher} dispatcher
             * @param {{docId: string, meta:[{content: string, id: string, title: string}]}} value
             * @private
             */
            _processContentCache: function (dispatcher, value) {
                if (dispatcher.contentCache[value.docId]) {
                    var meta = value.meta;
                    for (var i = 0; i < meta.length; i++) {
                        dispatcher.contentCache[value.docId].putMetaData(meta[i]);
                    }
                }
            },

            /**
             * Afegeix un watch al panell per controlar quan s'ha clicat i fa persistent el canvi al ContentCache.
             *
             * @param {Object} node - Dijit al que s'aplica el watch
             * @param {string} documentId - id del document al que està enllaçat aquest panell
             * @param {string} paneId - id del panell seleccionat
             * @param {Dispatcher} dispatcher
             * @private
             */
            _addWatchToPane: function (node, documentId, paneId, dispatcher) {

                node.watch("selected", function (name, oldValue, newValue) {
                    if (newValue) {
                        dispatcher.getContentCache(documentId).currentAccordionPaneId = paneId;

                        //alert("Set Current Pane for: " + documentId + " to: " + paneId)
                    }
                })
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
            _setSelectedPane: function (metadata, ids) {
                for (var i = 0; i < ids.length; i++) {
                    if (metadata[ids[i]]) {
                        return ids[i]
                    }
                }
            },

            /**
             * Afegeix un listener a tots els elements de tipus input del panell que actualitzará les metadades
             * relacionadas al ContentCache amb els canvis fets.
             *
             * Actualitza els valors checked i value, si el tipus del element no es basa en aquests valors (per exemple
             * radio buttons) no tindrá l'efecte esperat.
             *
             * @param {string} paneId - id del panell de metadades
             * @param {Dispatcher} dispatcher
             * @private
             */
            _addChangeListenersToPane: function (paneId, dispatcher) {
                var nodeList = dojoQuery("#" + paneId + " input");

                nodeList.forEach(function (node) {
                    on(node, 'change', function (evt) {
                        var currentTab = globalState.getCurrentId(),
                            changedNode;

                        node.setAttribute("value", evt.target.value);
                        node.setAttribute("checked", evt.target.checked);
                        changedNode = dom.byId(paneId).innerHTML;

                        dispatcher.getContentCache(currentTab).replaceMetaDataContent(paneId, changedNode)
                    })
                });
            }

        });
    return ret;
});

