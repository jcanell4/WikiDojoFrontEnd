define([
    'ioc/wiki30/Timer',
    'ioc/gui/CustomDialog',
    'ioc/wiki30/dispatcherSingleton',
], function (Timer, CustomDialog, getDispatcher) {

    var dispatcher = getDispatcher(),

        dialogController = {

            _processDialog: function (value, timeout) {
                //console.log("DialogController#_processDialog", value);

                this.dialogs = {};
                this.dispatcher = dispatcher;
                this.docId = value.id;


                this.eventManager = dispatcher.getEventManager();

                // Cal el Lock, perquè s'ha de poder fer unlock si es prem la creu de tancar!
                this.lockManager = dispatcher.getLockManager();
                this.lockManager.lock(value.id, value.ns, false);

                this.draftManager = dispatcher.getDraftManager();



                this._showDialog(value);
                this._initTimers(timeout * 1000);
            },

            // Molt semblant al que hi ha al DraftProcessor, cerca la manera de generalitzar
            _buildQuery: function (type, value) {
                //console.log('processDraftSelectionDialog#_buildQuery',type, value);
                var query = '';

                switch (type) {
                    case 'full_document':
                        query += 'id=' + value.ns + (value.rev ? '&rev=' + value.rev : '');
                        break;

                    case 'partial_document':
                        query += 'id=' + value.ns
                            + (value.rev ? '&rev=' + value.rev : '')
                            + '&section_id=' + value.section_id
                            + '&editing_chunks=' + value.editing_chunks
                            + '&range=' + value.range //TODO[Xavi] això sembla que no es necessari
                            + '&summary=' + value.summary
                            + '&target=' + value.target;
                }

                query += this.draftManager.generateLastLocalDraftTimesParam(this.docId);



                return query;
            },

            destroy: function () {
                this._cancelTimers();
                this._cancelDialogs();
                this.lockManager.unlock(this.docId);
            },

            _openFullDocument: function (value) {

                this._cancelTimers();
                this.lockManager.cancel(this.docId);

                this.eventManager.dispatchEvent("edit", {
                    id: this.id,
                    dataToSend: this._buildQuery('full_document',value) + '&discard_draft=true'
                });
            },

            _openPartialDocument: function (value) {
                this._cancelTimers();
                this.lockManager.cancel(this.docId);

                this.eventManager.dispatchEvent("edit_partial", {
                    id: this.id,
                    dataToSend: this._buildQuery('partial_document', value) + '&discard_draft=true'
                });

            },

            _cancelTimers: function () {
                //console.log('¿?¿?¿ #_cancelTimers', this.timers);
                for (var timer in this.timers) {
                    this.timers[timer].cancel();
                }
            },

            _initTimers: function (timeout) {
                this.timers = {
                    timeout: new Timer({onExpire: this._showTimeoutDialog.bind(this)})
                };

                this.timers.timeout.start(timeout);
            },

            _showTimeoutDialog: function () {
                // TODO[Xavi] No es mostra res, es mostrarà el del lock.
                this._cancelDialogs();
            },

            _showDialog: function (value) {
                //console.log('DialogController#_showDialog');
                // TODO[Xavi] Localitzar els missatges, es pot enviar des del servidor en lloc del valor cert
                this.dialogs.selectEditType = new CustomDialog({
                    title: 'S\'ha trobat un esborrany complet',
                    content: 'S\'ha trobat un esborrany complet del document. Si continuas amb la edició parcial ' +
                    '<b>aquest esborrany serà eliminat</b>. Pots obrir el document en edicio completa per recuperar-lo.',
                    style: 'width: 300px',
                    closable: true,
                    onHide: this.destroy.bind(this),

                    buttons: [
                        {
                            id: 'open_full_edition',
                            description: 'Editar document complet',
                            callback: function () {
                                this._openFullDocument(value);
                            }.bind(this)
                        },
                        {
                            id: 'open_partial_edition',
                            description: 'Editar fragment (s\'esborrarà l\'esborrany)',
                            callback: function () {
                                this._openPartialDocument(value);
                            }.bind(this)
                        }
                    ]

                });


                this.dialogs.selectEditType.show();
            },

            _cancelDialogs: function () {
                for (var dialog in this.dialogs) {
                    //console.log("Cancelant ", dialog, this.dialogs[dialog]);
                    this.dialogs[dialog].remove();
                }
                this.dialogs = {};
            }
        };

    return function (params) {
        dialogController._processDialog(params.original_call, params.timeout);
    };
});