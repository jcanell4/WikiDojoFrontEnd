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
                //defaultSelected=0,
                //firstPane=1,
                    selectedPane,
                    contentCache = dispatcher.getContentCache(content.id),
                    ret = {};

//                console.log("Quina es la id del metaInfonode?", dispatcher.metaInfoNodeId);

                // TODO[Xavi] La neteja del container s'hauria de fer a traves del RemoveAllContentProcessor. Compte amb el setCurrentId que deixaría de funcionar!

                if (!nodeMetaInfo) {
                    alert("Alerta, s'ha creat el metaInfoNodeId?" + dispatcher.metaInfoNodeId);
                }else {
                    nodeMetaInfo.clearContainer(content.id);
                }

                contentCache.setCurrentId("metadataPane", null);

                for (m in content.meta) {
                    //console.log("Meta type:", content.meta[m].type);
                    this._addMetainfo(content.id, content.meta[m], dispatcher, nodeMetaInfo, ret);
                }

                selectedPane = contentCache.getCurrentId("metadataPane");

                if (!selectedPane && ret.defaultSelected) {
                    selectedPane = ret.defaultSelected;
                } else if (!selectedPane) {
                    selectedPane = ret.firstPane;
                }

                nodeMetaInfo.selectChild(selectedPane);
                contentCache.setCurrentId("metadataPane", selectedPane);

                return 0;
            },

            _addMetainfo: function (id, meta, dispatcher, nodeMetaInfo, ret) {
                var widgetCentral = registry.byId(dispatcher.containerNodeId).selectedChildWidget,
                    cp,
                //defaultSelected=0,
                //firstPane=1,
                    currentMetaItem,
                    currentMetaContent;

                if (widgetCentral && widgetCentral.id === id) { // aquesta metainfo pertany a la pestanya activa
                    currentMetaContent = meta;

                    currentMetaItem = registry.byId(currentMetaContent.id);
                    if (!currentMetaItem) {

                        // Afegim la informació extra necessaria per generar el ContentTool
                        currentMetaContent.dispatcher = dispatcher;
                        currentMetaContent.docId = id;

                        cp = this.createContentTool(currentMetaContent);
                        nodeMetaInfo.addChild(cp);

                    } else {
                        console.log("Actualitzant la meta del document:", meta)
                        currentMetaItem.updateDocument(meta.content);
                        cp = currentMetaItem;
                    }
                    if (meta.defaultSelected) { //Des del servidor ens marquen aquesta opció com a defaultSelected
                        ret.defaultSelected = cp.id;
                    }
                    if (!ret.firstPane) {
                        ret.firstPane = cp.id;
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
                    action:     metaContent.action,
                    // type:       metaContent.type
                };


                switch (metaContent.type) {
                    case contentToolFactory.generation.REQUEST_FORM :
                        args.type = metaContent.type;
                        return this._createNotificationFormContentTool(args);
                        break;

                    default:
                        args.type = this.type;
                        return this._createMetaContentTool(args);
                }

            },

            _createNotificationFormContentTool: function (args) {
                return contentToolFactory.generate(contentToolFactory.generation.REQUEST_FORM, args);
            },

            _createMetaContentTool: function (args) {
                return contentToolFactory.generate(contentToolFactory.generation.META, args);
            }

        });
});