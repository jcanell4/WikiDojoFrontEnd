define([
    "dojo/_base/declare",
    "dijit/registry",
    "ioc/gui/content/contentToolFactory",
    "ioc/wiki30/processor/AbstractResponseProcessor"
], function (declare, registry, contentToolFactory, AbstractResponseProcessor) {
    return declare([AbstractResponseProcessor],
        /**
         * Aquesta classe s'encarrega de processar la informació de tipus metadada, generar el ContentTool del tipus
         * adequat i afegirlo al ContainerContentTool que li pertoca.
         *
         * @class MetaInfoProcessor
         * @extends AbstractResponseProcessor
         * @author Josep Cañellas <jcanell4@ioc.cat>, Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "meta",

            /**
             * Processa el valor passat com argument per generar un ContentTool i afegir-lo a la secció de metadades.
             *
             * @param {{id: string, meta:Content[]}} value
             * @param {Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {
                console.log("docid?", value);
                this._processMetaInfo(value, dispatcher);
            },

            /**
             * Elimina tots els widgets del contenidor de metadades i crea un de nou amb la informació del contingut
             * passat com argument.
             *
             * @param {{id: string, meta:Content[]}} content
             * @param {Dispatcher} dispatcher
             * @returns {number} - Sempre es 0
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

                // TODO[Xavi] La neteja del container s'hauria de fer a traves del RemoveAllContentProcessor. Compte amb el setCurrentId que deixaría de funcionar!
                nodeMetaInfo.clearContainer(content.id);
                contentCache.setCurrentId("metadataPane", null);


                for (m in content.meta) {

                    if (widgetCentral && widgetCentral.id === content.id) { // aquesta metainfo pertany a la pestanya activa
                        currentMetaContent = content.meta[m];

                        if (!registry.byId(currentMetaContent.id)) { // TODO[Xavi] comprovar si fa falta aquesta comprovació

                            // Afegim la informació extra necessaria per generar el ContentTool
                            currentMetaContent.dispatcher = dispatcher;
                            currentMetaContent.docId = content.id;

                            cp = this.createContentTool(currentMetaContent);
                            nodeMetaInfo.addChild(cp);

                            if (!firstPane) {
                                firstPane = cp.id;
                            }

                            if (content.defaultSelected) {
                                defaultSelected = cp.id;
                            }

                        } else {
                            console.error("Ja existeix un ContentTool amb aquest id.");
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
             * Crea un ContentTool apropiat i el retorna.
             *
             * @param {Content} metaContent
             * @returns {ContentTool}
             * @protected
             */
            createContentTool: function (metaContent) {
                var args = {
                    id:         metaContent.id,
                    title:      metaContent.title,
                    data:       metaContent.content || ' ',
                    dispatcher: metaContent.dispatcher,
                    docId:      metaContent.docId,
                    action:     metaContent.action
                };

                return contentToolFactory.generate(contentToolFactory.generation.BASE, args)
                    .decorate(contentToolFactory.decoration.META);
            }

        });
});