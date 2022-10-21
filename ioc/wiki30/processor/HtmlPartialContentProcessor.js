define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory",
    "dijit/registry"
], function (declare, ContentProcessor, contentToolFactory, registry) {

    return declare([ContentProcessor],
        /**
         * Aquesta classe s'encarrega de processar els continguts per documents de tipus Html, generar els ContentTool
         * apropiat i afegir-lo al contenidor adequat.
         *
         * @class HtmlContentProcessor
         * @extends ContentProcessor
         * @author Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "html_partial",

            /**
             * Processa el valor rebut com argument com a un document estructurat. Si el doucument ja existeix refresca
             * la informació.
             *
             * @param {*} value - Valor per processar
             * @param {Dispatcher} dispatcher - Dispatcher al que està lligat aquest document.
             * @override
             */
            process: function (value, dispatcher) {

                var changesManager = dispatcher.getChangesManager(),
                    cache = dispatcher.getContentCache(value.id),
                    confirmation = false,
                    clearDraft = 0,             //0 = no eliminar, 1 = eliminar parcial, 2 = eliminar tot
                    contentTool, draft, ret;

                draft = dispatcher.getDraftManager().getContentLocalDraft(value.ns);
                if (JSON.stringify(draft) !== "{}") { //jQuery.isEmptyObject(draft)
                    dispatcher.getInfoManager().setExtraInfo({priority:0, message:LANG.template['ioc-template'].has_draft});
                }
                if (cache) {
                    contentTool = cache.getMainContentTool();
                }

                // TODO[Xavi] Refactoritzar, massa condicionals
                if (contentTool && contentTool.type === this.type && !value.discard_changes) { // Alerta [Xavi] afegit nou per forçar els discards

                    // Es una actualització
                    contentTool.getContainer().selectChild(contentTool);

                    // Es una nova edició?

                    // TODO[Xavi] Quan s'ha guardat el isChanged retorna false, s'ha de forçar una comprovació de canvis, però aquest mètode hauria de ser privat
                    contentTool._checkChanges();
                    
                    //S'ha cancel·lat
                    if (value.cancel){

                        if (value['discard_changes_partial']) {
                            confirmation = true;

                        } else if (contentTool.isAnyChunkChanged(value.cancel)) {
                            confirmation = dispatcher.discardChanges();
                        } else {
                            //console.log("no hi han canvis, es descarla el cancel·lat! Cas 1");
                            confirmation = true;
                        }
                        clearDraft=1;
                    }else if(!value.selected && !value.cancel){
                        if (changesManager.isChanged(value.id)){
                            confirmation = dispatcher.discardChanges();
                        } else {
                            confirmation = true;
                        }
                        clearDraft=2;
                    }else{
                        confirmation = true;
                    }

                    contentTool.rev = value.rev;

                    if (confirmation) {
                        if(clearDraft===1){
                            dispatcher.getDraftManager().clearDraftChunks(value.id, value.ns, value.cancel);
                            if(value.hasDraft){
                                this._clearRemoteDraftChunks(value, dispatcher);
                            }
                        }else if(clearDraft===2){
                            dispatcher.getDraftManager().clearDraft(value.id, value.ns);
                            if(value.hasDraft){
                                this._clearRemoteDraft(value, dispatcher);
                            }                            
                        }
                        if (value.cancel) {
                            contentTool.resetChangesForChunks(value.cancel);
                        } else if (!value.selected) {
                            contentTool.resetAllChangesForChunks();
                        }
                        //HardCODED RAFA
                        value.editing = {readonly:value.readonly};  //HardCODED RAFA

                        // Alerta[Xavi] la informació del dialog només s'ha d'afegir quan s'edita el primer chunk
                        if (!contentTool.cancelDialogConfig && value.extra) {
                            contentTool.cancelDialogConfig = value.extra.dialogSaveOrDiscard;
                            contentTool.cancelAllDialogConfig = value.extra.dialogSaveOrDiscardAll,
                            contentTool.messageChangesDetected =  value.extra.messageChangesDetected;
                        }

                        if (dispatcher.getGlobalState().userState) {
                            value.editorType = dispatcher.getGlobalState().userState['editor'];
                        }

                        contentTool.updateDocument(value);

                        dispatcher.getGlobalState().getContent(value.id).rev = contentTool.rev; // ALERTA[Xavi] posava content.rev, això no pot ser, es referia contentTool.rev (que a la seva vegada es el mateix que value.rev)?
                    }
                } else {
                    // No hi ha tipus previ de contenttool, o el tipus del contenttol era diferent
                    if(contentTool && contentTool.type == "requiring_partial"){
                        //Cal aturar la cancelació automàtica en tancar el contentTool!
                        contentTool.stopTimer();
                    }
                    ret = this.inherited(arguments);
                    
                    if (value.timer) {
                        this._initTimer(value, dispatcher);
                    }
                    return ret;
                }

                var contentCache = dispatcher.getGlobalState().getContent(value.id);

                if (contentCache && contentCache.rev !== value.rev) {
                    dispatcher.getGlobalState().getContent(value.id).rev = value.rev;
                }

                if (value.timer) {
                    this._initTimer(value, dispatcher);
                }

                return confirmation ? 0 : 100;
            },
            
            _clearRemoteDraft: function(value, dispatcher){
                //console.log("HtmlPartialContentProcessor#_clearRemoteDraft");
                dispatcher.getEventManager().fireEvent(
                    dispatcher.getEventManager().eventName.REMOVE_DRAFT, {
                        id: value.id,
                        dataToSend: {
                            id: value.ns,
                            type:'structured'
                        },
                        standbyId: dispatcher.containerNodeId
                    },
                    value.id
                );  
            },
            _clearRemoteDraftChunks: function(value, dispatcher){
                // console.log("HtmlPartialContentProcessor#_clearRemoteDraftChunks");
                for(var i=0; i<value.cancel.length; i++){
                    dispatcher.getEventManager().fireEvent(
                        dispatcher.getEventManager().eventName.REMOVE_DRAFT, {
                            id: value.id,
                            dataToSend: {
                                id: value.ns,
                                type:'structured',
                                section_id:value.cancel[i]
                            },
                            standbyId: dispatcher.containerNodeId
                        },
                        value.id
                    );  
                }
            },

            /**
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument, i afegeix
             * el valor de la acció a "view".
             *
             * @param {Dispatcher} dispatcher - Dispatcher al que està lligat aquest process
             * @param {Content} value - Valor per processar
             * @override
             */
            updateState: function (dispatcher, value) {
                var contentTool = registry.byId(value.id);
                var globalState = dispatcher.getGlobalState();
                var gContent = globalState.getContent(value.id);
                this.inherited(arguments);

                if (contentTool.hasEditors()){
                    gContent.action = "sec_edit"; // ALERTA[xavi] això quan es fa servir?
                    if (!globalState.getCurrentElementState() && value.selected){
                        contentTool.setCurrentElement(value.selected);
                    }
                }else{
                    gContent.action = "view"; // ALERTA[xavi] això quan es fa servir?
                }
                gContent.rev = value.rev;
                gContent.perm = value.perm;
            },

            /**
             * Genera un ContentTool decorat adecuadament per funcionar com document de només lectura.
             *
             * @param {Content} content - Contingut a partir del qual es generarà el ContentTool
             * @param {Dispatcher} dispatcher - Dispatcher al que estarà lligat el ContentTool
             * @returns {ContentTool} ContentTool decorat com a tipus document.
             * @protected
             * @override
             */
            createContentTool: function (content, dispatcher) {
                var args = {
                    ns: content.ns,
                    id: content.id,
                    title: content.title,
                    content: content,
                    closable: true,
                    dispatcher: dispatcher,
                    rev: content.rev || '',
                    type: this.type,
                    readonly: content.readonly? content.readonly : false,
                    ignoreLastNSSections : content.ignoreLastNSSections,
                    editorType : content.editorType,
                    plugins: ['EmbededComment'],
                    partialDisabled: content.partialDisabled // TODO: rebre aquest param des del servidor
                };

                if(content.autosaveTimer){
                    args.autosaveTimer = content.autosaveTimer;
                }

                if (dispatcher.getGlobalState().userState) {
                    args.editorType = dispatcher.getGlobalState().userState['editor'];
                }


                
                return contentToolFactory.generate(contentToolFactory.generation.STRUCTURED_DOCUMENT, args);
            },

            // ALERTA[Xavi] Adaptat del DataContentProcessor
            _initTimer: function(params, dispatcher){
                var contentTool = registry.byId(params.id);
                var paramsOnExpire = params.timer.dialogOnExpire;
                paramsOnExpire.contentTool = contentTool;
                paramsOnExpire.closable = false;
                paramsOnExpire.timeout = params.timer.timeout;
                contentTool.initTimer({
                    onExpire: function(ptimer){
                        // ALERTA[Xavi] Si no existeix el ptimer retornem sense fer res, sembla que no es cancel·la el timer si es torna manualment
                        if (!ptimer) {
                            return;
                        }

                        // a) Si hi ha canvis:
                        if(ptimer.contentTool.isContentChanged()){
                            //          1) enviar demanda de bloqueig
                            ptimer.contentTool.fireEvent(ptimer.contentTool.eventName.REFRESH_EDITION);
                            //          2) Mostrar diàleg no closable informant
                            //                  que s'ha sobrepassat el temps de bloqueig
                            //                  sense cap activitat i per tant es demana
                            //                  si es guarden els canvis o bé es cancel·la
                            //                  l'edició.
                            //                  També s'avisa que si no es contesta el diàleg
                            //                  en X temps, es passarà a calcel·lar els canvis.
                            //                  La cancel·lació s'envia forçant la cancel·lació
                            //                  dels canvis + un alerta informant del fet
                            ptimer.id = ptimer.contentTool.id;
                            var dialog = dispatcher.getDialogManager().getDialog('lock_expiring'
                                , "lockExpiring_"+ptimer.contentTool.id
                                , ptimer);
                            ptimer.contentTool.getContainer().selectChild(ptimer.contentTool);
                            dialog.show();
                            // b) Si no hi ha canvis, es cancel·la sense avís previ, però a mé
                            //                  de l'html s'envia també una alerta informant del fet
                        }else{
                            ptimer.contentTool.fireEvent(
                                ptimer.cancelContentEvent,
                                ptimer.cancelEventParams);
                        }
                    },
                    paramsOnExpire: paramsOnExpire
                });
                
                contentTool.startTimer(params.timer.timeout);
            }

        });

});
