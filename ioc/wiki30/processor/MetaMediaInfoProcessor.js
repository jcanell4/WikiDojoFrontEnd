define([
    "dojo/_base/declare",
    "dijit/registry",
    "dojo/dom-construct",
    "ioc/gui/content/contentToolFactory",
    "ioc/wiki30/processor/AbstractResponseProcessor"
    

], function (declare, registry, domConstruct, contentToolFactory, AbstractResponseProcessor) {
    var ret = declare([AbstractResponseProcessor],
        /**
         * @class MetaInfoProcessor
         * @extends AbstractResponseProcessor
         * @author Josep Cañellas <jcanell4@ioc.cat>, Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "metaMedia",
            dialogTree: null,
            newContent: null,

            process: function (value, dispatcher) {
                this._processMetaMediaInfo(value, dispatcher);
                this._processContentCache(dispatcher, value);
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
            _processMetaMediaInfo: function (content, dispatcher) {
                var widgetCentral = registry.byId(dispatcher.containerNodeId).selectedChildWidget,
                    nodeMetaInfo = registry.byId(dispatcher.metaInfoNodeId),
                    currentMetaContent,
                    cp,
                    m,
                    currentPaneId,
                    defaultSelected,
                    selectedPane;

                //dispatcher.removeAllChildrenWidgets(nodeMetaInfo);
                //contentCache.setCurrentId("metadataPane", null);
                
                for (m in content.meta) {
                    if (widgetCentral && widgetCentral.id === content.docId) { //esta metainfo pertenece a la pestaña activa
                        currentMetaContent = content.meta[m];
                        //widgetMetaInfo = registry.byId(content.meta[m].id);
                                /*
         * 20150430 Miguel Angel Lozano
         * Canvi per fer servir ContentTabDokuWikiNsTree
         * Amb l'id metaMedia, s'ha de construir l'arbre ContentTabDokuWikiNsTree
         * Es fa amb una nova funció perquè són diversos passos
         */
                        if (!registry.byId(currentMetaContent.id)) {
                            //currentMetaContent.dispatcher = dispatcher;
                            //currentMetaContent.docId = content.id;

                            if(currentMetaContent.id === "metaMedia"){
                                this._createNsTree(currentMetaContent, dispatcher, 'metaMedia');
                                cp = this._createContentTool(newContent, dispatcher, 'metaMedia');
                                //dialogTree.startup();

                            }else{
                                cp = this._createContentTool(currentMetaContent, dispatcher, content.id);
                            }

                            nodeMetaInfo.addChild(cp);
                            nodeMetaInfo.resize();
                            if(currentMetaContent.id === "metaMedia"){
                                this.dialogTree.startup();
                            }

                        }
                    }
                }
                
                
                

                currentPaneId = dispatcher.getContentCache(content.docId).getCurrentId("metadataPane");
                defaultSelected = "metaMedia";

                if (!currentPaneId && defaultSelected) {
                    dispatcher.getContentCache(content.docId).setCurrentId("metadataPane", defaultSelected)
                }

                selectedPane = this._setSelectedPane(content.meta, [currentPaneId, defaultSelected]);

                if (selectedPane) {
                    nodeMetaInfo.selectChild(selectedPane);
                    dispatcher.getContentCache(content.docId).setCurrentId("metadataPane", selectedPane);
                }
                
                /*selectedPane = contentCache.getCurrentId("metaMedia");

                if (!selectedPane && defaultSelected) {
                    selectedPane = defaultSelected;
                } else if (!selectedPane) {
                    selectedPane = firstPane;
                }

                nodeMetaInfo.selectChild(selectedPane);
                contentCache.setCurrentId("metaMedia", selectedPane);*/

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
                /*dispatcher.getContentCache(value.docId).removeAllMetaData();

                if (dispatcher.contentCache[value.docId]) {
                    var meta = value.meta;

                    for (var i = 0; i < meta.length; i++) {
                        dispatcher.contentCache[value.docId].putMetaData(meta[i]);
                    }
                }*/
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
                    args = {
                        id:         meta.id,
                        title:      meta.title,
                        data:       meta.data,
                        dispatcher: dispatcher,
                        docId:      "media",
                        action:     meta.action
                    };

                return contentToolFactory.generate(contentToolFactory.generation.META, args);
                    //.decorate(contentToolFactory.decoration.META);
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
            
            /**
             * 
             */
            
            _createNsTree: function (content, dispatcher, docId) {
                var self = this;
                require(["ioc/gui/ContentTabDokuwikiNsTree"], function(ContentTabDokuwikiNsTree){    
                    var divNsTree = domConstruct.toDom("<div id='media__tree'></div>");

                    self.dialogTree = new ContentTabDokuwikiNsTree({
                        treeDataSource: 'lib/plugins/ajaxcommand/ajaxrest.php/ns_tree_rest/',
                        onlyDirs:true,
                        processOnClickAndOpenOnClick:true
                    }).placeAt(divNsTree);
                
                    self.dialogTree.urlBase = "lib/plugins/ajaxcommand/ajax.php?call=media" +
                            '&do=media&list='+content.list+'&sort='+content.sort;
                    
                    self.dialogTree.getQuery = function(){
                        return "id="+this.item.id+"&ns="+this.item.id+"&preserveMetaData=true";
                    };

                    this.newContent = [];
                    this.newContent["id"] = docId;
                    this.newContent["title"] = "Índex";
                    this.newContent["content"] = divNsTree.innerHTML;
                });

            }

        });
    return ret;
});

