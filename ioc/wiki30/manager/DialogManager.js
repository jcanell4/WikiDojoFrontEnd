define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver',
    'ioc/gui/CustomDialog',
    //'ioc/gui/DiffDialog',
    'ioc/gui/DialogBuilder',
], function (declare, EventObserver, CustomDialog, DialogBuilder) {

    var DialogManagerException = function (message) {
        this.message = message;
        this.name = "DialogManagerException";
    };

    return declare([EventObserver],
        {

            // TODO[Xavi] Refactoritzar com a Builder: createDialog(params).addDiff(text1, text2).addButton(params).addButton(params).addAutoClose(3000)...build()
            /* El procés del builder comença amb el createDialog que retornarà un objecte amb els mètodes disponibles al builder:
             - addDiff(text1, text2) per afegir una secció de diff
             - addButton(type, params) // El type determina quina implementació fa servir el boto, per ara només Event (requestControl) i Custom (callback)
             - addTimeout(temps, callback) // El dialog es tanca automàticament en acabar i crida al callback (això posibilita implementar el comportament: cancel document + mostrar alert) ALERTA[Xavi] disparar un event quan es fa un autoclose, de manera que es pugui llençar el dialeg d'alerta al tancar-se
             - addTimeoutNextDialog(dialog) // Dialog que es llença quan es produeix un timeout del dialog
             - addCloseCallback(callback) // Comprovar si es necessari, o ho afegim com un botó normal. Callbacks o events?
             - build: genera el dialog i el retorna

             Tots els mètodes excepte build retornen 'this'
             */

            type: {
                REQUEST_CONTROL: 'request_control',
                EVENT: 'event',
                DIFF: 'diff',
                LOCKED_DIFF: 'locked_diff',
                ALERT: 'alerta'
            },

            constructor: function (args) {

                this.dispatcher = args.dispatcher;
                this.dialogs = {};
            },

            // refId: el refId ens permetrà agrupar tots els dialogs d'un mateix document o concepte
            // type: el tipus de dialog pot ser Custom o Diff en aquests moments, si no es passen els argumetns necessaris es llença excepció


            getDialog: function (type, refId, params) {
                console.log("DialogManager#getDialog", type, refId);

                var dialogBuilder = null,
                    dialog;

                switch (type) {
                    case this.type.REQUEST_CONTROL:
                        dialogBuilder = this._getRequestControlDialog(refId, params);
                        break;

                    case this.type.EVENT:
                        dialogBuilder = this._getEventDialog(refId, params);
                        break;

                    case this.type.DIFF:
                        dialogBuilder = this._getDiffDialog(refId, params);
                        break;

                    case this.type.LOCKED_DIFF:
                        dialogBuilder = this._getLockedDiffDialog(refId, params);
                        break;

                    case this.type.ALERT:
                        dialogBuilder = this._getAlertDialog(refId, params);
                        break;

                    default:
                        throw new DialogManagerException("El tipus de dialeg no existeix: ", type);
                }

                if (this._existsDialog(refId, dialogBuilder.getId())) {
                    console.log("Ja existeix el dialog, el retornem");
                    return this._getExistingDialog(refId, dialogBuilder.getId());
                } else {
                    dialog = dialogBuilder.build();
                    this._addDialog(refId, dialog);
                    return dialog;
                }

            },

            _existsDialog: function (refId, dialogId) {
                if (!this.dialogs[refId]) {
                    return false;
                } else if (this.dialogs[refId][dialogId]) {
                    return true;
                }
                return false;
            },

            _getExistingDialog: function (refId, dialogId) {
                if (!this._existsDialog(refId, dialogId)) {
                    throw new DialogManagerException('No existeix cap dialog amb referencia ' + refId + 'amb id ' + dialogId);
                }

                return this.dialogs[refId][dialogId];
            },

            /**
             * Els botons d'aquests dialogs disparen un event
             * @param params
             */
            _getEventDialog: function (refId, params) {
                throw new DialogManagerException("_getEventDialog no implementat");
            },

            /**
             * Els botons d'aquests dialogs llencen una crida Ajax
             * @param params
             */
            _getRequestControlDialog: function (refId, params) {
                var dialogParams = {
                        id: 'dialog_' + refId + params.id,
                        title: params.title,
                        message: params.message, // Pot contenir HTML: <br>, <b>, <i>, etc.
                        closable: params.closable || true,// opcional amb default
                        dispatcher: this.dispatcher
                    },
                    dialogBuilder = new DialogBuilder(dialogParams);

                dialogBuilder.addButtons(params.buttons);

                //this._addRequestButtonsToBuilder(params.buttons, dialogBuilder);

                return dialogBuilder;


                //throw new DialogManagerException("_getAjaxDialog no implementat");
            },


            _generateRequestControlCallback: function (eventType, dataToSend) {
                return function () {
                    this.eventManager.dispatchEvent(eventType, {
                        id: this.id,
                        dataToSend: dataToSend
                    });
                }
            },

            /**
             * Aquest dialog mostra un diff entre dos textos, les crides dels botons son Ajax
             * @param refId
             * @param params
             */
            _getDiffDialog: function (refId, params) {
                var dialogBuilder = this._getRequestControlDialog(refId, params);

                dialogBuilder.addDiff(params.diff.text1, params.diff.text2, params.diff.text1Label, params.diff.text2Label);


                return dialogBuilder;
            },

            _getLockedDiffDialog: function (refId, params) {
                if (!params.ns) {
                    throw new DialogManagerException("No s'ha passat el NS amb els paràmetres: ", params);
                }

                var dialogBuilder = this._getDiffDialog(refId, params);

                dialogBuilder.addTimeout(params.timeout)
                    //.addNextCallback(this.eventName.TIMEOUT, function () {
                    //    console.log("Timeout!");
                    //    alert("Test: It Works!")
                    //});
                    .addNextRequestControl(this.eventName.TIMEOUT, this.eventName.UNLOCK_DOCUMENT, 'do=unlock&id=' + params.ns)
                    .addNextRequestControl(this.eventName.CANCEL, this.eventName.UNLOCK_DOCUMENT, 'do=unlock&id=' + params.ns);

                return dialogBuilder;
            },

            /**
             *
             * @param refId
             * @param dialog
             * @private
             */
            _addDialog: function (refId, dialog) {
                if (!this.dialogs[refId]) {
                    this.dialogs[refId] = {};
                }

                dialog.setRefId(refId);
                this.registerToEvent(dialog, this.eventName.DESTROY, this._removeDialog.bind(this));

                this.dialogs[refId][dialog.id] = dialog;
            },

            _removeDialog: function (data) {
                console.log("DialogManager#_removeDialog", data);
                delete(this.dialogs[data.refId][data.id]);
            },

            /**
             * Cancela tots els dialogs corresponents a la raferencia passat com argument
             * @param refId
             */
            cancelDialogs: function (refId) {

            }


        });
});