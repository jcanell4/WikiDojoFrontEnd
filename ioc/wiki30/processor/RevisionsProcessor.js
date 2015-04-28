define([
    "dojo/_base/declare",
    "dijit/registry",
    "ioc/wiki30/processor/AbstractResponseProcessor",
    "ioc/gui/content/renderEngineFactory",
    "ioc/gui/content/contentToolFactory"
], function (declare, registry, AbstractResponseProcessor,
             renderEngineFactory, contentToolFactory) {

    // TODO[Xavi] això està aqui a mode de demostració, tots els renders habiutals han d'anar al renderEngineFactory
    // Definim el render engine que emprearem per formatar les revisions
    renderEngineFactory.addRenderEngine('revisions',
        function (data) {
            var html = '',
                linkRev, linkDiff;

            html += '<table>';

            for (var i in data) {

                //link = '?call=page&id=' + data[i]['id']+"&rev="+i;
                linkRev = '?id=' + data[i]['id'] + "&rev=" + i;
                linkRev = '?id=' + data[i]['id'] + "&rev=" + i + "&do='diff'";
                //link = '?id=' + data[i]['id'];

                html += '<tr>';
                html += '<td><a href="' + linkRev + '">' + data[i]['date'] + '</a></td>';
                html += '<td><a href="' + linkDiff + '">';
                html += '<img width="15" height="11" alt="Mostra diferències amb la versió actual"';
                html += 'title="Mostra diferències amb la versió actual" src="/iocjslib/ioc/gui/img/diff.png" />';
                html += '</a></td>';
                html += '<td>' + data[i]['sum'] + '</td>';
                html += '</tr>';
            }

            html += '</table>';

            return html;
        });

    return declare([AbstractResponseProcessor],
        /**
         * Aquesta classe s'encarrega de processar la informació de tipus revisió, generar el ContentTool del tipus
         * adequat per gestionar metadades de revisions i afegirlo al ContainerContentTool que li pertoca.
         *
         * @class RevisionsProcessor
         * @extends AbstractResponseProcessor
         * @author Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            /**
             * @typedef {{id: string, date: string, extra: string?, ip: string, sum: string, type: string,
             *              user: string}} Revision
             */

            /**
             * @typedef {{id: string, revisions: {string: Revision}}} Revisions
             */

            type: "meta",

            /**
             * Processa el valor passat com argument per generar un ContentTool i afegir-lo a la secció de metadades.
             *
             * @param {Revisions} value - Valor per processar que conté tota la informació de les revisions
             * @param {Dispatcher} dispatcher - Dispatcher al que està associat aquesta informació
             * @override
             */
            process: function (value, dispatcher) {
                this._processMetaInfo(value, dispatcher);
            },

            /**
             * Genera i afegeix el ContentTool amb el contingut passat com argument.
             *
             * @param {Revisions} content - Contingut per generar el ContentTool
             * @param {Dispatcher} dispatcher - Dispatcher al que està associat aquest ContentTool
             * @returns {int} - sempre es 0
             * @protected
             */
            _processMetaInfo: function (content, dispatcher) {
                var nodeMetaInfo = registry.byId(dispatcher.metaInfoNodeId),
                    widgetMetaInfo = registry.byId(this._buildContentId(content)),
                    contentTool,
                    selectedPane,
                    contentCache = dispatcher.getContentCache(content.id);


                if (!widgetMetaInfo) {
                    content.dispatcher = dispatcher;

                    contentTool = this.createContentTool(content, dispatcher, content.id);
                    nodeMetaInfo.addChild(contentTool);
                }

                selectedPane = contentCache.getCurrentId("metadataPane");

                if (!selectedPane) {
                    selectedPane = contentTool.id;
                }

                nodeMetaInfo.selectChild(selectedPane);
                contentCache.setCurrentId("metadataPane", selectedPane);

                return 0;
            },

            /**
             * Genera un ContentTool per gestionar les revisions amb les dades rebudes.
             *
             * @param {Revisions} content - Objecte amb tota la informació necessaria per generar el ContentTool
             * @param {Dispatcher} dispatcher - Dispatcher al que està associat aquest ContentTool
             * @param {string} docId - Id del document al que està lligat aquest ContentTool
             * @returns {ContentTool} - ContentTool generat amb les dades passades com argument
             * @protected
             */
            createContentTool: function (content) {
                var count = Object.keys(content.revisions).length,
                    args =
                    {
                        id:         this._buildContentId(content),
                        title:      'Revisions (' + count + ')',
                        data:       content.revisions,
                        type:       'revisions', // TODO[Xavi] Això ha de passar-se desde el server
                        dispatcher: content.dispatcher,
                        docId:      content.id,
                        action:     'view'
                    };

                return contentToolFactory.generate(contentToolFactory.generation.BASE, args)
                    .decorate(contentToolFactory.decoration.REQUEST)
                    .decorate(contentToolFactory.decoration.META);
            },

            /**
             * Contrueix la id a partir del content passat com argument. Ens assegurem que només hi ha un punt on ho hem
             * de canviar si volem una estructura diferent.
             *
             * @param {Revisions} content - Contingut a partir del qual construim la nova id
             * @returns {string} - id específica per aquest ContentTool
             * @private
             */
            _buildContentId: function (content) {
                return content.id + '_revisions';
            }
        });
});