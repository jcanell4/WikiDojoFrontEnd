define([
    "dojo/_base/declare",
    "dijit/registry",
    "ioc/wiki30/processor/AbstractResponseProcessor",
    "ioc/gui/content/contentToolFactory"
], function (declare, registry, AbstractResponseProcessor, contentToolFactory) {

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
             * @returns {ContentTool} - ContentTool generat amb les dades passades com argument
             * @protected
             */
            createContentTool: function (content) {
                var count = Object.keys(content.revisions).length,

                    args = {
                        id:         this._buildContentId(content),
                        title:      'Revisions (' + count + ')',
                        data:       content.revisions,
                        type:       'revisions', // TODO[Xavi] Això ha de passar-se desde el server
                        dispatcher: content.dispatcher,
                        docId:      content.id,
                        action:     'view'
                    },

                    argsRequestLink = {
                        urlBase: "lib/plugins/ajaxcommand/ajax.php?call=page" // TODO[Xavi] aquest valor ha d'arribar des de el servidor
                    };


                return contentToolFactory.generate(contentToolFactory.generation.BASE, args)
                    .decorate(contentToolFactory.decoration.REQUEST_FORM)
                    .decorate(contentToolFactory.decoration.REQUEST_LINK, argsRequestLink)
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