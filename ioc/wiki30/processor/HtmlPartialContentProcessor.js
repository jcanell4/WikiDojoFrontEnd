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
         * @author Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "html_partial",

            /**
             * Processa el valor rebut com argument com a un document estructurat. Si el doucument ja existeix refresca
             * la informació.
             *
             * @param {*} value - Valor per processar
             * @param {Dispatcher} dispatcher - Dispatcher al que està lligat aquest document.
             * @override
             */
            process: function (value, dispatcher) {
                //console.log("HtmlPartialContentProcessor#process", value);

                var changesManager = dispatcher.getChangesManager(),
                    cache = dispatcher.getContentCache(value.id), // TODO[Xavi] de vegades torna null?
                    confirmation = false,
                    contentTool;

                if (cache) {
                    contentTool = cache.getMainContentTool();
                }

                // TODO[Xavi] Refactoritzar, massa condicionals
                if (contentTool && contentTool.type === this.type && !value.discard_changes) { // Alerta [Xavi] afegit nou per forçar els discards

                    // Es una actualització
                    contentTool.getContainer().selectChild(contentTool);

                    // Es una nova edició?

                    // TODO[Xavi] Quan s'ha guardat el isChanged retorna false, s'ha de forçar una comprovació de canvis, però aquest mètode hauria de ser privat
                    contentTool._checkChanges();
                    //console.log("is changed?", changesManager.isChanged(value.id) );


                    //console.log("Ja hi ha un contenttol del mateix tipus");

                    if (changesManager.isChanged(value.id) && value.cancel) {
                        if (contentTool.isAnyChunkChanged(value.cancel)) {
                            confirmation = dispatcher.discardChanges();
                        } else {
                            confirmation = true;
                        }

                        if (confirmation) {
                            dispatcher.getDraftManager().clearDraftChunks(value.id, value.cancel);
                            //console.log("Eliminats chunks dels esborranys locals:", value.cancel);
                            // TODO[Xavi] S'hauria d'afegir un command per eliminar també els esborranys remots
                        }

                    } else if (changesManager.isChanged(value.id) && !value.selected && !value.cancel) {
                        confirmation = dispatcher.discardChanges();

                    } else {
                        confirmation = true;
                    }

                    contentTool.rev = value.rev;

                    if (confirmation) {


                        if (value.cancel) {
                            contentTool.resetChangesForChunks(value.cancel);
                        } else if (!value.selected) {
                            contentTool.resetAllChangesForChunks();
                        }

                        contentTool.updateDocument(value);

                        dispatcher.getGlobalState().getContent(value.id).rev = contentTool.rev; // ALERTA[Xavi] posava content.rev, això no pot ser, es referia contentTool.rev (que a la seva vegada es el mateix que value.rev)?
                    }
                } else {
                    // No hi ha tipus previ de contenttool, o el tipus del contenttol era diferent

                    return this.inherited(arguments);
                }

                var contentCache = dispatcher.getGlobalState().getContent(value.id);

                if (contentCache && contentCache.rev != value.rev) {
                    dispatcher.getGlobalState().getContent(value.id).rev = value.rev;
                }


                return confirmation ? 0 : 100;
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
                dispatcher.getGlobalState().getContent(value.id).action = "view"; // TODO[xavi] això quan es fa servir?
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
                var args = {
                    ns: content.ns,
                    id: content.id,
                    title: content.title,
                    content: content,
                    closable: true,
                    dispatcher: dispatcher,
                    rev: content.rev || '',
                    type: this.type,
                    readonly: content.editing ? content.editing.readonly : false
                };

                return contentToolFactory.generate(contentToolFactory.generation.STRUCTURED_DOCUMENT, args);
            },

            /**
             * Crea el llistat pel control de canvis per chunks.
             * @param chunks
             * @returns {{}}
             * @private
             */
            _generateEmptyChangedChunks: function (chunks) {
                var chunk,
                    changedChunks = {};

                for (var i = 0; i < chunks.length; i++) {
                    chunk = chunks[i];
                    changedChunks[chunk.header_id] = {};
                    changedChunks[chunk.header_id].changed = false;
                    changedChunks[chunk.header_id].content = chunk.editing;

                }

                return changedChunks;
            }

        })
});
