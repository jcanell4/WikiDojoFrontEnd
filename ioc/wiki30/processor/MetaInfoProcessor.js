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
            type: "metainfo",

            /**
             * Processa el valor passat com argument per generar un ContentTool i afegir-lo a la secció de metadades.
             *
             * @param {{id: string, meta:Content[]}} value
             * @param {Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {
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
                var nodeMetaInfo = registry.byId(dispatcher.metaInfoNodeId),
                    m,
                    defaultSelected=0,
                    firstPane=1,
                    selectedPane,
                    contentCache = dispatcher.getContentCache(content.id),
                    ret=[null, null];

                // TODO[Xavi] La neteja del container s'hauria de fer a traves del RemoveAllContentProcessor. Compte amb el setCurrentId que deixaría de funcionar!
                nodeMetaInfo.clearContainer(content.id);
                contentCache.setCurrentId("metadataPane", null);


                for (m in content.meta) {
                    this._addMetainfo(content.id, content.meta[m], dispatcher, nodeMetaInfo, content.defaultSelected, ret);
                }

                selectedPane = contentCache.getCurrentId("metadataPane");

                if (!selectedPane && ret[defaultSelected]) {
                    selectedPane = ret[defaultSelected];
                } else if (!selectedPane) {
                    selectedPane = ret[firstPane];
                }

                nodeMetaInfo.selectChild(selectedPane);
                contentCache.setCurrentId("metadataPane", selectedPane);

                return 0;
            },
            
            _addMetainfo:function(id, meta, dispatcher, nodeMetaInfo, needDefault, ret){
                var widgetCentral = registry.byId(dispatcher.containerNodeId).selectedChildWidget,
                    cp,
                    defaultSelected=0,
                    firstPane=1,
                    currentMetaContent;

                if (widgetCentral && widgetCentral.id === id) { // aquesta metainfo pertany a la pestanya activa
                    currentMetaContent = meta;

                    if (!registry.byId(currentMetaContent.id)) { // TODO[Xavi] comprovar si fa falta aquesta comprovació

                        // Afegim la informació extra necessaria per generar el ContentTool
                        currentMetaContent.dispatcher = dispatcher;
                        currentMetaContent.docId = id;

                        cp = this.createContentTool(currentMetaContent);
                        nodeMetaInfo.addChild(cp);

                        if (!ret[firstPane]) {
                            ret[firstPane]= cp.id;
                        }

                        //if (content.defaultSelected) {  //[JOSEP] No entenc aquest instrucció. content arriba amb defaultselected? No serà una de les metadades. O potser el content indica si cal marcar alguna cosa per defecte? He suposat això darrer
                        if (needDefault) {
                            ret[defaultSelected ]= cp.id;
                        }

                    } else {
                        console.error("Ja existeix un ContentTool amb aquest id.");
                    }
                }
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

                return contentToolFactory.generate(contentToolFactory.generation.META, args);
//                    .decorate(contentToolFactory.decoration.META);
            }

        });
});