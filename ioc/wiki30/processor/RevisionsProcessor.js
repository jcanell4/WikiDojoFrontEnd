define([
    "dojo/_base/declare",
    "dijit/registry",
    "ioc/gui/RequestRenderContentTool",
    "ioc/wiki30/processor/AbstractResponseProcessor",
    "ioc/dokuwiki/guiSharedFunctions",
    "ioc/gui/renderEngineFactory"

], function (declare, registry, RequestRenderContentTool, AbstractResponseProcessor, guiSharedFunctions, renderEngineFactory) {

    // Definim el render engine que emprearem per formatar les revisions TODO[Xavi] això està aqui a mode de demostració, tots els renders habiutals els posarem al RenderEngineFactory.
    renderEngineFactory.addRenderEngine('revisions',
        function (data) {
            var html = '',
                link;


            html += '<table>';

            for (var i in data) {
                link = '?call=page&id=' + data[i]['id'];

                html += '<tr>';
                html += '<td><a href="' + link + '">' + data[i]['date'] + '</a></td>';
                html += '<td>' + data[i]['sum'] + '</td>';
                html += '</tr>';

            }

            html += '</table>';


            return html;
        });

    var ret = declare("ioc.wiki30.processor.RevisionsProcessor", [AbstractResponseProcessor],
        /**
         * @class RevisionsProcessor
         * @extends AbstractResponseProcessor
         * @author Xavier García <xaviergaro.dev@gmail.com>
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
             * @param {{docId: string, meta:Content[]}} content
             * @param {Dispatcher} dispatcher
             * @returns {number} sempre es 0
             * @private
             */
            _processMetaInfo: function (content, dispatcher) {
                var widgetCentral = registry.byId(dispatcher.containerNodeId).selectedChildWidget,
                    nodeMetaInfo = registry.byId(dispatcher.metaInfoNodeId),
                    widgetMetaInfo,
                    cp,
                    currentPaneId,
                    defaultSelected,
                    selectedPane;

                if (widgetCentral && widgetCentral.id === content.id) { //esta metainfo pertenece a la pestaña activa

                    widgetMetaInfo = registry.byId(this._buildContentId(content));

                    if (!widgetMetaInfo) {
                        cp = this._createContentTool(content, dispatcher, content.id);

                        // TODO[Xavi] extreure a un mètode la adició al contenidor <-- COMPTE, aquest bloc està completament duplicat a MetaInfoProcessor
                        nodeMetaInfo.addChild(cp);
                        nodeMetaInfo.resize();

                        guiSharedFunctions.addWatchToMetadataPane(cp, content.id, cp.id, dispatcher);
                        guiSharedFunctions.addChangeListenersToMetadataPane(cp.domNode.id, dispatcher)
                    }
                }

                currentPaneId = dispatcher.getContentCache(content.id).getCurrentId("metadataPane");
                defaultSelected = content.defaultSelected;

                if (!currentPaneId && defaultSelected) {
                    dispatcher.getContentCache(content.id).setCurrentId("metadataPane", defaultSelected)
                }

                if (defaultSelected) {
                    selectedPane = paneId;
                }

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
             * @param {{docId: string, meta:Content[]}} value
             * @private
             */
            _processContentCache: function (dispatcher, value) {

                // TODO[Xavi] Actualment no es fa servir per a res
            },

            /**
             * Formata la informació per inicialitzar el ContentTool apropiat
             *
             * @param content
             * @returns {{id: string, data: {object}, title: string, type: string}}
             * @private
             */
            _convertMetaData: function (content) {
                var count = Object.keys(content.revisions).length;

                return {
                    id:    this._buildContentId(content),
                    data:  content.revisions,
                    title: 'Revisions (' + count + ')',
                    type:  'revisions'
                };
            },


            /**
             * Crea un ContentTool apropiat, l'afegeix al contentCahcie, i el retorna.
             *
             * @param {object} content
             * @param {Dispatcher} dispatcher
             * @returns {ContentTool}
             * @param {string} parentId
             * @private
             */
            _createContentTool: function (content, dispatcher, parentId) {
                var meta = this._convertMetaData(content),
                    contentTool = new RequestRenderContentTool({
                        id:         meta.id,
                        title:      meta.title,
                        data:       meta.data,
                        type:       meta.type,
                        dispatcher: dispatcher
                    });

                dispatcher.contentCache[parentId].putMetaData(contentTool);

                return contentTool;
            },

            /**
             * Contrueix la id a partir del content passat com argument. Ens assegurem que només hi ha un punt on ho hem
             * de canviar si volem una estructura diferent.
             *
             * @param {object} content
             * @returns {string}
             * @private
             */
            _buildContentId: function (content) {
                return content.id + '_revisions';
            }


        });
    return ret;
});

