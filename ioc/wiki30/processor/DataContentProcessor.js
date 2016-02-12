define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory",

], function (declare, ContentProcessor, contentToolFactory) {

    return declare([ContentProcessor],
        /**
         * Aquesta classe s'encarrega de processar les dades i generar un document editable.
         *
         * @class DataContentProcessor
         * @extends ContentProcessor
         * @author Josep Cañellas <jcanell4@ioc.cat>, Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "data",

            /**
             * Processa el valor i crea un nou Editor amb la informació i el lliga al Dispatcher passat com argument.
             * Desprès de efectuar les operacions necessaries delega a la classe ContentTool per continuar amb
             * la seqüència del processament.
             *
             * @param {EditorContent} value - Informació per generar l'editor
             * @param {Dispatcher} dispatcher - Dispatcher al que està lligat el ContentTool que es generarà
             * @returns {int} - El valor de return es un enter que depèn del resultat del valor retornat per la
             * superclasse.
             * @override
             */
            process: function (value, dispatcher) {
                //console.log("DataContentProcessor#process", value);
                var $content = jQuery(value.content);

                // Reemplaçem el contingut del content amb el del draft
                if (value.draft != null && value.recover_draft === "true") {
                    $content.find('textarea').html(value.draft.content);
                    value.content = jQuery('<div>').append($content.clone()).html();
                }

                return this.inherited(arguments);
            },

            /**
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument, i afegeix
             * el valor de la acció a "edit".
             *
             * @param {Dispatcher} dispatcher
             * @param {Content} value
             * @override
             */
            updateState: function (dispatcher, value) {
                this.inherited(arguments);
                dispatcher.getGlobalState().getContent(value.id)["action"] = "edit";
            },

            /**
             * Aquesta es la implementació específica del métode que genera un ContentTool decorat per funcionar com
             * Editor de documents amb gestió de canvis.
             *
             * @param {EditorContent} content - Contingut a partir del cual es genera el ContentTool
             * @param dispatcher - Dispatcher al que està lligat el ContentTool
             * @returns {ContentTool} - ContentTool decorat per funcionar com un editor de documents
             * @override
             * @protected
             */
            createContentTool: function (content, dispatcher) {

                var args = {
                    ns: content.ns,
                    id: content.id,
                    title: content.title,
                    content: content,
                    closable: true,
                    dispatcher: dispatcher,
                    originalContent: this._extractContentFromNode(content),
                    type: this.type,
                    locked: content.editing.locked,
                    rev: content.rev
                };


                return contentToolFactory.generate(contentToolFactory.generation.EDITOR, args);
            },

            _extractContentFromNode: function (content) {
                return  jQuery.trim(jQuery(content.content).find('textarea').val());
            }
        });
});