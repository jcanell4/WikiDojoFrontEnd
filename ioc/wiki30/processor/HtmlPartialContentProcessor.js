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

                var changesManager = dispatcher.getChangesManager(),
                    cache = dispatcher.getContentCache(value.id), // TODO[Xavi] de vegades torna null?
                    confirmation = false,
                    contentTool;

                if (cache) {
                    contentTool = cache.getMainContentTool();
                }

                // TODO[Xavi] Refactoritzar, massa condicionals
                if (contentTool && contentTool.type === this.type) {
                    // Es una actualització
                    contentTool.getContainer().selectChild(contentTool);

                    // Es una nova edició?

                    // TODO[Xavi] Quan s'ha guardat el isChanged retorna false, s'ha de forçar una comprovació de canvis, però aquest mètode hauria de ser privat
                    contentTool._checkChanges();
                    //console.log("is changed?", changesManager.isChanged(value.id) );


                    if (changesManager.isChanged(value.id) && value.cancel) {

                        if (contentTool.isAnyChunkChanged(value.cancel)) {
                            confirmation = dispatcher.discardChanges();
                        } else {
                            confirmation = true;
                        }

                    } else if (changesManager.isChanged(value.id) && !value.selected && !value.cancel) {
                        confirmation = dispatcher.discardChanges();

                    } else {

                        confirmation = true;
                    }

                    if (confirmation) {

                        if (value.cancel) {
                            contentTool.resetChangesForChunks(value.cancel);
                        } else if (!value.selected) {
                            contentTool.resetAllChangesForChunks();
                        }

                        contentTool.updateDocument(value);

                        dispatcher.getGlobalState().getContent(value.id).rev = content.rev;
                    } else {

                        contentTool.changesNotDiscarded();

                    }

                } else {

                    return this.inherited(arguments);
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
                var /*changedChunks = this._generateEmptyChangedChunks(content.chunks),*/

                    args = {
                        ns: content.ns,
                        id: content.id,
                        title: content.title,
                        content: content,
                        closable: true,
                        dispatcher: dispatcher,
                        rev: content.rev || '',
                        type: this.type,
                        //changedChunks: changedChunks
                    },

                    argsRequestForm = {
                        urlBase: "lib/plugins/ajaxcommand/ajax.php?call=edit_partial&do=edit_partial",
                        form: '.btn_secedit',
                        volatile: true,
                        continue: false
                    },

                    argsRequestForm2 = {
                        form: '.form_save',
                        volatile: true,
                        continue: false
                    };

                // TODO[Xavi] Pel botó de tornar no hi ha request, es automàtic pel attribut data-call-type. Això es pot veure al formRequestReplacer.js
                // Això fa que s'envii el formulari en que es troba, amb la mateixa informació que quan es desa, però la reb el ajax command cancel_partial.

                return contentToolFactory.generate(contentToolFactory.generation.STRUCTURED_DOCUMENT, args)
                    .decorate(contentToolFactory.decoration.REQUEST_FORM, argsRequestForm)
                    .decorate(contentToolFactory.decoration.REQUEST_FORM, argsRequestForm2);

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
