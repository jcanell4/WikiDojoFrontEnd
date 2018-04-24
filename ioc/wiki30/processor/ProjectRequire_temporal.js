define([
    "dojo/_base/declare",
    "dijit/registry",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory",
    'ioc/gui/DialogBuilder'
], function (declare, registry, ContentProcessor, contentToolFactory, DialogBuilder) {
    /**
     * Aquesta classe s'encarrega de gestionar un bloqueix d'edició.
     *
     * @class ProjectRequireContentProcessor
     * @extends FormContentProcessor
     * @culpable Rafael Claver
     */
    return declare([ContentProcessor], {
        
        type: "project_require",

        /**
         * En funció de l''action' genera un quadre de diàleg o un refresc de la petició
         *
         * @param {object} value - Valors i paràmetres rebuts del servidor
         * @param {Dispatcher} dispatcher - Dispatcher al que està lligat el ContentTool que es generarà
         * @returns {int} - Un enter retornat per la superclasse.
         * @override
         */
        process: function (value, dispatcher) {
            var contentTool;
            var ret = this.inherited(arguments);

            if (value.action === "dialog"){
                contentTool = registry.byId(value.id);

                value.timer.onExpire = function(params){
                        dispatcher.getEventManager().fireEvent(value.timer.eventOnExpire, params);
                    };                        

                value.timer.onCancel = function(params){
                        dispatcher.getEventManager().fireEvent(value.timer.eventOnCancel, params);
                    };                        

                this._initTimer(value, contentTool);
                this._processTimerDialog(value, contentTool, dispatcher);
            }
            else if (value.action === "refresh"){
                console.log("ProjectRequireContentProcessor: Refrescant timer durant " + value.timer.timeout + "s");
                contentTool = registry.byId(value.id);
                contentTool.refreshTimer(value.timer.timeout, value.timer.paramsOnExpire);
            }

            return ret;
        },

        /**
         * Actualitza els valors del dispatcher i el GlobalState
         * @override
         */
        updateState: function (dispatcher, value) {
            this.inherited(arguments);
            dispatcher.getGlobalState().getContent(value.id)["projectType"] = value.extra.projectType;
            if (value.extra) {
                dispatcher.getGlobalState().getContent(value.id)['rev'] = value.extra.rev;
                dispatcher.getGlobalState().getContent(value.id)['isRevision'] = (value.extra.rev) ? true : false;
            }
            dispatcher.getGlobalState().getContent(value.id).readonly = true;
        },

        createContentTool: function (content, dispatcher) {
            var args = {
                    ns: content.ns,
                    id: content.id,
                    title: content.title,
                    closable: true,
                    dispatcher: dispatcher,
                    projectType: content.extra.projectType,
                    type: this.type,
                    /*
                    content: content.content,
                    originalContent: content.originalContent,
                    isRevision: content.isRevision,
                    autosaveTimer: content.autosaveTimer,
                    rev: content.rev || '',
                    locked: true,
                    readonly: true,*/
                };
            return contentToolFactory.generate(contentToolFactory.generation.PROJECT_REQUIRE, args);
        },

        _initTimer: function(params, contentTool){
            //console.log("RequiringContentProcessor#_initTimer", params);
            if (params.timer.onCancel){
                contentTool.initTimer({
                        onExpire: params.timer.onExpire,
                        paramsOnExpire: params.timer.paramsOnExpire,
                        onCancel: params.timer.onCancel,
                        paramsOnCancel: params.timer.paramsOnCancel
                    });
            }else{
                contentTool.initTimer({
                        onExpire: params.timer.onExpire,
                        paramsOnExpire: params.timer.paramsOnExpire
                    });
            }
        },

        _processTimerDialog: function(params, contentTool, dispatcher){
            var refId = "require_project_timer";
            var generateDialog = function(func){
                var dialogParams = {
                    dispatcher: dispatcher,
                    id: "DlgRequiringTimer",
                    ns: params.ns, 
                    title: params.dialog.title,
                    message: params.dialog.message,
                    closable: true
                };
                var builder = new DialogBuilder(dialogParams),
                    dialogManager = dispatcher.getDialogManager(),
                    dlg;

                dlg = dialogManager.getDialog(refId, builder.getId());
                if (!dlg){
                    var button = {
                        id: refId + '_ok',
                        buttonType: 'default',
                        description: params.dialog.ok.text,
                        callback: func
                    };
                    builder.addButton(button.buttonType, button);
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
        _showTimerDialog: function (value, draft, args) {
            var dialogParams = {
                id: "projectDlgRequiringTimer",
                ns: value.ns,
                title: value.dialog.title,
                message: value.dialog.message,
                closable: true,
                timeout: value.autosaveTimer * 1000,
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
        */

        isRefreshableContent: function (oldType) {
            return (oldType === 'project_require');
        }
        
    });
    
});