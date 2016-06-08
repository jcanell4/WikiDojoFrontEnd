define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory",
    "dijit/registry"
], function (declare, ContentProcessor, contentToolFactory, registry) {

    return declare([ContentProcessor],
        /**
         * Aquesta classe s'encarrega de processar les dades i generar un document editable.
         *
         * @class DataContentProcessor
         * @extends ContentProcessor
         * @author Josep Cañellas <jcanell4@ioc.cat>, Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "data",

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
                //console.log("DataContentProcessor#process", value);
//                var $form = jQuery(value.htmlForm),
//                    draftContent;
//
//                // Reemplaçem el contingut del content amb el del draft
//
                var contentTool
                var ret;
                if (value.recover_draft) {
                    var  draftContent;                
                    if (value.recover_draft.recover_local === true) {
                        draftContent =this._getLocalDraftContent(value, dispatcher);

                    } else if (value.recover_draft.recover_draft ===true && value.draft !=null) {
                        draftContent = value.draft.content;

                    } else {
                        // No s'ha demanat recuperar cap draft, o no s'ha enviat el draft per recuperar
                    }
//
//                    $form.find('textarea').html(draftContent);
//                    value.content = jQuery('<div>').append($form.clone()).html();

                    value.content = draftContent;
                }

                ret = this.inherited(arguments);
               
                this._initTimer(value, dispatcher);
                
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
                dispatcher.getGlobalState().getContent(value.id)["action"] = "edit";
                dispatcher.getGlobalState().getContent(value.id).readonly = value.editing?value.editing.readonly:false;
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
                    content: content,
                    closable: true,
                    dispatcher: dispatcher,
                    originalContent: this._extractContentFromNode(content),
                    type: this.type,
                    locked: content.editing.locked,
                    readonly: content.editing.readonly,
                    rev: content.rev
                };


                return contentToolFactory.generate(contentToolFactory.generation.EDITOR, args);
            },

            _extractContentFromNode: function (content) {
                //return  jQuery.trim(jQuery(content.content).find('textarea').val());
                return content.content;
            },

            _getLocalDraftContent: function(value, dispatcher) {
                var draft = dispatcher.getDraftManager().getDraft(value.id),
                    draftContent = draft.recoverLocalDraft().full.content;

                return draftContent;
            },
            
            _initTimer: function(params, dispatcher){
                var contentTool = registry.byId(params.id);
                var paramsOnExpire = params.timer.dialogOnExpire;
                paramsOnExpire.contentTool = contentTool;
                paramsOnExpire.closable = false;
                paramsOnExpire.timeout = params.timer.timeout;
                contentTool.initTimer({
                        onExpire: function(ptimer){
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