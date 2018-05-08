define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/FormContentProcessor",
    "dijit/registry",
    "ioc/gui/content/contentToolFactory"
], function (declare, FormContentProcessor, registry, contentToolFactory) {
    /**
     * Aquesta classe s'encarrega de processar les dades i generar un formulari de projecte editable.
     *
     * @class ProjectContentProcessor
     * @extends FormContentProcessor
     * @culpable Rafael
     */
    return declare([FormContentProcessor], {

        type: "project_edit",

        process: function (value, dispatcher) {
            var args = arguments;
            //Se añade un array (key:value) con los datos originales del formulario
            //(nota: los datos de este nuevo array se cambiarán si existe un borrador)
            args[0].content.formValues = args[0].originalContent;

            //Se copian ciertos valores del 'paquete extra'
            if (value.extra) {
                if (value.extra.hasDraft) {
                    args[0].hasDraft = value.extra.hasDraft;
                }
                this.draftManager = dispatcher.getDraftManager();
                var localDraft = this.draftManager.getContentLocalDraft(value.ns);
                if (value.extra.recover_draft) {
                    //si se pide, sustituimos los datos del formulario por los datos guardados en el draft local
                    args[0].content.formValues = JSON.parse(localDraft.project.content);
                }
            }
            
            //Con la incorporación del array de datos del formulario y los valores extra, llamamos a la secuencia principal
            //que creará el contentTool, creará la pestaña y mostrará el formulario con los datos originales 
            //antes de preguntar si existe un borrador
            var ret = this.inherited(args);
            
            //ahora está en ProjectViewContentProcessor
            //this.eventManager = dispatcher.getEventManager();
            //this.dialogManager = dispatcher.getDialogManager();
            //this.draftManager = dispatcher.getDraftManager();
            //var localDraft = this.draftManager.getContentLocalDraft(value.ns);
            
            //ahora está en ProjectViewContentProcessor
            //Si existe un borrador, llamamos a la función que muestra un diálogo para elegir original o borrador
            //if (localDraft.project){
            //    this._showDiffDialog(value, localDraft.project, args);
            //    return;
            //}else {
            //    return ret;
            //}
            
            if (value.timer) {
                this._initTimer(value, dispatcher);
            }
            return ret;
        },
        
        //ahora está en ProjectViewContentProcessor
//        /**
//         * Muestra un diálogo que permite elegir entre editar el original y editar el borrador
//         * @param {object} value : parámetros, datos y estructuras del proyecto
//         * @param {JSON}   draft : es el borrador almacenado en el localStorage
//         * @param {object} args : parámetro para lanzar un inherited sobre FormContentProcessor
//         */
//        _showDiffDialog: function (value, draft, args) {
//
//            var data = {
//                document: this._getDocument(value),
//                draft: this._getDraft(draft)
//            };
//            var dataDocum = this._convertUnixDate(data.document.date);
//            var dataDraft = this._convertUnixDate(data.draft.date);
//            
//            var context = this;
//            var dialogParams = {
//                id: "project_diff",
//                ns: value.ns,
//                title: "S'ha trobat un esborrany del projecte",
//                message: "S'ha trobat un esborrany del projecte. Vols obrir la versió actual del formulari o l'esborrany?",
//                timeout: value.autosaveTimer * 1000,
//                closable: false,
//                buttons: [
//                    {
//                        id: "open_project",
//                        description: "Editar el formulari original del projecte",
//                        buttonType: 'default',
//                        callback: function(){
//                            context.contentTool.updateDocument(args[0]);
//                        }
//                    },
//                    {
//                        id: "open_project_draft",
//                        description: "Editar l'esborrany",
//                        buttonType: 'default',
//                        callback: function(){
//                            args[0].content.formValues = JSON.parse(draft.content);
//                            context.contentTool.updateDocument(args[0]);
//                        }
//                    }
//                ],
//                diff: {
//                    formDocum: data.document.content,
//                    formDraft: data.draft.content,
//                    labelDocum: "Formulari original (" + dataDocum + ")",
//                    labelDraft: "Esborrany (" + dataDraft + ")"
//                }
//            };
//
//            var dialog = this.dialogManager.getDialog(this.dialogManager.type.PROJECT_DIFF, value.id, dialogParams);
//            dialog.show();
//        },
//        
//        _getDocument: function (value) {
//            return {content: JSON.stringify(value.originalContent), date: value.extra.originalLastmod};
//        },
//
//        _getDraft: function (draft) {
//            return {content: draft.content, date: draft.date};
//        },
//        
//        _convertUnixDate: function (fecha) {
//            var p = 13 - fecha.toString().length; //He detectado fechas con menos dígitos de lo normal
//            if (p > 0) {
//                var mul = 1;
//                for (var i=0; i<p; i++) {
//                    mul *= 10;
//                }
//                fecha *= mul;
//            }
//            var d = new Date(parseInt(fecha));
//            return d.getDate() + "." + (d.getMonth()+1) + "." + d.getFullYear();
//        },
        
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
                    renderEngines: ['test', 'zoomable_form_element'],
                    editable: true // Activa el mode d'edició automàtica pels EditableElements
                };
            this.contentTool = contentToolFactory.generate(contentToolFactory.generation.PROJECT_EDIT, args);    
            return this.contentTool;
        },

        _initTimer: function (params, dispatcher) {
            var contentTool = registry.byId(params.id);
            var paramsOnExpire = params.timer.dialogOnExpire;
            paramsOnExpire.contentTool = contentTool;
            paramsOnExpire.closable = false;
            paramsOnExpire.timeout = params.timer.timeout;
            contentTool.initTimer({
                onExpire: function (ptimer) {
                    // a) Si hi ha canvis:
                    if (ptimer.contentTool.isContentChanged()) {
                        // 1) enviar demanda de bloqueig
                        ptimer.contentTool.fireEvent(ptimer.contentTool.eventName.REFRESH_EDITION);
                        // 2) Mostrar diàleg no closable informant que s'ha sobrepassat el temps
                        //    de bloqueig sense cap activitat. 
                        //    Es pregunta si es guarden els canvis o bé es cancel·la l'edició.
                        //    Avisa que si no es contesta el en X temps, es calcel·laran els canvis.
                        //    La cancel·lació s'envia forçant la cancel·lació 
                        //    dels canvis + un alerta informant del fet
                        ptimer.id = ptimer.contentTool.id;
                        var dialogManager = dispatcher.getDialogManager();
                        var dialog = dialogManager.getDialog(dialogManager.type.LOCK_EXPIRING
                                        , "lockExpiring_" + ptimer.contentTool.id
                                        , ptimer);
                        ptimer.contentTool.getContainer().selectChild(ptimer.contentTool);
                        dialog.show();
                    // b) Si no hi ha canvis, es cancel·la sense avís previ, però a més
                    //    de l'html s'envia també una alerta informant del fet
                    }else {
                        ptimer.contentTool.fireEvent(
                            ptimer.cancelContentEvent,
                            ptimer.cancelEventParams);
                    }
                },
                paramsOnExpire: paramsOnExpire
            });
            contentTool.startTimer(params.timer.timeout);
            //Añade un mensaje de tiempo
            dispatcher.getInfoManager().setExtraInfo({priority: 0, message: "temps d'inactivitat permès: "+(paramsOnExpire.timeout/1000)+" segons"});
        }

    });
    
});
