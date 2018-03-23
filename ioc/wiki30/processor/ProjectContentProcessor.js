define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/FormContentProcessor",
    "ioc/gui/content/contentToolFactory"
], function (declare, FormContentProcessor, contentToolFactory) {
    /**
     * Aquesta classe s'encarrega de processar les dades i generar un formulari de projecte editable.
     *
     * @class ProjectContentProcessor
     * @extends FormContentProcessor
     * @culpable Rafael
     */
    return declare([FormContentProcessor], {

        process: function (value, dispatcher) {
            var args = arguments;
            //Se añade un array (key:value) con los datos originales del formulario
            //(nota: los datos de este nuevo array se cambiarán si existe un borrador)
            args[0].content.formValues = args[0].originalContent;
            
            //Con la incorporación del array de datos del formulario, llamamos a la secuencia principal
            //que creará el contentTool y creará la pestaña y mostrará el formulario con los datos originales 
            //antes de preguntar si existe un borrador
            var ret = this.inherited(args);
            
            this.eventManager = dispatcher.getEventManager();
            this.draftManager = dispatcher.getDraftManager();
            this.dialogManager = dispatcher.getDialogManager();
            var localDraft = this.draftManager.getContentLocalDraft(value.ns);
            
            //Si existe un borrador, llamamos a la función que muestra un diálogo para elegir original o borrador
            if (localDraft.project){
                this._showDiffDialog(value, localDraft.project, args);
                return;
            }else {
                return ret;
            }
        },
        
        /**
         * Muestra un diálogo que permite elegir entre editar el original y editar el borrador
         * @param {object} value : parámetros, datos y estructuras del proyecto
         * @param {JSON}   draft : es el borrador almacenado en el localStorage
         * @param {object} args : parámetro para lanzar un inherited sobre FormContentProcessor
         */
        _showDiffDialog: function (value, draft, args) {

            //var contentTool = this.draftManager.drafts[value.ns].contentTool;
            var data = {
                document: this._getDocument(value),
                draft: this._getDraft(draft)
            };
            var dataDocum = this._convertUnixDate(data.document.date);
            var dataDraft = this._convertUnixDate(data.draft.date);
            
            var context = this;
            var dialogParams = {
                id: "project_diff",
                ns: value.ns,
                title: "S'ha trobat un esborrany",
                message: "S'ha trobat un esborrany d'aquest formulari del projecte. Vols obrir la versió actual del formulari o l'esborrany?",
                timeout: value.autosaveTimer * 1000,
                closable: false,
                buttons: [
                    {
                        id: "open_project",
                        description: "Editar el formulari original del projecte",
                        buttonType: 'default',
                        callback: function(){
                            context.contentTool.updateDocument(args[0]);
                        }
                    },
                    {
                        id: "open_project_draft",
                        description: "Editar l'esborrany",
                        buttonType: 'default',
                        callback: function(){
                            args[0].content.formValues = JSON.parse(draft.content);
                            context.contentTool.updateDocument(args[0]);
                        }
                    }
                ],
                diff: {
                    formDocum: data.document.content,
                    formDraft: data.draft.content,
                    labelDocum: "Formulari original (" + dataDocum + ")",
                    labelDraft: "Esborrany (" + dataDraft + ")"
                }
            };

            var dialog = this.dialogManager.getDialog(this.dialogManager.type.PROJECT_DIFF, value.id, dialogParams);
            dialog.show();
        },
        
        _getDocument: function (value) {
            return {content: JSON.stringify(value.originalContent), date: value.originalLastmod};
        },

        _getDraft: function (draft) {
            return {content: draft.content, date: draft.date};
        },
        
        _convertUnixDate: function (fecha) {
            var p = 13 - fecha.toString().length; //He detectado fechas con menos dígitos de lo normal
            if (p > 0) {
                var mul = 1;
                for (var i=0; i<p; i++) {
                    mul *= 10;
                }
                fecha *= mul;
            }
            var d = new Date(fecha);
            return d.getDate() + "-" + (d.getMonth()+1) + "-" + d.getFullYear();
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
                    cancelDialogConfig: content.extra.dialogSaveOrDiscard,
                    messageChangesDetected: content.extra.messageChangesDetected,
                    renderEngines: ['test', 'zoomable_form_element']
                };
            this.contentTool = contentToolFactory.generate(contentToolFactory.generation.PROJECT, args);    
            return this.contentTool;
        }

    });
    
});
