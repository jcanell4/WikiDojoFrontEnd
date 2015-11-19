define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory"

], function (declare, ContentProcessor, contentToolFactory) {

    return declare([ContentProcessor],
        /**
         * Aquesta classe s'encarrega de processar els continguts per documents de tipus Html, generar els ContentTool
         * apropiat i afegir-lo al contenidor adequat.
         *
         * @class HtmlContentProcessor
         * @extends ContentProcessor
         * @author Josep Cañellas <jcanell4@ioc.cat>, Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "html_partial",

            /**
             * Processa el valor rebut com argument com a un document estructurat. Si el doucument ja existeix refresca
             * la informació.
             *
             *
             * @param {Content} value - Valor per processar
             * @param {Dispatcher} dispatcher - Dispatcher al que està lligat aquest document.
             * @override
             */
            process: function (value, dispatcher) {

                var changesManager = dispatcher.getChangesManager(),
                    confirmation = false,
                    id = value.id,
                    cache = dispatcher.getContentCache(value.id),
                    contentTool;


                // Si ja existeix el ContentTool i es un html_partial, processem la edició parcial.
                // TODO[Xavi] no estem fent el control de refreshable com al ContentProcessor
                // Per fer-ho s'ha de crear una classe nova i sobrescriure el mètode updateDocument.

                if (cache) {
                    contentTool = cache.getMainContentTool();
                }


                if (contentTool && contentTool.type === this.type) {
                    // Es una edició, el passem a primer pla
                    contentTool.getContainer().selectChild(contentTool);

                    // Si s'ha retornat un selected es que es tracta d'una nova edició
                    if (changesManager.isChanged(id) && !value.selected) {

                        confirmation = dispatcher.discardChanges();

                    } else {

                        confirmation = true;
                    }

                    if (confirmation) {
                        if (contentTool.cancellingHeader) {
                            contentTool.changedChunks[contentTool.cancellingHeader].changed = false;
                            contentTool.changedChunks[contentTool.cancellingHeader].content = null;
                        }

                        contentTool.resetContentChangeState();

                        return this._processPartialEdition(value, dispatcher);
                    }

                    // Si no hi ha confirmació no fem res, s'ignora el process


                } else {

                    return this.inherited(arguments);
                }

            },

            /**
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument, i afegeix
             * el valor de la acció a "view".
             *
             * @param {Dispatcher} dispatcher - Dispatcher al que està lligat aquest process
             * @param {Content} value - Valor per processar
             * @override
             */
            updateState: function (dispatcher, value) {
                this.inherited(arguments);
                dispatcher.getGlobalState().getContent(value.id).action = "view";
                dispatcher.getGlobalState().getContent(value.id).rev = value.rev;
            },

            /**
             * Genera un ContentTool decorat adecuadament per funcionar com document de només lectura.
             *
             * @param {Content} content - Contingut a partir del qual es generarà el ContentTool
             * @param {Dispatcher} dispatcher - Dispatcher al que estarà lligat el ContentTool
             * @returns {ContentTool} ContentTool decorat com a tipus document.
             * @protected
             * @override
             */
            createContentTool: function (content, dispatcher) {
                var args,
                    changedChunks = this._generateChangedChunks(content.chunks);


                args = {
                    ns: content.ns,
                    id: content.id,
                    title: content.title,
                    content: content,
                    closable: true,
                    dispatcher: dispatcher,
                    rev: content.rev,
                    type: this.type,
                    changedChunks: changedChunks,


                };


                var contentTool = contentToolFactory.generate(contentToolFactory.generation.STRUCTURED_DOCUMENT, args),

                    argsRequestForm = {
                        urlBase: "lib/plugins/ajaxcommand/ajax.php?call=edit_partial&do=edit_partial",
                        form: '.btn_secedit',
                        volatile: true,
                        continue: false
                    },

                    argsRequestForm2 = {
                        //urlBase: "lib/plugins/ajaxcommand/ajax.php?call=save_partial",
                        form: '.form_save',
                        volatile: true,
                        continue: false
                    };


                return contentTool.decorate(contentToolFactory.decoration.REQUEST_FORM, argsRequestForm)
                    .decorate(contentToolFactory.decoration.REQUEST_FORM, argsRequestForm2);

            },

            _generateChangedChunks: function (chunks) {
                var chunk,
                    changedChunks = {};

                for (var i = 0; i < chunks.length; i++) {
                    chunk = chunks[i];
                    changedChunks[chunk.header_id] = {};
                    changedChunks[chunk.header_id].changed = false;
                    changedChunks[chunk.header_id].content = chunk.editing;

                }

                return changedChunks;
            },

            _processPartialEdition: function (content, dispatcher) {
                var i, j,
                    mainContentTool = dispatcher.getContentCache(content.id).getMainContentTool(),
                    oldStructure = mainContentTool.data,
                    newStructure = content;

                // Actualitzem la llista de chunks canviats abans de fusionar amb el contingut actual
                for (i = 0; i < newStructure.chunks.length; i++) {
                    var chunk = newStructure.chunks[i];

                    if (mainContentTool.changedChunks[chunk.header_id]) {
                        if (chunk.text) {

                            if (!mainContentTool.changedChunks[chunk.header_id]) {
                                // Si no existia el creem buit
                                mainContentTool.changedChunks[chunk.header_id] = {};
                                mainContentTool.changedChunks[chunk.header_id].changed = false;
                            }

                            // Actualitzem el contingut amb el rebut
                            mainContentTool.changedChunks[chunk.header_id].content = chunk.text.editing;
                        }
                    }
                }


                for (i = 0; i < oldStructure.chunks.length; i++) {
                    var cancelThis = newStructure.cancel && newStructure.cancel.indexOf(oldStructure.chunks[i].header_id) > -1;
                    if (oldStructure.chunks[i].text && !cancelThis) {
                        // Cerquem el header_id a la nova estructura
                        for (j = 0; j < newStructure.chunks.length; j++) {
                            if (newStructure.chunks[j].header_id === oldStructure.chunks[i].header_id) {
                                if (newStructure.chunks[j].text) {
                                    newStructure.chunks[j].text.editing = oldStructure.chunks[i].text.editing;
                                }

                                break;
                            }
                        }
                        // Si no es troba es que aquesta secció ha sigut eliminada

                    }
                }


                //console.log("Nous chunks rebuts:", newStructure);

                mainContentTool.setData(newStructure);
                mainContentTool.render();

                dispatcher.getGlobalState().getContent(content.id).rev = content.rev;

                return 0;
            }
        })


});
