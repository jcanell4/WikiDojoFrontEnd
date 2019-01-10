define([
    "dojo/_base/declare",
    "dijit/registry",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory",
    'ioc/gui/DialogBuilder'
], function (declare, registry, ContentProcessor, contentToolFactory, DialogBuilder) {
    /**
     * @class ProjectRequireContentProcessor: gestiona la resposta a la petició d'edició d'un formulari de projecte que està bloquejat
     * @extends ContentProcessor
     * @culpable Rafael Claver
     */
    return declare([ContentProcessor], {
        
        type: "project_require",
        action: "project_view",

        /**
         * En funció de l''action' genera un quadre de diàleg o un refresc de la petició
         *
         * @param {object} value - Valors i paràmetres rebuts del servidor
         * @param {Dispatcher} dispatcher - Dispatcher al que està lligat el ContentTool que es generarà
         * @returns {int} - Un enter retornat per la superclasse.
         * @override
         */
        process: function (value, dispatcher) {
            var args = arguments;
            //Se añade un array (key:value) con los datos originales del formulario
            args[0].content.formValues = args[0].originalContent;
            if (value.extra) {
                args[0].isRevision = (value.extra.rev) ? true : false;
                if (value.extra.metaDataSubSet)
                    args[0].metaDataSubSet = value.extra.metaDataSubSet;
            }

            var ret = this.inherited(args);
            var contentTool = registry.byId(value.id);
            
            if (value.action === "dialog"){
                value.timer.onExpire = function(params){
                        dispatcher.getEventManager().fireEvent(value.timer.eventOnExpire, params);
                    };                        

                value.timer.onCancel = function(params){
                        dispatcher.getEventManager().fireEvent(value.timer.eventOnCancel, params);
                    };                        

                this._initTimer(value.timer, contentTool);
                this._processTimerDialog(value, contentTool, dispatcher);
            }
            else if (value.action === "refresh"){
                //console.log("ProjectRequireContentProcessor#process: Refrescant timer durant " + (value.timer.timeout/1000) + " s");
                contentTool.refreshTimer(value.timer.timeout, value.timer.paramsOnExpire);
            }

            return ret;
        },

        /**
         * Actualitza els valors de GlobalState
         * @override
         */
        updateState: function (dispatcher, value) {
            this.inherited(arguments);
            if (value.extra) {
                dispatcher.getGlobalState().getContent(value.id).projectType = value.extra.projectType;
                dispatcher.getGlobalState().getContent(value.id).rev = value.extra.rev;
                dispatcher.getGlobalState().getContent(value.id).isRevision = (value.extra.rev) ? true : false;
                if (value.extra.metaDataSubSet)
                    dispatcher.getGlobalState().getContent(value.id).metaDataSubSet = value.extra.metaDataSubSet;
            }
            dispatcher.getGlobalState().getContent(value.id).readonly = true;
            dispatcher.getGlobalState().getContent(value.id).action = this.action;
        },

        createContentTool: function (content, dispatcher) {
            //console.log("ProjectRequireContentProcessor#createContentTool: content.id =", content.id);
            var args = {
                    ns: content.ns,
                    id: content.id,
                    title: content.title,
                    closable: true,
                    dispatcher: dispatcher,
                    projectType: content.extra.projectType,
                    type: this.type,
                    content: content.content,
                    originalContent: content.originalContent,
                    isRevision: content.isRevision,
                    locked: true,
                    readonly: true
                    /*autosaveTimer: content.autosaveTimer,*/
                };
                if (content.extra.metaDataSubSet) {
                    args.metaDataSubSet = content.extra.metaDataSubSet;
                }
            return contentToolFactory.generate(contentToolFactory.generation.PROJECT_REQUIRE, args);
        },

        _initTimer: function(timer, contentTool){
            if (timer.onCancel){
                contentTool.initTimer({
                        onExpire: timer.onExpire,
                        paramsOnExpire: timer.paramsOnExpire,
                        onCancel: timer.onCancel,
                        paramsOnCancel: timer.paramsOnCancel
                    });
            }else{
                contentTool.initTimer({
                        onExpire: timer.onExpire,
                        paramsOnExpire: timer.paramsOnExpire
                    });
            }
        },

        _processTimerDialog: function(params, contentTool, dispatcher){
            var refId = "require_project_timer";
            var query = "id="+params.ns + "&projectType="+params.extra.projectType + (params.extra.metaDataSubSet ? "&metaDataSubSet="+params.extra.metaDataSubSet : "") + (params.rev ? "&rev="+params.rev : "");
            var generateDialog = function(func){
                var dialogParams = {
                    dispatcher: dispatcher,
                    id: "dlgRequireProjectTimer",
                    ns: params.ns, 
                    title: params.dialog.title,
                    message: params.dialog.message,
                    closable: true
                };
                var builder = new DialogBuilder(dialogParams);
                var dialogManager = dispatcher.getDialogManager();
                var dlg = dialogManager.getDialog(refId, builder.getId());
                if (!dlg){
                    var button_ok = {
                        id: refId + '_ok',
                        buttonType: 'default',
                        description: params.dialog.ok.text,
                        extra: {
                            ns: params.ns,
                            dataToSend: query
                        },
                        callback: func
                    };
                    builder.addButton(button_ok.buttonType, button_ok);
                    builder.addCancelDialogButton({description: params.dialog.cancel.text});

                    dlg = builder.build();
                    dialogManager.addDialog(refId, dlg);
                }

                dlg.show();            
            };
                
            generateDialog(function(){
                contentTool.startTimer(params.timer.timeout);
            });
        },
        /*
        _showTimerDialog: function (value, contentTool, args) {
            var refId = "require_project_timer";
            var dialogParams = {
                    id: "dlgRequireProjectTimer",
                    ns: value.ns,
                    title: value.dialog.title,
                    message: value.dialog.message,
                    closable: true,
                    timeout: value.autosaveTimer * 1000
                }
            var buttons = 
                [
                    {
                        id: refId + '_ok',
                        buttonType: 'default',
                        description: value.dialog.ok.text,
                        callback: function(){
                            contentTool.startTimer(value.timer.timeout);
                        }
                    },
                    {
                        id: refId + '_cancel',
                        description: value.dialog.cancel.text,
                        buttonType: 'default',
                        callback: function(){
                            args[0].content.formValues = JSON.parse(draft.content);
                            context.contentTool.updateDocument(args[0]);
                        }
                    }
                ];
            };
            var params = {dialogParams: dialogParams, buttons: buttons};
            var dialog = this.dialogManager.getDialog(this.dialogManager.type.PROJECT_DIFF, value.id, dialogParams);
            dialog.show();
        },
        */

        isRefreshableContent: function (oldType) {
            return (oldType === this.type);
        }
        
    });
    
});