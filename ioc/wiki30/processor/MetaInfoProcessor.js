define([
    "dojo/_base/declare",
    "dijit/registry",
    //"dijit/layout/ContentPane",
    "ioc/gui/ContentTool",
    "ioc/wiki30/processor/AbstractResponseProcessor",
    "ioc/dokuwiki/guiSharedFunctions"
], function (declare, registry, ContentTool, AbstractResponseProcessor, guiSharedFunctions) {
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
                    widgetMetaInfo,
                    cp,
                    m,
                    currentPaneId,
                    defaultSelected,
                    selectedPane,
                    currentMetaContent;


                dispatcher.removeAllChildrenWidgets(nodeMetaInfo);
                for (m in content.meta) {

                    if (widgetCentral && widgetCentral.id === content.id) { // aquesta metainfo pertany a la pestanya activa
                        currentMetaContent = content.meta[m];

                        if (!registry.byId(currentMetaContent.id)) {

                            cp = this._createContentTool(currentMetaContent, dispatcher, content.id);

                            // TODO[Xavi] extreure a un mètode la adició al contenidor
                            nodeMetaInfo.addChild(cp);
                            nodeMetaInfo.resize();
                            guiSharedFunctions.addWatchToMetadataPane(cp, content.id, cp.id, dispatcher);
                            guiSharedFunctions.addChangeListenersToMetadataPane(cp.domNode.id, dispatcher)

                        }
                    }
                }

                currentPaneId = dispatcher.getContentCache(content.id).getCurrentId("metadataPane");
                defaultSelected = content.defaultSelected;

                if (!currentPaneId && defaultSelected) {
                    dispatcher.getContentCache(content.id).setCurrentId("metadataPane", defaultSelected)
                }

                selectedPane = this._setSelectedPane(content.meta, [currentPaneId, defaultSelected]);

                if (selectedPane) {
                    nodeMetaInfo.selectChild(selectedPane);
                    dispatcher.getContentCache(content.id).setCurrentId("metadataPane", selectedPane);
                }

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
            _setSelectedPane: function (metadata, ids) {
                for (var i = 0, len = metadata.length; i < len; i++) {
                    for (var j = 0; j < ids.length; j++) {
                        if (metadata[i]['id'] == ids[j]) {
                            return ids[j]
                        }
                    }
                }
            },

            _convertMetaData: function (content) {
                return {
                    id:    this._buildContentId(content), // El id corresponent a la metadata s'estableix al DokuModelAdapter
                    data:  content.content || ' ',
                    title: content.title
                };
            },

            /**
             * Crea un ContentTool apropiat i el retorna.
             *
             * @param {object} content
             * @param {Dispatcher} dispatcher
             * @returns {ContentTool}
             * @param {string} parentId
             * @private
             */
            _createContentTool: function (content, dispatcher, parentId) {
                var meta = this._convertMetaData(content),
                    contentTool = new ContentTool({
                        id:         meta.id,
                        title:      meta.title,
                        data:       meta.data,
                        dispatcher: dispatcher
                    });

                dispatcher.contentCache[parentId].putMetaData(contentTool);

                return contentTool;
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

