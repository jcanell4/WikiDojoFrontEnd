define([
    'ioc/wiki30/dispatcherSingleton',
], function (getDispatcher) {

    var dispatcher = getDispatcher(),

        dialogController = {

            _processDialog: function (value, timeout) {
//                console.log("DialogController#_processDialog", value);

                this.dialogs = {};
                this.dispatcher = dispatcher;
                this.docId = value.id;

                this.eventManager = dispatcher.getEventManager();
                this.draftManager = dispatcher.getDraftManager();

                this._showDialog(value, timeout * 1000);
                //this._initTimers(timeout * 1000); // ALERTA[Xavi] Els timers depenen del dialog, no cal controlar-los aqui
            },

            // TODO[Xavi] Molt semblant al que hi ha al DraftProcessor, cerca la manera de generalitzar
            _buildQuery: function (type, value) {
                // console.log('processDraftSelectionDialog#_buildQuery',type, value);
                var query = '';

                switch (type) {
                    case 'full_document':
                        query += 'id=' + value.ns + (value.rev ? '&rev=' + value.rev : '');
                        break;

                    case 'partial_document':
                        query += 'id=' + value.ns
                            + (value.rev ? '&rev=' + value.rev : '')
                            + '&section_id=' + value.section_id
                            + '&editing_chunks=' + value.editing_chunks;
                }

                query += this.draftManager.generateLastLocalDraftTimesParam(this.docId, value.ns);

                return query;
            },

            _showDialog: function (value, timeout) {
//                console.log("processDraftSelectionDialog#_showDialog", timeout);
                //timeout = 5000; // ALERTA[Xavi] modificat per les proves

                var params = {
                    id: 'draft_conflict',
                    ns: value.ns,
                    title: 'S\'ha trobat un esborrany complet',
                    message: 'S\'ha trobat un esborrany complet del document. Si continuas amb la edició parcial ' +
                    '<b>aquest esborrany serà eliminat</b>. Pots obrir el document en edició completa per recuperar-lo.',
                    //onHide: this.destroy.bind(this), ALERTA[Xavi] el unlock ja no s'ha de gestionar des del dialog, tant els timers com el sistema de lock aniran per una altra banda
                    timeout: timeout,

                    buttons: [
                        {
                            id: 'edit_document',
                            description: 'Editar document complet',
                            buttonType: 'request_control',
                            extra: {
                                eventType: this.eventManager.eventName.EDIT,
                                dataToSend: this._buildQuery('full_document', value)  + '&discard_draft=true',
                            }

                        },
                        {
                            id: 'edit_draft',
                            description: 'Editar fragment (s\'esborrarà l\'esborrany)',
                            buttonType: 'request_control',
                            extra: {
                                eventType: this.eventManager.eventName.EDIT_PARTIAL,
                                dataToSend: this._buildQuery('partial_document', value) + '&discard_draft=true',
                        }

                        }
                    ]

                };

                var dialogManager = dispatcher.getDialogManager();

                this.dialogs.selectEditType = dialogManager.getDialog(dialogManager.type.LOCKED_DEFAULT, value.id, params); // TODO[Xavi] canviar per un tipus ajax

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