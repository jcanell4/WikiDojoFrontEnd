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
        
        type: "project_view",

        process: function (value, dispatcher) {
            var args = arguments;
            
            //Si hay draft añadimos un mensaje
            var localDraft = dispatcher.getDraftManager().getContentLocalDraft(value.ns);
            if (!jQuery.isEmptyObject(localDraft)) {
                dispatcher.getInfoManager().setExtraInfo({priority:0, message:LANG.template['ioc-template'].has_draft});
            }
            
            //Se añade un array (key:value) con los datos originales del formulario
            args[0].content.formValues = args[0].originalContent;
            //Se copian ciertos valores del 'paquete extra'
            if (value.extra) {
                args[0].isRevision = (value.extra.rev) ? true : false;
                if (value.extra.discard_changes)
                    args[0].discard_changes = value.extra.discard_changes;
                if (value.extra.hasDraft)
                    args[0].hasDraft = value.extra.hasDraft;
            }
            
            //Con la incorporación del array de datos del formulario, llamamos a la secuencia principal
            //que creará el contentTool y la pestaña y mostrará el pseudoformulario con los datos originales 
            var ret = this.inherited(args);

            //Si existe un borrador, llamamos a la función que muestra un diálogo para elegir original o borrador
            if (localDraft.project){
                this.dialogManager = dispatcher.getDialogManager();
                this._showDiffDialog(value, localDraft.project, args);
                return;
            }else {
                return ret;
            }
        },

        updateState: function (dispatcher, value) {
            this.inherited(arguments);
            if (value.extra) {
                dispatcher.getGlobalState().getContent(value.id)['rev'] = value.extra.rev;
                dispatcher.getGlobalState().getContent(value.id)['isRevision'] = (value.extra.rev) ? true : false;
            }
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
                    isRevision: content.isRevision,
                    autosaveTimer: content.autosaveTimer,
                    //renderEngines: ['test', 'zoomable_form_element']
                };
            this.contentTool = contentToolFactory.generate(contentToolFactory.generation.PROJECT_VIEW, args);    
            return this.contentTool;
        },
        
        /**
         * Muestra un diálogo que permite elegir entre editar el original y editar el borrador
         * @param {object} value : parámetros, datos y estructuras del proyecto
         * @param {JSON}   draft : es el borrador almacenado en el localStorage
         * @param {object} args : parámetro para lanzar un inherited sobre FormContentProcessor
         */
        _showDiffDialog: function (value, draft, args) {

            var data = {
                document: this._getDocument(value),
                draft: this._getDraft(draft)
            };
            var dataDocum = this._convertUnixDate(data.document.date);
            var dataDraft = this._convertUnixDate(data.draft.date);
            
            var context = this;
            var dialogParams = {
                id: value.id,
                ns: value.ns,
                title: "S'ha trobat un esborrany del projecte",
                message: "S'ha trobat un esborrany del projecte. Vols obrir la versió actual del formulari o l'esborrany?",
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
            return {content: JSON.stringify(value.originalContent), date: value.extra.originalLastmod};
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
            var d = new Date(parseInt(fecha));
            return d.getDate() + "." + (d.getMonth()+1) + "." + d.getFullYear();
        }

    });
    
});
