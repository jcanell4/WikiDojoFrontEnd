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
                if (value.extra.metaDataSubSet)
                    args[0].metaDataSubSet = value.extra.metaDataSubSet;
            }
            
            //Con la incorporación del array de datos del formulario, llamamos a la secuencia principal
            //que creará el contentTool y la pestaña y mostrará el pseudoformulario con los datos originales 
            var ret = this.inherited(args);

            //Si existe un borrador, llamamos a la función que muestra un diálogo para elegir original o borrador
            if (localDraft.project && value.extra.edit){
                this.eventManager = dispatcher.getEventManager();
                this.dialogManager = dispatcher.getDialogManager();
                this._showDiffDialog(value, localDraft.project);
                return;
            }else {
                return ret;
            }
        },
        
        addContent: function(content, dispatcher, container) {
            this.oldGlobalState = dispatcher.getGlobalState().getContent(content.id);
            this.inherited(arguments);
        },

        updateState: function (dispatcher, value) {
            this.inherited(arguments);
            if (value.extra) {
                dispatcher.getGlobalState().getContent(value.id)['rev'] = value.extra.rev;
                dispatcher.getGlobalState().getContent(value.id)['isRevision'] = (value.extra.rev) ? true : false;
                dispatcher.getGlobalState().getContent(value.id)['metaDataSubSet'] = value.extra.metaDataSubSet;
            }
            if (this.oldGlobalState && this.oldGlobalState.updateButton) {
                //recuperar el globalstate updateButton
                dispatcher.getGlobalState().getContent(value.id)['updateButton'] = this.oldGlobalState.updateButton;
                /*
                 * versión para recuperar todo lo diferente
                var globalState = dispatcher.getGlobalState().getContent(value.id);
                for (var item in this.oldGlobalState) {
                    if (!globalState[item]) {
                        dispatcher.getGlobalState().getContent(value.id)[item] = this.oldGlobalState[item];
                    }
                }
                */
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
                    autosaveTimer: content.autosaveTimer
                };
                if (content.extra.metaDataSubSet)
                    args.metaDataSubSet = content.extra.metaDataSubSet;
            this.contentTool = contentToolFactory.generate(contentToolFactory.generation.PROJECT_VIEW, args);    
            return this.contentTool;
        },
        
        /**
         * Muestra un diálogo que permite elegir entre editar el original y editar el borrador
         * @param {object} value : parámetros, datos y estructuras del proyecto
         * @param {JSON}   draft : es el borrador almacenado en el localStorage
         */
        _showDiffDialog: function (value, draft) {

            var data = {
                document: this._getDocument(value),
                draft: this._getDraft(draft)
            };
            var dataDocum = this._convertUnixDate(data.document.date);
            var dataDraft = this._convertUnixDate(data.draft.date);
            var query = "id="+value.ns + "&projectType="+value.extra.projectType + (value.rev ? "&rev="+value.rev : "");

            var dialogParams = {
                id: value.id,
                ns: value.ns,
                title: "S'ha trobat un esborrany del projecte",
                message: "S'ha trobat un esborrany del projecte. Vols obrir la versió actual del formulari o l'esborrany?",
                closable: false,
                buttons: [
                    {
                        id: "open_project",
                        description: "Editar el formulari original del projecte",
                        buttonType: 'request_control',
                        extra: {
                            ns: value.ns,
                            eventType: this._getProjectEvent(),
                            dataToSend: this._getProjectQuery(query)
                        }
                    },
                    {
                        id: "open_project_draft",
                        description: "Editar l'esborrany",
                        buttonType: 'request_control',
                        extra: {
                            ns: value.ns,
                            eventType: this._getProjectEvent(),
                            dataToSend: this._getProjectDraftQuery(query)
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
        
        _getProjectDraftQuery: function (query) {
            return query + "&recover_draft=true&recover_local_draft=true";
        },

        _getProjectQuery: function (query) {
            return query + "&recover_draft=false";
        },
        
        _getProjectEvent: function () {
            return this.eventManager.eventName.EDIT_PROJECT;
        },
        
        _getDocument: function (value) {
            return {content: JSON.stringify(value.originalContent), date: value.extra.originalLastmod};
        },

        _getDraft: function (draft) {
            return {content: draft.content, date: draft.date};
        },
        
        _convertUnixDate: function (fecha) {
            if (fecha) {
                var p = 13 - fecha.toString().length; //He detectado fechas con menos dígitos de lo normal
                if (p > 0) {
                    var mul = 1;
                    for (var i=0; i<p; i++) {
                        mul *= 10;
                    }
                    fecha *= mul;
                }
                var d = new Date(parseInt(fecha));
            }else {
                var d = new Date();
            }
            return d.getDate() + "." + (d.getMonth()+1) + "." + d.getFullYear();
        }

    });
    
});
