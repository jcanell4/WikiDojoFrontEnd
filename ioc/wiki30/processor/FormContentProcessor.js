define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory",
    "dijit/registry"
], function (declare, ContentProcessor, contentToolFactory, registry) {

    return declare([ContentProcessor],
        /**
         * Aquesta classe s'encarrega de processar les dades i generar un document editable.
         *
         * @class FormContentProcessor
         * @extends ContentProcessor
         * @author Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "form",

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
                //console.log("FormContentProcessor#process", value);
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

                dispatcher.getGlobalState().getContent(value.id)["action"] = "form";
                dispatcher.getGlobalState().getContent(value.id)["ns"] = value.ns;
                dispatcher.getGlobalState().getContent(value.id)["projectType"] = value.extra.projectType;
                dispatcher.getGlobalState().getContent(value.id)["rol"] = value.extra.rol;
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
                //console.log("FormContentProcessor#createContentTool", content);

                var args = {
                        ns: content.ns,
                        id: content.id,
                        title: content.title,
                        content: content.content,
                        closable: true,
                        dispatcher: dispatcher,
                        originalContent: content.originalContent,
                        projectType: content.extra.projectType,
                        type: this.type,
                    },
                    argsRequestForm = {
                        urlBase: content.content.action,
                        form: '#' + content.content.id
                    };

                return contentToolFactory.generate(contentToolFactory.generation.FORM, args)
                    //.decorate(contentToolFactory.decoration.REQUEST_FORM, argsRequestForm); // Això ja no s'ha de fer servir, ha de funcionar a travésd els botons
            },

            isRefreshableContent: function (oldType, newType) {
                console.log("ContentProcessor#isRefreshableContent", oldType);

                return false;
            }

        });
});
