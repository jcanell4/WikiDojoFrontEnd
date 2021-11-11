define([
    'dojo/_base/declare',
    'ioc/wiki30/processor/AbstractResponseProcessor'
], function (declare, AbstractResponseProcessor) {
    return declare([AbstractResponseProcessor],
        // TODO[Xavi] Refactoritzar això i fer servir el mateix sistema pels DraftSelection i el draftProcessor <-- Fer servir el DraftProcessor DRAFT CONFLICT PROCESSOR com a base, perquè s'ha de fer servir el dispatcher
        /**
         * @class DraftProcessor
         * @extends AbstractResponseProcessor
         */
        {
            type: "draft",

            DEFAULT_DRAFT: {content: "No s'ha trobat l'esborrany", date: ''}, // TODO[Xavi] Localitzar el missatge

            /**
             * Processa un missatge de tipus alert el que fa que es configuri un dialeg i es mostri.
             *
             * @param {string} value - Missatge que es mostrarà
             * @param {Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {
                this.dispatcher = dispatcher;
                // console.log("DraftProcessor#process", value);
                this._processDialog(value, dispatcher);
            },

            /**
             * Configura el dialeg amb el text passat com argument i el mostra.
             * @private
             */
            _processDialog: function (value, dispatcher) {
                //console.log("DraftProcessor#_processDialog", value);
                this.eventManager = dispatcher.getEventManager();
                this.dialogManager = dispatcher.getDialogManager();
                this.draftManager = dispatcher.getDraftManager();

                this._setActionType(value);

                this.docId = value.id;
                this.docNs = value.ns;
                this.query = this._buildQuery(value);
                this.isLocalDraft = value.params.local;

                this._showDiffDialog(value);
            },

            _showDiffDialog: function (value) {
                // console.log("DraftProcessor#_showDiffDialog", value);
                var data = this._extractData(value);
                var dialogParams, dialog;

                if (data.document.content === data.draft.content) {

                    this.eventManager.fireEvent(this._getActionType(), { // Això fa referencia al eventManager del dialog
                        id: value.id,
                        ns: value.ns,
                        dataToSend: this._getDocumentQuery() + "&discard_draft=true"
                    }/*, observable*/);

                    console.warn("El content i el draft son iguals");
                    return;
                }

                dialogParams = {
                    id: 'diff',
                    ns: value.ns,
                    title: 'S\'ha trobat un esborrany',
                    message: 'S\'ha trobat un esborrany per aquest document. Vols obrir la versió actual del document o el esborrany trobat?',
                    timeout: value.timeout * 1000,
                    buttons: [
                        {
                            id: 'open_document',
                            description: 'Obrir el document',
                            buttonType: 'request_control',
                            extra: {
                                ns: value.ns,
                                eventType: this._getActionType(),
                                dataToSend: this._getDocumentQuery()
                            }
                        },
                        {
                            id: 'open_draft',
                            description: "Obrir l'esborrany",
                            buttonType: 'request_control',
                            extra: {
                                ns: value.ns,
                                eventType: this._getActionType(),
                                dataToSend: this._getDraftQuery()
                            }
                        }
                    ]
                };

                if (value.params.projectType) {
                    dialogParams.diff = {
                        formDocum: data.document.content,
                        formDraft: data.draft.content,
                        labelDocum: 'Document (' + data.document.date + ')',
                        labelDraft: 'Esborrany (' + data.draft.date + ')'
                    };
                    dialog = this.dialogManager.getDialog(this.dialogManager.type.PROJECT_DIFF, this.docId, dialogParams);
                }
                else {
                    dialogParams.diff = {
                        text1: data.document.content,
                        text2: data.draft.content,
                        text1Label: 'Document (' + data.document.date + ')',
                        text2Label: 'Esborrany (' + data.draft.date + ')'
                    };
                    dialog = this.dialogManager.getDialog(this.dialogManager.type.LOCKED_DIFF, this.docId, dialogParams);
                }

                dialog.show();
            },

            _extractData: function (value) {
                // console.log("DraftProcessor#_extractData", value);
                return {
                    document: this._getDocument(value.params),
                    draft: this._getDraft(value.params),
                    query: this._buildQuery(value)
                };
            },

            _getDocument: function (value) {
                return {content: value.content, date: value.lastmod};
            },

            _getDraft: function (value) {
                if (value.local) {
                    return this._getDraftLocal(value);
                } else {
                    return this._getDraftRemote(value);
                }
            },

            _getDraftLocal: function (value) {
                // console.log("DraftProcessor#_getDraftLocal", value);
                // console.log("docId:", this.docId);
                var draft = this.draftManager.getDraft(this.docId, this.docNs).recoverLocalDraft();

                switch (value.type) {
                    case 'full_document': //falling-through intencionat
                        return {content: draft.full.content, date: draft.full.date};
                    case 'partial_document':
                        if (draft.structured.content[value.selected]) {
                            return {
                                content: draft.structured.content[value.selected],
                                date: draft.structured.date
                            };
                        }
                }
                return this.DEFAULT_DRAFT;
            },

            _getDraftRemote: function (value) {
                if (value.draft) {
                    return {content: value.draft.content, date: value.draft.date};
                } else {
                    return this.DEFAULT_DRAFT;
                }
            },

            _buildQuery: function (value) {
                // console.log("DraftProcessor#_buildQuery", value);
                var query = '';

                switch (value.params.type) {
                    case 'project':
                    case 'full_document':
                        query += 'id=' + value.ns + (value.rev ? '&rev=' + value.rev : '');
                        break;

                    case 'partial_document':
                        query += 'id=' + value.ns
                            + (value.rev ? '&rev=' + value.rev : '')
                            + '&section_id=' + value.params.selected
                            + '&editing_chunks=' + value.params.editing_chunks;
                }
                query += this._getProjectParams();
                query += '&editorType=' + this.dispatcher.getGlobalState().userState['editor'];
                // console.log("Query built: ", query);
                return query;
            },

            _getDraftQuery: function () {
                // console.log("DraftProcessor#_getDraftQuery", this.query);
                var query = this.query;

                if (this.isLocalDraft) {
                    query += '&recover_local_draft=true';
                }
                return query + '&recover_draft=true';
            },

            _getProjectParams: function() {
                var params = '';
                var contentCache = this.dispatcher.getGlobalState().getContent(this.docId);

                if (contentCache.projectOwner) {
                    params += "&projectOwner=" + contentCache.projectOwner;
                    params += "&projectSourceType=" + contentCache.projectSourceType;
                }else if (contentCache.projectType) {
                    params += "&projectType=" + contentCache.projectType;
                }
                return params;
            },

            _getDocumentQuery: function () {
                // return this.query + '&recover_draft=false&editorType=' + this.dispatcher.getGlobalState().userState['editor'];
                return this.query + '&recover_draft=false';
            },

            _setActionType: function (value) {
                switch (value.params.type) {
                    case 'full_document':
                        this.documentType = this.eventManager.eventName.EDIT;
                        break;
                    case 'partial_document':
                        this.documentType = this.eventManager.eventName.EDIT_PARTIAL;
                        break;
                    case 'project':
                        this.documentType = this.eventManager.eventName.EDIT_PROJECT;
                        break;
                }
            },

            _getActionType: function () {
                return this.documentType;
            }

        });
});

