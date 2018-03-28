define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/FormContentProcessor",
    "ioc/gui/content/contentToolFactory"
], function (declare, FormContentProcessor, contentToolFactory) {
    /**
     * Aquesta classe s'encarrega de processar les dades i generar un pseudoformulari de projecte.
     *
     * @class ProjectContentProcessor
     * @extends FormContentProcessor
     * @culpable Rafael
     */
    return declare([FormContentProcessor], {
        
        type: "view_form",

        process: function (value, dispatcher) {
            var args = arguments;
            
            //Si hay draft añadimos un mensaje
            var draft = dispatcher.getDraftManager().getContentLocalDraft(value.ns);
            if (!jQuery.isEmptyObject(draft)) {
                dispatcher.getInfoManager().setExtraInfo({priority:0, message:LANG.template['ioc-template'].has_draft});
            }
            
            //Se añade un array (key:value) con los datos originales del formulario
            args[0].content.formValues = args[0].originalContent;
            
            //Con la incorporación del array de datos del formulario, llamamos a la secuencia principal
            //que creará el contentTool y la pestaña y mostrará el pseudoformulario con los datos originales 
            return this.inherited(args);
        },

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
                    type: this.type,
                    autosaveTimer: content.autosaveTimer,
                    renderEngines: ['test', 'zoomable_form_element']
                };
            this.contentTool = contentToolFactory.generate(contentToolFactory.generation.PROJECT_VIEW, args);    
            return this.contentTool;
        }

    });
    
});
