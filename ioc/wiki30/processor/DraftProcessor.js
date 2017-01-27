define([
    'dojo/_base/declare',
    'ioc/wiki30/processor/AbstractResponseProcessor',
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
                this._processDialog(value, dispatcher);
            },

            /**
             * Configura el dialeg amb el text passat com argument i el mostra.
             *
             * @private
             */
            _processDialog: function (value, dispatcher) {
                //console.log("DraftProcessor#_processDialog", value);

                this.eventManager = dispatcher.getEventManager();
                this.dialogManager = dispatcher.getDialogManager();
                this.draftManager = dispatcher.getDraftManager();

                this._setActionType(value);

                this.docId = value.id;
                this.query = this._buildQuery(value);
                this.isLocalDraft = value.params.local;

                this._showDiffDialog(value);
            },

            _showDiffDialog: function (value) {
                // console.log("DraftProcessor#_showDiffDialog", value);

                var data = this._extractData(value),
                    dialogParams;

                if (data.document.content ===  data.draft.content) {
                    alert("El content i el draft son iguals");
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
                                    eventType: this._getActionType(),
                                    dataToSend: this._getDocumentQuery(),
                                }

                            },
                            {
                                id: 'open_draft',
                                description: "Obrir l'esborrany",
                                buttonType: 'request_control',
                                extra: {
                                    eventType: this._getActionType(),
                                    dataToSend: this._getDraftQuery()
                                }
                            }
                        ],
                        diff: {
                            text1: data.document.content,
                            text2: data.draft.content,
                            text1Label: 'Document (' + data.document.date + ')',
                            text2Label: 'Esborrany (' + data.draft.date + ')'
                        }
                    };

                var dialog = this.dialogManager.getDialog(this.dialogManager.type.LOCKED_DIFF, this.docId, dialogParams);
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
//                switch (value.type) {
//                    case 'full_document':
//////                        var currentContent = jQuery(value.content).find('textarea').val();
////                        var currentContent = value.content;
//                        return {content: value.content, date: value.lastmod};
//
//                    case 'partial_document':
//                        return {content: value.content, date: value.lastmod};
//                }

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
                var draft = this.draftManager.getDraft(this.docId).recoverLocalDraft();

                switch (value.type) {
                    case 'full_document': //falling-through intencionat
                        return {content: draft.full.content, date: draft.full.date};
                    case 'partial_document':
                        // TODO[Xavi] S'ha d canviar la estructura si volem poder recuperar la data de cada fragment individualment
                        return {
                            content: draft.structured[value.selected].content,
                            date: draft.structured[value.selected].date
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
                var query = '';
                // console.log("DraftProcessor#_buildQuery", value);

                switch (value.params.type) {
                    case 'full_document':
                        query += 'id=' + value.ns + (value.rev ? '&rev=' + value.rev : '');
                        break;

                    case 'partial_document':
                        query += 'id=' + value.ns
                            + (value.rev ? '&rev=' + value.rev : '')
                            + '&section_id=' + value.params.selected
                            + '&editing_chunks=' + value.params.editing_chunks
                }

                // console.log("QUERY BUILT", query);
                return query;
            },

            _getDraftQuery: function () {
                // console.log("DraftProcessor#_getDraftQuery", this.query);
                var query = this.query;

                if (this.isLocalDraft) {
                    query += '&recover_local=true';
                }

                return query + '&recover_draft=true';
            },

            _getDocumentQuery: function () {
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
                }
            },

            _getActionType: function () {
                return this.documentType;
            }

        });
});

