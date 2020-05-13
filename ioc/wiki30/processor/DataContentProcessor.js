define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory",
    "dijit/registry",
    "ioc/wiki30/manager/EventFactory",
], function (declare, ContentProcessor, contentToolFactory, registry, EventFactory) {

    var editorsByFormat = {
        'html':'Dojo',
        'Dojo':'Dojo',
        'ACE' : 'ACE'
    };


    /**
     * Aquesta classe s'encarrega de processar les dades i generar un document editable.
     *
     * @class DataContentProcessor
     * @extends ContentProcessor
     * @author Josep Cañellas <jcanell4@ioc.cat>, Xavier García <xaviergaro.dev@gmail.com>
     */
    return declare([ContentProcessor], {

        type: "data",
        backupPreviousState: null,
        contador: 0,

        /**
         * Processa el valor i crea un nou Editor amb la informació i el lliga al Dispatcher passat com argument.
         * Desprès de efectuar les operacions necessaries delega a la classe ContentTool per continuar amb
         * la seqüència del processament.
         *
         * @param {EditorContent} value - Informació per generar l'editor
         * @param {Dispatcher} dispatcher - Dispatcher al que està lligat el ContentTool que es generarà
         * @returns {int} - El valor de return es un enter que depèn del resultat del valor retornat per la superclasse.
         * @override
         */
        process: function (value, dispatcher) {
            // Backup Previous State
            if (dispatcher.getGlobalState().getContent(value.id)) {
                this.backupPreviousState = jQuery.extend(true, {}, dispatcher.getGlobalState().getContent(value.id));
            };

            var ret;

            var draft = dispatcher.getDraftManager().getContentLocalDraft(value.ns);
            if (!jQuery.isEmptyObject(draft)) {
                dispatcher.getInfoManager().setExtraInfo({priority:0, message:LANG.template['ioc-template'].has_draft});
            }

            if (value.recover_draft) {
                var draftContent;
                if (value.recover_draft.recover_local_draft === true) {
                    //console.log("** Recuperant draft local **");
                    draftContent = this._getLocalDraftContent(value, dispatcher);
                } else if (value.recover_draft.recover_draft === true && value.draft !== null) {
                    //console.log("** Recuperant draft remot **");
                    draftContent = value.draft.content;

                } else {
                    //console.log("** Document original, no hi ha draft **");
                    // No s'ha demanat recuperar cap draft, o no s'ha enviat el draft per recuperar
                }

                value.originalContent = value.content;
                value.content = draftContent;
            }

            if (value.rev) {
                dispatcher.getGlobalState().getContent(value.id).rev = value.rev;
            }

            ret = this.inherited(arguments);

            if (value.timer) {
                this._initTimer(value, dispatcher);
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
            dispatcher.getGlobalState().getContent(value.id)["action"] = "edit";
            dispatcher.getGlobalState().getContent(value.id).readonly = value.editing ? value.editing.readonly : false;
            dispatcher.getGlobalState().getContent(value.id).rev = value.rev;

            // Restore previous State
            // TODO: Considerar si caldria copiar tots els estates que no s'han tornat a enviar des del servidor
            if (this.backupPreviousState && this.backupPreviousState.projectOwner) {
                dispatcher.getGlobalState().getContent(value.id).projectOwner = this.backupPreviousState.projectOwner;
                dispatcher.getGlobalState().getContent(value.id).projectSourceType = this.backupPreviousState.projectSourceType;
            }
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
            // console.log("DataContentProcessor#createContentTool", content);

            var args = {
                ns: content.ns,
                id: content.id,
                title: content.title,
                baseContent: content.content,
                content: content,
                closable: true,
                dispatcher: dispatcher,
                originalContent: content.originalContent ? content.originalContent : content.content,
                type: this.type,
                locked: content.editing.locked,
                readonly: content.editing.readonly,
                rev: content.rev,
                ignoreLastNSSections: content.ignoreLastNSSections,
                cancelDialogConfig: content.extra.dialogSaveOrDiscard,
                messageChangesDetected: content.extra.messageChangesDetected,
            };

            if (content.autosaveTimer) {
                args["autosaveTimer"] = content.autosaveTimer;
            }

            // console.log("Ha arribat el format?", content.format, editorsByFormat[content.format]);

            if (content.format !== undefined && editorsByFormat[content.format]) {
                args.editorType = editorsByFormat[content.format];

            } else if (dispatcher.getGlobalState().userState) {
                // console.log("No hi ha modificador d'editor, utilitzant el de l'usuari");
                args.editorType = dispatcher.getGlobalState().userState['editor'];
            }

            return contentToolFactory.generate(contentToolFactory.generation.EDITOR, args);
        },


        _getLocalDraftContent: function (value, dispatcher) {
            // console.log("DataContentProcessor#_getLocalDraftContent");
            var draft = dispatcher.getDraftManager().getDraft(value.id, value.ns),
                draftContent = draft.recoverLocalDraft().full.content;

            return draftContent;
        },

        _initTimer: function (params, dispatcher) {
            var contentTool = registry.byId(params.id);
            var paramsOnExpire = params.timer.dialogOnExpire;
            paramsOnExpire.contentTool = contentTool;
            paramsOnExpire.closable = false;
            paramsOnExpire.timeout = params.timer.timeout;
            var self = this;
            // console.log("DataContentProcessor#_initTimer:contador=", this.contador);
            contentTool.initTimer({
                onExpire: function (ptimer) {
                    // a) Si hi ha canvis:
                    if (ptimer.contentTool.isContentChanged()) {
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
                            , "lockExpiring_" + ptimer.contentTool.id
                            , ptimer);
                        ptimer.contentTool.getContainer().selectChild(ptimer.contentTool);
                        self.contador += 1;
                        // console.log("DataContentProcessor#_initTimer#onExpire:contador =", self.contador);
                        dialog.show();
                        // b) Si no hi ha canvis, es cancel·la sense avís previ, però a mé 
                        //                  de l'html s'envia també una alerta informant del fet
                    } else {
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
