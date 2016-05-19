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
                DEFAULT: 'default',
                LOCKED_DEFAULT: 'locked_default',
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
                var dlg=null;
                if(!params){
                    var id = refId;
                    refId = type;
                    if(this._existsDialog(refId, id)){
                        dlg = this._getExistingDialog(refId, id);
                    }
                }else{
                    dlg = this._getDialog(type, refId, params);
                }
                return dlg;
            },
            
            addDialog: function(refId, dialog){
                this._addDialog(refId, dialog);
            },

            _getDialog: function (type, refId, params) {
                //console.log("DialogManager#getDialog", type, refId);

                var dialogBuilder = null,
                    dialog;

                switch (type) {
                    case this.type.DEFAULT:
                        dialogBuilder = this._getDefaultDialog(refId, params);
                        break;

                    case this.type.DIFF:
                        dialogBuilder = this._getDiffDialog(refId, params);
                        break;

                    case this.type.LOCKED_DIFF:
                        dialogBuilder = this._getLockedDiffDialog(refId, params);
                        break;

                    case this.type.LOCKED_DEFAULT:
                        dialogBuilder = this._getLockedDefaultDialog(refId, params);
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
             * Els botons d'aquests dialogs llencen una crida Ajax
             * @param params
             */
            _getDefaultDialog: function (refId, params) {
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

                dialogBuilder.addCancelDialogButton({description: 'Ok'});

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
                var dialogBuilder = this._getDefaultDialog(refId, params);

                dialogBuilder.addDiff(params.diff.text1, params.diff.text2, params.diff.text1Label, params.diff.text2Label);


                return dialogBuilder;
            },

            _getLockedDiffDialog: function (refId, params) {
                this._checkLockedParams(params);

                var dialogBuilder = this._getDiffDialog(refId, params);

                dialogBuilder.addTimeout(params.timeout)
                    //.addNextCallback(this.eventName.TIMEOUT, function () { // Codi d'exemple
                    //    console.log("Timeout!");
                    //    alert("Test: It Works!")
                    //});
                    .setParam('closable', false)
                    .addNextRequestControlCallback(this.eventName.TIMEOUT, this.eventName.UNLOCK_DOCUMENT, 'do=unlock&id=' + params.ns)
                    .addNextRequestControlCallback(this.eventName.CANCEL, this.eventName.UNLOCK_DOCUMENT, 'do=unlock&id=' + params.ns); // Com no es closable, no cal controlar el cancel
                //.addCancelDialogButton({text: 'Cancel'});

                return dialogBuilder;
            },

            _getLockedDefaultDialog: function (refId, params) {
                this._checkLockedParams(params);

                var dialogBuilder = this._getDefaultDialog(refId, params),
                    dataToSend = 'do=unlock&id=' + params.ns;

                dialogBuilder.addTimeout(params.timeout)
                    .addNextRequestControlCallback(this.eventName.TIMEOUT, this.eventName.UNLOCK_DOCUMENT, dataToSend)
                    .addNextRequestControlCallback(this.eventName.CANCEL, this.eventName.UNLOCK_DOCUMENT, dataToSend);

                return dialogBuilder;
            },

            _getLockWarningDialog: function (refId, params) {

                this._checkLockedParams(params);

                var dialogBuilder = this._getDefaultDialog(refId, params),
                    dataToSendUnlock = 'do=unlock&id=' + params.ns,
                    dataToSendCancelPreserveDraft = {
                        discardChanges: true,
                        keep_draft: true
                    };

                dialogBuilder.addTimeout(params.timeout)
                    .setParam('closable', false)
                    .addNextRequestControlCallback(this.eventName.TIMEOUT, this.eventName.UNLOCK_DOCUMENT, dataToSendUnlock)
                    .addNextRequestControlCallback(this.eventName.TIMEOUT, this.eventNameCompound.CANCEL + refId, dataToSendCancelPreserveDraft) // Això no es un rquest control, això ha de passar pel manager i redirigit al document
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