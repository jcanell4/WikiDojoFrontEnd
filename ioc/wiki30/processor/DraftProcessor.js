define([
    'dojo/_base/declare',
    'ioc/wiki30/processor/AbstractResponseProcessor',
    'ioc/gui/DiffDialog',
    'ioc/wiki30/Timer'
], function (declare, AbstractResponseProcessor, DiffDialog, Timer) {
    return declare([AbstractResponseProcessor],
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
             * Configura el dialge amb el text passat com argument i el mostra.
             *
             * @private
             */
            _processDialog: function (value, dispatcher) {
                //console.log("DraftProcessor#_processDialog", value);


                //TODO[Xavi] s'ha de crear un nou objecte que s'encarregarà de gestionar això.
                // Aquest objecte hauria de ser diferent per edicions normal, parcial, etc. segons el tipus. Fer servir factoria de moment fem servir el _getActionType i _setActionType
                this._setActionType(value);

                this.dialogs = {};

                //Si que cal el Lock, perquè s'ha de poder fer unlock si es prem la creu de tancar!
                this.docId = value.id;
                this.query = this._buildQuery(value);

                this.eventManager = dispatcher.getEventManager();
                this.lockManager = dispatcher.getLockManager();
                this.lockManager.lock(value.id, value.ns, false);
                this.draftManager = dispatcher.getDraftManager();

                this.isLocalDraft = value.params.local;


                this._showDiffDialog(value);
                this._initTimers(value.timeout * 1000);
            },

            _showDiffDialog: function (value) {

                var data = this._extractData(value);

                this.dialogs.diff = new DiffDialog({
                    // Canvis
                    id: 'diff_dialog_' + this.id,
                    content: "S'ha trobat un esborrany per aquest document. Vols obrir la versió actual del document o el esborrany trobat?",// TODO[Xavi] Localitzar, enviar des del servidor
                    closable: true, // TODO[Xavi] Controlar el tancament per poder cancelar el timer del timeout

                    // Antic
                    title: "S'ha trobat un esborrany",
                    style: "width: 700px",
                    document: data.document,
                    draft: data.draft,
                    docId: value.id, // TODO[Xavi] això es necessari?
                    ns: value.ns, // TODO[Xavi] això es necessari?
                    rev: value.rev, // TODO[Xavi] això es necessari?
                    onHide: this.destroy.bind(this),

                    buttons: [
                        {
                            id: 'open_document',
                            description: 'Obrir el document',
                            callback: function () {
                                this._openDocument();
                            }.bind(this)
                        },
                        {
                            id: 'open_draft',
                            description: "Obrir l'esborrany",
                            callback: function () {
                                this._openDraft();
                            }.bind(this)
                        }
                    ]
                });

                this.dialogs.diff.show();
            },

            destroy: function () {
                this._cancelTimers();
                this._cancelDialogs();
                this.lockManager.unlock(this.docId);
            },

            _openDraft: function () {

                this._cancelTimers();
                this.lockManager.cancel(this.docId);

                if (this.isLocalDraft) {
                    this.query+='&recover_local=true';
                }

                this.eventManager.dispatchEvent(this._getActionType(), {
                    id: this.id, // TODO: determinar si aquesta id es correcta o s'ha d'afegir algun prefix, per exemple lock_
                    dataToSend: this.query + '&recover_draft=true'
                });
            },

            _openDocument: function () {
                this._cancelTimers();
                this.lockManager.cancel(this.docId);

                this.eventManager.dispatchEvent(this._getActionType(), {
                    id: this.id, // TODO: determinar si aquesta id es correcta o s'ha d'afegir algun prefix, per exemple lock_
                    dataToSend: this.query + '&recover_draft=false'
                });

            },

            _cancelTimers: function () {
                console.log('¿?¿?¿#_cancelTimers', this.timers);
                for (var timer in this.timers) {
                    this.timers[timer].cancel();
                }
            },

            _showTimeoutDialog: function () {
                // TODO[Xavi] No es mostra res, es mostrarà el del lock.
                this._cancelDialogs(); // Afegit, no es troba al Lock (però es cridat des de el _doUnlockAndCancelDocument()
            },

            _cancelDialogs: function () {
                for (var dialog in this.dialogs) {
                    //console.log("Cancelant ", dialog, this.dialogs[dialog]);
                    this.dialogs[dialog].remove();
                }
                this.dialogs = {};
            },

            _initTimers: function (timeout) {
                this.timers = {
                    timeout: new Timer({onExpire: this._showTimeoutDialog.bind(this)})
                };

                this.timers.timeout.start(timeout);
            },


            _extractData: function (value) {

                return {
                    document: this._getDocument(value.params),
                    draft: this._getDraft(value.params),
                    query: this._buildQuery(value)
                };
            },

            // TODO[Xavi] En lloc de fer-ho així cercar una manera de passar directament el valor des de la wiki
            _getDocument: function (value) {

                switch (value.type) {
                    case 'full_document':
                        var currentContent = jQuery(value.content).find('textarea').val();
                        return {content: currentContent, date: value.lastmod};

                    case 'partial_document':
                        return {content: value.content.editing, date: value.lastmod};

                }

            },

            // TODO[Xavi] En lloc de fer-ho així cercar una manera de passar directament el valor des de la wiki
            _getDraft: function (value) {
                if (value.local) {
                    return this._getDraftLocal(value);
                } else {
                    return this._getDraftRemote(value);
                }

            },

            _getDraftLocal: function(value) {
                var draft = this.draftManager.getDraft(this.docId).recoverLocalDraft();

                //console.log("value: ", value);
                //console.log("draft: ", value);
                switch (value.type) {
                    case 'full_document': //falling-through intencionat
                        return {content: draft.full.content, date: draft.full.date};
                    case 'partial_document':
                        // TODO[Xavi] S'ha d canviar la estructura si volem poder recuperar la data de cada fragment individualment
                        return {content: draft.structured.content[value.selected], date: draft.structured.date}
                }

                return this.DEFAULT_DRAFT;
            },

            _getDraftRemote: function(value) {
                if (value.draft) {
                    return {content: value.draft.content, date: value.draft.date};
                } else {
                    return this.DEFAULT_DRAFT;
                }

            },


            _buildQuery: function (value) {
                var query = '';

                switch (value.params.type) {
                    case 'full_document':
                        query += 'id=' + value.ns + (value.rev ? '&rev=' + value.rev : '');
                        break;

                    case 'partial_document':
                        query += 'id=' + value.params.original_call.ns
                            + (value.params.original_call.rev ? '&rev=' + value.params.original_call.rev : '')
                            + '&section_id=' + value.params.original_call.section_id
                            + '&editing_chunks=' + value.params.original_call.editing_chunks
                            + '&range=' + value.params.original_call.range //TODO[Xavi] això sembla que no es necessari
                            + '&summary=' + value.params.original_call.summary
                            + '&target=' + value.params.original_call.target;
                }

                return query;
            },

            _setActionType: function (value) {


                switch (value.params.type) {
                    case 'full_document':
                        this.documentType = 'edit';
                        break;
                    case 'partial_document':
                        this.documentType = 'edit_partial';
                        break;
                }
            },

            _getActionType: function () {
                return this.documentType;
            }

        });
});

