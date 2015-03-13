define([
    "dojo/_base/declare",
    "dijit/registry",
    "ioc/gui/IocContentPane",
    "ioc/wiki30/processor/AbstractResponseProcessor",
    "ioc/dokuwiki/guiSharedFunctions",
    "ioc/gui/renderEngineFactory",


], function (declare, registry, ContentPane, AbstractResponseProcessor, guiSharedFunctions, renderEngineFactory, Request, dom, on) {

    // Definim el render engine que emprearem per formatar les revisions
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

    var ret = declare("ioc.wiki30.processor.MetaInfoProcessor", [AbstractResponseProcessor],
        /**
         * @class RevisionsProcessor
         * @extends AbstractResponseProcessor
         * @author Josep Cañellas <jcanell4@ioc.cat>, Xavier García <xaviergaro.dev@gmail.com>
         */
        {


            type: "meta",

            process: function (value, dispatcher) {
                this._processMetaInfo(value, dispatcher);
                alert("fin de processmetainfo");
                this._processContentCache(dispatcher, value);
                alert("fin de processcontentcache");
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
                    m,
                    currentPaneId,
                    defaultSelected,
                    selectedPane;


                if (widgetCentral && widgetCentral.id === content.id) { //esta metainfo pertenece a la pestaña activa

                    var paneId = content.id + '_revisions'; // per diferenciar del panell de metainfo afegim el _revisions
                    widgetMetaInfo = registry.byId(paneId);
                    var count = Object.keys(content.revisions).length;


                    if (!widgetMetaInfo) {
                        /*Construeix un nou contenidor de meta-info*/

                        console.log("update toc");

                        cp = new ContentPane({
                            id:         paneId,
                            title:      'Revisions (' + count + ')',
                            data:       content.revisions,
                            type:       'revisions',
                            dispatcher: dispatcher
                            //content: guiSharedFunctions.generateRevisionsHtml(content.revisions)
                        });
                        nodeMetaInfo.addChild(cp);
                        nodeMetaInfo.resize();


                        dispatcher.toUpdateSectok.push(cp);
                        //cp.updateSectok(); // TODO[Xavi] Comprovar que això funcioni al doc page no es fa?

                        var contentCache = dispatcher.getContentCache(content.id);

                        contentCache.cp = cp ;

                        console.log("Content Cache: ", contentCache.cp);

                        guiSharedFunctions.addWatchToMetadataPane(cp, content.id, cp.id, dispatcher);
                        guiSharedFunctions.addChangeListenersToMetadataPane(cp.domNode.id, dispatcher)
                    }
                }
                //}

                currentPaneId = dispatcher.getContentCache(content.id).getCurrentId("metadataPane");
                defaultSelected = content.defaultSelected;

                //alert("ok 1");
                if (!currentPaneId && defaultSelected) {
                    dispatcher.getContentCache(content.id).setCurrentId("metadataPane", defaultSelected)
                }


                // Això no cal en aquest cas?
                /*
                 console.log("mira aquí que está el error:")
                 selectedPane = this._setSelectedPane(content.revisions, [currentPaneId, defaultSelected]);
                 */

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
                /*
                 dispatcher.getContentCache(value.id).removeAllMetaData();

                 if (dispatcher.contentCache[value.id]) {
                 var meta = value.revisions;

                 for (var i = 0; i < meta.length; i++) {
                 dispatcher.contentCache[value.id].putMetaData(meta[i]);
                 }
                 }*/
                dispatcher.contentCache[value.id].putMetaData(guiSharedFunctions.generateRevisionsHtml(content.revisions));
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


        });
    return ret;
});

