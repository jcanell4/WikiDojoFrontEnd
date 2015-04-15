define([
    "dojo/_base/declare",
    "dijit/registry",
    "ioc/wiki30/processor/AbstractResponseProcessor",
    "ioc/gui/renderEngineFactory",
    "ioc/gui/ContentTool",

], function (declare, registry, AbstractResponseProcessor,
             renderEngineFactory, ContentTool) {

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

    return declare("ioc.wiki30.processor.RevisionsProcessor", [AbstractResponseProcessor],
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
             * @protected
             */
            _processMetaInfo: function (content, dispatcher) {
                var widgetCentral = registry.byId(dispatcher.containerNodeId).selectedChildWidget,
                    nodeMetaInfo = registry.byId(dispatcher.metaInfoNodeId),
                    widgetMetaInfo,
                    cp,
                    selectedPane,
                    contentCache = dispatcher.getContentCache(content.id);

                if (widgetCentral && widgetCentral.id === content.id) { //esta metainfo pertenece a la pestaña activa // TODO[Xavi] comprovar si fa falta aquesta comprovació, la adició del element s'ha de fer sempre, el que s'ha de controlar es si es mostra o no (aixó ha de ser igual al MetaInforProcessor, i ho podem controlar al addChild() del ContentToolContainer

                    widgetMetaInfo = registry.byId(this._buildContentId(content));

                    if (!widgetMetaInfo) {
                        cp = this._createContentTool(content, dispatcher, content.id);
                        this.addContentToolToContainer(cp, nodeMetaInfo);
                    }
                }

                selectedPane = contentCache.getCurrentId("metadataPane");

                if (!selectedPane) {
                    selectedPane = cp.id;
                }

                nodeMetaInfo.selectChild(selectedPane);
                contentCache.setCurrentId("metadataPane", selectedPane);

                return 0;
            },

            /**
             * TODO[Xavi] Els paràmetres estan al contrari que a la resta de mètodes, canviar per consistencia?
             *
             * Afegeix les metadades al contentCache.
             *
             * @param {Dispatcher} dispatcher
             * @param {{docId: string, meta:Content[]}} value
             * @protected
             */
            _processContentCache: function (dispatcher, value) {

                // TODO[Xavi] Actualment no es fa servir per a res
            },

            /**
             * Formata la informació per inicialitzar el ContentTool apropiat
             *
             * @param content
             * @returns {{id: string, data: {object}, title: string, type: string}}
             * @protected
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
             * Crea un MetaContentTool apropiat, l'afegeix al contentCache, i el retorna.
             *
             * @param {object} content
             * @param {Dispatcher} dispatcher
             * @returns {MetaContentTool}
             * @param {string} docId
             * @protected
             */
            _createContentTool: function (content, dispatcher, docId) {
                //var meta = this._convertMetaData(content),
                //    c = new RequestRenderContentTool({
                //        id:         meta.id,
                //        title:      meta.title,
                //        data:       meta.data,
                //        type:       meta.type,
                //        dispatcher: dispatcher,
                //        docId:      docId,
                //        action:     'view'
                //    });


                 var meta = this._convertMetaData(content);
                    return  new ContentTool({
                        id:         meta.id,
                        title:      meta.title,
                        data:       meta.data,
                        type:       meta.type,
                        dispatcher: dispatcher,
                        docId:      docId,
                        action:     'view'
                    }).decorate('request').decorate('meta');

                //return metaContentToolDecorator.decorate(c);
            },

            /**
             * Contrueix la id a partir del content passat com argument. Ens assegurem que només hi ha un punt on ho hem
             * de canviar si volem una estructura diferent.
             *
             * @param {object} content
             * @returns {string}
             * @protected
             */
            _buildContentId:           function (content) {
                return content.id + '_revisions';
            },

            // TODO[Xavi] Això haurà de anar al ContainerContentTool <-- dubplicat a MetaInfoProcessor
            addContentToolToContainer: function (contentTool, container) {
                container.addChild(contentTool);
                container.resize();
            }


        });
});

