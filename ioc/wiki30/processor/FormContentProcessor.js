define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory"
], function (declare, ContentProcessor, contentToolFactory) {
    /**
     * Aquesta classe s'encarrega de processar les dades i generar un document editable.
     *
     * @class FormContentProcessor
     * @extends ContentProcessor
     * @author Xavier García <xaviergaro.dev@gmail.com>
     */
    return declare([ContentProcessor], {
        
        type: "form",

        /**
         * Processa el valor i crea un nou Editor amb la informació i el lliga al Dispatcher passat com argument.
         * Desprès de efectuar les operacions necessaries delega a la classe ContentTool per continuar amb
         * la seqüència del processament.
         *
         * @param {EditorContent} value - Informació per generar l'editor
         * @param {Dispatcher} dispatcher - Dispatcher al que està lligat el ContentTool que es generarà
         * @returns {int} - El valor de return es un enter 
         * @override
         */
        process: function (value, dispatcher) {
            return this.inherited(arguments);
        },

        /**
         * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument,
         * i afegeix el valor de la acció a this.type.
         *
         * @param {Dispatcher} dispatcher
         * @param {Content} value
         * @override
         */
        updateState: function (dispatcher, value) {
            this.inherited(arguments);

            dispatcher.getGlobalState().getContent(value.id).action = this.type;
            dispatcher.getGlobalState().getContent(value.id).ns = value.ns;
            if (value.extra) {
                dispatcher.getGlobalState().getContent(value.id).projectType = value.extra.projectType;
                dispatcher.getGlobalState().getContent(value.id).generated = (value.extra.generated) ? true : false;
                if (value.extra.metaDataSubSet)
                    dispatcher.getGlobalState().getContent(value.id).metaDataSubSet = value.extra.metaDataSubSet;
                if (value.extra.rol)
                    dispatcher.getGlobalState().getContent(value.id).rol = value.extra.rol;
                if (value.extra.rolList)
                    dispatcher.getGlobalState().getContent(value.id).rolList = value.extra.rolList;
                dispatcher.getGlobalState().getContent(value.id).rev = value.extra.rev;
                dispatcher.getGlobalState().getContent(value.id).isRevision = (value.extra.rev) ? true : false;                                
            }
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
                    content: content.content,
                    closable: true,
                    dispatcher: dispatcher,
                    originalContent: content.originalContent,
                    projectType: content.extra.projectType,
                    type: this.type
                };
                if (content.extra.metaDataSubSet)
                    args.metaDataSubSet = content.extra.metaDataSubSet;

            return contentToolFactory.generate(contentToolFactory.generation.FORM, args);
        }

    });
    
});
