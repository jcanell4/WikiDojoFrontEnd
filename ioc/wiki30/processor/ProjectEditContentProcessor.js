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

        editable: true,

        process: function (value, dispatcher) {
            var subSet;
            var args = arguments;
            //Se añade un array (key:value) con los datos originales del formulario
            //(nota: los datos de este nuevo array se cambiarán si existe un borrador)
            args[0].content.formValues = args[0].originalContent;

            //Se copian ciertos valores del 'paquete extra'
            if (value.extra) {
                if (value.extra.hasDraft) {
                    args[0].hasDraft = value.extra.hasDraft;
                }
                subSet = (value.extra.metaDataSubSet) ? value.extra.metaDataSubSet : ((value.metaDataSubSet) ? value.metaDataSubSet : "main");
                this.draftManager = dispatcher.getDraftManager();
                var localDraft = this.draftManager.getContentLocalDraft(value.ns, subSet);
                if (value.extra.recover_draft && localDraft && localDraft.project && localDraft.project.content) {
                    //si se pide, sustituimos los datos del formulario por los datos guardados en el draft local
                    args[0].content.formValues = JSON.parse(localDraft.project.content);
                }
            }
            
            //Con la incorporación del array de datos del formulario y los valores extra, llamamos a la secuencia principal
            //que creará el contentTool, creará la pestaña y mostrará el formulario con los datos originales 
            //antes de preguntar si existe un borrador
            var ret = this.inherited(args);
            //el resto está en ProjectViewContentProcessor
            
            if (value.timer) {
                this._initTimer(value, dispatcher);
            }
            return ret;
        },
        
        createContentTool: function (content, dispatcher) {
            var args = {
                    ns: content.ns,
                    id: content.id,
                    metaDataSubSet: content.extra.metaDataSubSet,
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
                    renderEngines: ['editable_elements', 'zoomable_form_element'],
                    editable: this.editable, // Activa el mode d'edició automàtica pels EditableElements
                    showOnlyOneElement: this.showOnlyOneElement
                };
            this.contentTool = contentToolFactory.generate(contentToolFactory.generation.PROJECT_EDIT, args);    
            return this.contentTool;
        },

         updateState: function (dispatcher, value) {
            this.inherited(arguments);
            //Lo siguiente ya lo hace el padre, por tanto, no es necesario
            if (value.extra) {
                dispatcher.getGlobalState().getContent(value.id)['metaDataSubSet'] = value.extra.metaDataSubSet;
            }
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
            
            if (paramsOnExpire.timeout > 0) {
                contentTool.startTimer(params.timer.timeout);
                //Añade un mensaje de tiempo
                dispatcher.getInfoManager().setExtraInfo({priority: 0, message: "temps d'inactivitat permès: "+(paramsOnExpire.timeout/1000)+" segons"});
            }
        }

    });
    
});
