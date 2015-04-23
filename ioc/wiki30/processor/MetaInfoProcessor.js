define([
    "dojo/_base/declare",
    "dijit/registry",
    "ioc/gui/content/contentToolFactory",
    "ioc/wiki30/processor/AbstractResponseProcessor",


], function (declare, registry, contentToolFactory, AbstractResponseProcessor) {
    var ret = declare([AbstractResponseProcessor],
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
             * @protected
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
                    contentCache = dispatcher.getContentCache(content.id);

                //this.clearContainer(nodeMetaInfo, content.id); // TODO[Xavi] Això haurà de anar al ContainerContentTool
                nodeMetaInfo.clearContainer(content.id);

                contentCache.setCurrentId("metadataPane", null);


                for (m in content.meta) {

                    if (widgetCentral && widgetCentral.id === content.id) { // aquesta metainfo pertany a la pestanya activa
                        currentMetaContent = content.meta[m];

                        if (!registry.byId(currentMetaContent.id)) { // TODO[Xavi] comprovar si fa falta aquesta comprovació

                            cp = this.createContentTool(currentMetaContent, dispatcher, content.id);
                            nodeMetaInfo.addChild(cp);
                            //this.addContentToolToContainer(cp, nodeMetaInfo);

                            if (!firstPane) {
                                firstPane = cp.id;
                            }

                            if (content.defaultSelected) {
                                defaultSelected = cp.id;
                            }

                        } else {
                            console.log("ja existeix");
                            alert("JA EXISTEIX -> comprovar quin es aquest cas i perquè"); // TODO[Xavi] Si no es produeix mai -> esborrar: moure la
                        }
                    }
                }


                selectedPane = contentCache.getCurrentId("metadataPane");

                if (!selectedPane && defaultSelected) {
                    selectedPane = defaultSelected;
                } else if (!selectedPane) {
                    selectedPane = firstPane;

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
             * @param {{id: string, meta:Content[]}} value
             * @protected
             */
            _processContentCache: function (dispatcher, value) {
                // TODO[Xavi] Actulament no es fa servir per a res

            },

            /** @private */
            _convertMetaData: function (content) {
                return {
                    id:     this._buildContentId(content), // El id corresponent a la metadata s'estableix al DokuModelAdapter
                    data:   content.content || ' ',
                    title:  content.title,
                    action: content.action
                };
            },


            /**
             * Crea un ContentTool apropiat i el retorna.
             *
             * @param {object} content
             * @param {Dispatcher} dispatcher
             * @returns {MetaContentTool}
             * @param {string} docId
             * @protected
             */
            createContentTool: function (content, dispatcher, docId) {
                var meta = this._convertMetaData(content),
                    args = {
                        id:         meta.id,
                        title:      meta.title,
                        data:       meta.data,
                        dispatcher: dispatcher,
                        docId:      docId,
                        action:     meta.action
                    };

                return contentToolFactory.generate(contentToolFactory.generation.BASE, args)
                    .decorate(contentToolFactory.decoration.META);
            },

            /**
             * Contrueix la id a partir del content passat com argument. Ens assegurem que només hi ha un punt on ho hem
             * de canviar si volem una estructura diferent.
             *
             * @param content
             * @returns {string}
             * @protected
             */
            _buildContentId:           function (content) {
                return content.id;
            }


        });
    return ret;
});

