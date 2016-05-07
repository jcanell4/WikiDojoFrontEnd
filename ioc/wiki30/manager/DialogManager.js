define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver',
    'ioc/gui/DialogBuilder',
], function (declare, EventObserver, DialogBuilder) {

    var DialogManagerException = function (message) {
        this.message = message;
        this.name = "DialogManagerException";
        console.error(this.name, this.message);
    };

    return declare([EventObserver],
        {

            type: {
                REQUEST_CONTROL: 'request_control',
                LOCKED_REQUEST_CONTROL: 'locked_request_control',
                EVENT: 'event',
                DIFF: 'diff',
                LOCKED_DIFF: 'locked_diff',
                INFO: 'info',
                LOCK_WARNING: 'lock_warning'
            },

            constructor: function (args) {

                this.dispatcher = args.dispatcher;
                this.dialogs = {};
            },

            // refId: el refId ens permetrà agrupar tots els dialogs d'un mateix document o concepte
            // type: el tipus de dialog pot ser Custom o Diff en aquests moments, si no es passen els argumetns necessaris es llença excepció


            getDialog: function (type, refId, params) {
                //console.log("DialogManager#getDialog", type, refId);

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

                    case this.type.LOCKED_REQUEST_CONTROL:
                        dialogBuilder = this._getLockedRequestControlDialog(refId, params);
                        break;

                    case this.type.INFO:
                        dialogBuilder = this._getInfoDialog(refId, params);
                        break;

                    case this.type.LOCK_WARNING:
                        dialogBuilder = this._getLockWarningDialog(refId, params);
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
                        id: 'dialog_' + refId + '_' + params.id,
                        title: params.title + ": " + refId,
                        message: params.message, // Pot contenir HTML: <br>, <b>, <i>, etc.
                        closable: params.closable || true,// opcional amb default
                        dispatcher: this.dispatcher
                    },
                    dialogBuilder = new DialogBuilder(dialogParams);

                dialogBuilder.addButtons(params.buttons);

                return dialogBuilder;
            },

            _getInfoDialog: function (refId, params) {
                var dialogParams = {
                        id: 'dialog_' + refId + '_' + params.id,
                        title: params.title + ": " + refId,
                        message: params.message, // Pot contenir HTML: <br>, <b>, <i>, etc.
                        closable: true,
                        dispatcher: this.dispatcher
                    },
                    dialogBuilder = new DialogBuilder(dialogParams);

                dialogBuilder.addCancelDialogButton({text: 'Ok'});

                return dialogBuilder;
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
                this._checkLockedParams(params);

                var dialogBuilder = this._getDiffDialog(refId, params);

                dialogBuilder.addTimeout(params.timeout)
                    //.addNextCallback(this.eventName.TIMEOUT, function () {
                    //    console.log("Timeout!");
                    //    alert("Test: It Works!")
                    //});
                    .setParam('closable', false)
                    .addNextRequestControl(this.eventName.TIMEOUT, this.eventName.UNLOCK_DOCUMENT, 'do=unlock&id=' + params.ns)
                    .addNextRequestControl(this.eventName.CANCEL, this.eventName.UNLOCK_DOCUMENT, 'do=unlock&id=' + params.ns); // Com no es closable, no cal controlar el cancel
                //.addCancelDialogButton({text: 'Cancel'});

                return dialogBuilder;
            },

            _getLockedRequestControlDialog: function (refId, params) {
                this._checkLockedParams(params);

                var dialogBuilder = this._getRequestControlDialog(refId, params),
                    dataToSend = 'do=unlock&id=' + params.ns;

                dialogBuilder.addTimeout(params.timeout)
                    //.addNextCallback(this.eventName.TIMEOUT, function () {
                    //    console.log("Timeout!");
                    //    alert("Test: It Works!")
                    //});
                    .addNextRequestControl(this.eventName.TIMEOUT, this.eventName.UNLOCK_DOCUMENT, dataToSend)
                    .addNextRequestControl(this.eventName.CANCEL, this.eventName.UNLOCK_DOCUMENT, dataToSend);

                return dialogBuilder;
            },

            _getLockWarningDialog: function (refId, params) {

                this._checkLockedParams(params);

                var dialogBuilder = this._getRequestControlDialog(refId, params),
                    dataToSendUnlock = 'do=unlock&id=' + params.ns,
                    dataToSendCancelPreserveDraft = {
                        discardChanges: true,
                        keep_draft: true
                    };

                dialogBuilder.addTimeout(params.timeout)
                    .setParam('closable', false)
                    .addNextRequestControl(this.eventName.TIMEOUT, this.eventName.UNLOCK_DOCUMENT, dataToSendUnlock)
                    .addNextRequestControl(this.eventName.TIMEOUT, this.eventNameCompound.CANCEL + refId, dataToSendCancelPreserveDraft) // Això no es un rquest control, això ha de passar pel manager i redirigit al document
                    .addNextDialog(this.eventName.TIMEOUT, params.infoDialog); // TODO[Xavi] pendent d'implementar el següent dialog

                return dialogBuilder;
            },


            /**
             *
             * @param paramsNeeded array de cadenes amb els noms de les propietats a comprovar
             * @param params objecte amb els paràmetres
             * @private
             */
            _checkNeededParams: function (paramsNeeded, params) {
                var param;

                for (var i = 0; i < paramsNeeded.length; i++) {
                    param = paramsNeeded[i];

                    if (!params[param]) {
                        throw new DialogManagerException('No s\'ha passat el paràmetre [' + param + '] amb els paràmetres: ', params);
                    }
                }

            },

            _checkLockedParams: function (params) {
                this._checkNeededParams(['ns', 'timeout'], params);
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
                //console.log("DialogManager#_removeDialog", data);
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