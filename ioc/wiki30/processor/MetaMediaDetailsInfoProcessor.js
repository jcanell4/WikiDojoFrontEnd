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
                        type: "metamediadetails",
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
                                    selectedPane,
                                    versioupload = null;


                            for (m in content.meta) {
                                if (widgetCentral && widgetCentral.id === content.docId) { //esta metainfo pertenece a la pestaña activa
                                    currentMetaContent = content.meta[m];
                                    if (!registry.byId(currentMetaContent.id)) {

                                        cp = this._createContentTool(currentMetaContent, dispatcher, content.docId);

                                        nodeMetaInfo.addChild(cp);
                                        nodeMetaInfo.resize();

                                    }
                                    if (currentMetaContent.id === content.docId + "_metaMediaDetailsProva") {
                                        defaultSelected = content.docId + "_metaMediaDetailsProva";
                                    }
                                    if (currentMetaContent.id === content.docId + "_metaMediafileupload") {
                                        if (currentMetaContent.versioupload) {                                    
                                            defaultSelected = content.docId + "_metaMediafileupload";
                                            versioupload = currentMetaContent.versioupload;
                                        }
                                    }
                                }
                            }



                            var nameUpload = document.getElementById("upload__name_"+content.docId);
                            var ovwUpload = document.getElementById("dw__ow_"+content.docId);
                            var versiouploadArray = content.docId.split(":");
                            var versiouploadIndex = versiouploadArray.length;
                            nameUpload.value = versiouploadArray[versiouploadIndex -1];
                            ovwUpload.checked = true;
                            currentPaneId = dispatcher.getContentCache(content.docId).getCurrentId("metadataPane");
                            nameUpload.placeholder = "Per defecte és el nom del fitxer";
                            if(versioupload!=null){
                                selectedPane = defaultSelected;

                            }else{
                                selectedPane = this._setSelectedPane(content.meta, [currentPaneId, defaultSelected]);
                            }
                            if (selectedPane) {
                                nodeMetaInfo.selectChild(selectedPane);
                                dispatcher.getContentCache(content.docId).setCurrentId("metadataPane", selectedPane);
                            }
                            if (!currentPaneId && defaultSelected) {
                                dispatcher.getContentCache(content.docId).setCurrentId("metadataPane", defaultSelected)
                            }




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
                                id: this._buildContentId(content), // El id corresponent a la metadata s'estableix al DokuModelAdapter
                                data: content.content || ' ',
                                title: content.title,
                                action: content.action,
                                ns: content.ns
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
                            var urlBase = "lib/plugins/ajaxcommand/ajax.php?call=mediadetails";
                            var urlBase1 = urlBase + "&img=" + docId + "&mediado=diff&do=media&tab_details=history&tab_files=files&image=" + docId + "&ns=" + content.ns;
                            var meta = this._convertMetaData(content),
                                    args = {
                                        id: meta.id,
                                        title: meta.title,
                                        data: meta.data,
                                        dispatcher: dispatcher,
                                        docId: docId,
                                        action: meta.action,
                                        ns: meta.ns
                                    };


                            var argsMediaDetailsDecor = {
                                docId: docId,
                                ns: content.ns
                            };
                            var myForm = document.getElementById("page__revisions_" + docId);
                            var argsMediaDetailsForm = {
                                urlBase: urlBase1,
                                form: myForm
                            };

                            return contentToolFactory.generate(contentToolFactory.generation.METAMEDIADETAILS, args);
                            //.decorate(contentToolFactory.decoration.METAMEDIADETAILS, argsMediaDetailsDecor)
                            //.decorate(contentToolFactory.decoration.REQUEST_FORM, argsMediaDetailsForm);
                        },
                        /**
                         * Contrueix la id a partir del content passat com argument. Ens assegurem que només hi ha un punt on ho hem
                         * de canviar si volem una estructura diferent.
                         *
                         * @param content
                         * @returns {string}
                         * @protected
                         */
                        _buildContentId: function (content) {
                            return content.id;
                        }



                    });
            return ret;
        });

