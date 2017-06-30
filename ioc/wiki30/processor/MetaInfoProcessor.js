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
                    ret = {},
                    standalone = (contentCache === undefined); // La meta no està lligada a cap document central

//                console.log("Quina es la id del metaInfonode?", dispatcher.metaInfoNodeId);

                // TODO[Xavi] La neteja del container s'hauria de fer a traves del RemoveAllContentProcessor. Compte amb el setCurrentId que deixaría de funcionar!


                if (nodeMetaInfo && nodeMetaInfo.clearContainer) {
                    //Alerta[Xavi] si es clica un document abans de que es faci el canvi del nodeMetaInfo a ContainerContentTool dona error, per això s'ha de controlar
                    nodeMetaInfo.clearContainer(content.id);
                }

                // TODO[Xavi] Si es fa clic a un document de l'arbre de fitxers abans de que acabi de carregar la aplicació peta
                if (contentCache) {
                    // ALERTA[Xavi] Si es fa click en el projecte com que no te document principal associat peta, s'ha d'ignorar
                    contentCache.setCurrentId("metadataPane", null);
                }


                for (m in content.meta) {
                    this._addMetainfo(content.id, content.meta[m], dispatcher, nodeMetaInfo, ret,standalone);
                }

                if (contentCache) {
                    // ALERTA[Xavi] Si es fa click en el projecte com que no te document principal associat peta, s'ha d'ignorar
                    selectedPane = contentCache.getCurrentId("metadataPane");

                    if (!selectedPane && ret.defaultSelected) {
                        selectedPane = ret.defaultSelected;
                    } else if (!selectedPane) {
                        selectedPane = ret.firstPane;
                    }

                    nodeMetaInfo.selectChild(selectedPane);
                    contentCache.setCurrentId("metadataPane", selectedPane);

                } else {
                    nodeMetaInfo.selectChild(ret.firstPane);

                }

                return 0;
            },

            _addMetainfo: function (id, meta, dispatcher, nodeMetaInfo, ret, standalone) {
                console.log(id, meta);


                var widgetCentral = registry.byId(dispatcher.containerNodeId).selectedChildWidget,
                    cp,
                    //defaultSelected=0,
                    //firstPane=1,
                    currentMetaItem,
                    currentMetaContent;

                if ((widgetCentral && widgetCentral.id === id) || standalone) { // aquesta metainfo pertany a la pestanya activa
                    currentMetaContent = meta;

                    currentMetaItem = registry.byId(currentMetaContent.id);
                    if (!currentMetaItem) {

                        // Afegim la informació extra necessaria per generar el ContentTool
                        currentMetaContent.dispatcher = dispatcher;
                        currentMetaContent.docId = id;

                        cp = this.createContentTool(currentMetaContent);
                        nodeMetaInfo.addChild(cp);
                        nodeMetaInfo.resize();

                    } else {
                        this._updateContentTool(currentMetaItem, currentMetaContent);
                        // currentMetaItem.updateDocument(currentMetaContent.content);
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

                console.log("MetaInfoProcessor#createContentTool");
                var args = {
                    id: metaContent.id,
                    title: metaContent.title,
                    data: metaContent.content || ' ',
                    dispatcher: metaContent.dispatcher,
                    docId: metaContent.docId,
                    action: metaContent.action,
                    // type:       metaContent.type
                };


                switch (metaContent.type) {
                    case contentToolFactory.generation.REQUEST_FORM :
                        args.type = metaContent.type;
                        return this._createNotificationFormContentTool(args);

                    case contentToolFactory.generation.META_DOKUWIKI_NS_TREE:
                        return this._createDokuwikiNSTreeContentTool(metaContent);


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
            },

            _createDokuwikiNSTreeContentTool: function (metaContent) {
                console.log(metaContent);
                var args = {
                    id: metaContent.id,
                    title: metaContent.title,
                    type: metaContent.type,
                    data: '',
                    dispatcher: metaContent.dispatcher,
                    docId: metaContent.docId,
                    fromRoot: metaContent.fromRoot,
                    expandProject: true,
                    processOnClickAndOpenOnClick: false,
                    openOnClick: true,
                    typeDictionary: metaContent.typeDictionary,
                    treeDataSource: metaContent.treeDataSource,
                    urlBase: metaContent.urlBase
                    // action: metaContent.action,
                }

                return contentToolFactory.generate(contentToolFactory.generation.META_DOKUWIKI_NS_TREE, args);

            },

            _updateContentTool: function(contentTool, newContent) {

                var content;

                switch (contentTool.type) {
                    case contentToolFactory.generation.META_DOKUWIKI_NS_TREE:
                        content = {
                            id: newContent.id,
                            title: newContent.title,
                            type: newContent.type,
                            // data: '',
                            dispatcher: contentTool.dispatcher,
                            docId: newContent.docId,
                            fromRoot: newContent.fromRoot,
                            expandProject: true,
                            processOnClickAndOpenOnClick: false,
                            openOnClick: true,
                            typeDictionary: newContent.typeDictionary,
                            treeDataSource: newContent.treeDataSource,
                            urlBase: newContent.urlBase
                        };

                        break;

                    default:
                        content = newContent.content;
                }


                contentTool.updateDocument(content);
            }

        });
});