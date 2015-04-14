define([
    "dojo/_base/declare",
    "dijit/registry",
    "ioc/gui/ContentTool",
    "ioc/wiki30/processor/AbstractResponseProcessor",
    "ioc/gui/metaContentToolDecorator"
], function (declare, registry, ContentTool, AbstractResponseProcessor, metaContentToolDecorator) {
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

                this.clearContainer(nodeMetaInfo, content.id); // TODO[Xavi] Això haurà de anar al ContainerContentTool
                contentCache.setCurrentId("metadataPane", null);


                for (m in content.meta) {

                    if (widgetCentral && widgetCentral.id === content.id) { // aquesta metainfo pertany a la pestanya activa
                        currentMetaContent = content.meta[m];

                        if (!registry.byId(currentMetaContent.id)) { // TODO[Xavi] comprovar si fa falta aquesta comprovació

                            cp = this._createContentTool(currentMetaContent, dispatcher, content.id);
                            this.addContentToolToContainer(cp, nodeMetaInfo);

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
            _createContentTool: function (content, dispatcher, docId) {
                var meta = this._convertMetaData(content),
                    c = new ContentTool({
                        id:         meta.id,
                        title:      meta.title,
                        data:       meta.data,
                        dispatcher: dispatcher,
                        docId:      docId,
                        action:     meta.action
                    });

                return c.decorate('meta');
                //return metaContentToolDecorator.decorate(c);

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
            },

            // TODO[Xavi] Això haurà de anar al ContainerContentTool
            clearContainer:            function (container, docId) {
                var children = container.getChildren();


                for (var child in children) {
                    if (children[child].docId == docId) {
                        children[child].removeContentTool();
                    }
                }
            },

            // TODO[Xavi] Això haurà de anar al ContainerContentTool
            addContentToolToContainer: function (contentTool, container) {
                container.addChild(contentTool);
                container.resize();
            }


        });
    return ret;
});

