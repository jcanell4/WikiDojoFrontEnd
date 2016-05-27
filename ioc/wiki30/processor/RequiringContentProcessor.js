define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory",
    "dijit/registry",
    'ioc/gui/DialogBuilder'
], function (declare, ContentProcessor, contentToolFactory, registry, DialogBuilder) {

    return declare([ContentProcessor],
        /**
         * Aquesta classe s'encarrega de processar les dades i generar un document editable.
         *
         * @class DataContentProcessor
         * @extends ContentProcessor
         * @author Josep Cañellas <jcanell4@ioc.cat>, Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "requiring",

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
                var ret = this.inherited(arguments);
                
                if(value.action==="dialog"){
                    var timer;
                    
                    value.timer.onExpire = function(params){
                        dispatcher.getEventManager().fireEvent(
                                value.timer.eventOnExpire, params);
                       };                        

                    value.timer.onCancel = function(params){
                        dispatcher.getEventManager().fireEvent(
                                value.timer.eventOnCancel, params);
                       };                        
                    
                    var contentTool = registry.byId(value.id);
                    this._initTimer(value, contentTool);
                    this._processTimerDialog(value, contentTool, dispatcher);
                }else if(value.action==="refresh"){
                    var contentTool = registry.byId(value.id);
                    contentTool.refreshTimer(value.timer.timeout, value.timer.paramsOnExpire);
                }
                
                return ret;
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
                dispatcher.getGlobalState().getContent(value.id)["action"] = "edit"; //ALERTA. TODO [Josep] Cal posr requiring i canviar la funció d'updating
                dispatcher.getGlobalState().getContent(value.id).readonly = true;
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
                    originalContent: content.content.text,
                    type: this.type,
                    locked: true,
                    readonly: true,
                    rev: content.rev
                };

                var contentTool = contentToolFactory.generate(contentToolFactory.generation.REQUIRING, args);

                return contentTool;
            },

            _initTimer: function(params, contentTool){
                if(params.timer.onCancel){
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
                var refId = "requiring_timer",
                       generateDialog = function(func){
                            var dialogParams = {
                                dispatcher: dispatcher,
                                id: "DlgRequiringTimer",
                                ns: params.ns, 
                                title: params.dialog.title,
                                message: params.dialog.message,
                                closable: true
                            };
                            var builder =  new DialogBuilder(dialogParams),
                                    dialogManager = dispatcher.getDialogManager(),
                                    dlg;

                            dlg = dialogManager.getDialog(refId, builder.getId());
                            if(!dlg){
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
            }
        });
});