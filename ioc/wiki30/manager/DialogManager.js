define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver',
    'ioc/gui/DialogBuilder'
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
                LOCK_EXPIRING: 'lock_expiring',
                DIFF: 'diff',
                PROJECT_DIFF: 'project_diff',
                PROJECT_NEW_ELEMENT: 'project_new_element',
                REQUIRE: 'require',
                LOCKED_DIFF: 'locked_diff',
                INFO: 'info',
                LOCK_WARNING: 'lock_warning',
                FORM: 'form',
                DROPDOWN: 'dropdown',
                COMBOBOX: 'combobox'
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
                // console.log("DialogManager#getDialog", type, refId, params);

                var dialogBuilder = null,
                    dialog;

                switch (type) {
                    case this.type.DEFAULT:
                        dialogBuilder = this._getDefaultDialog(refId, params);
                        break;

                    case this.type.DIFF:
                        dialogBuilder = this._getDiffDialog(refId, params);
                        break;

                    case this.type.PROJECT_DIFF:
                        dialogBuilder = this._getProjectDiffDialog(refId, params);
                        break;

                    case this.type.PROJECT_NEW_ELEMENT:
                        dialogBuilder = this._getProjectNewElementDialog(refId, params);
                        break;

                    case this.type.REQUIRE:
                        dialogBuilder = this._getRequireDialog(refId, params);
                        break;

                    case this.type.LOCK_EXPIRING:
                        dialogBuilder = this._getLockExpiringDialog(refId, params);
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

                    case this.type.FORM:
                        dialogBuilder = this._getFormDialog(refId, params);
                        break;

                    case this.type.DROPDOWN:
                        dialogBuilder = this._getDropdownDialog(refId, params);
                        break;

                    case this.type.COMBOBOX:
                        dialogBuilder = this._getComboBoxDialog(refId, params);
                        break;

                    default:
                        throw new DialogManagerException("El tipus de dialeg no existeix: ", type);
                }


                if (this._existsDialog(refId, dialogBuilder.getId())) {
                    // console.error("Ja existeix el dialog, el retornem");
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
                // console.log("_getDefaultDialog", refId, params);
                var title = params.title;
                //if (params.id) title += ": " + params.id;

                var dialogParams = {
                        id: 'dialog_' + refId + '_' + params.id,
                        ns: params.ns,
                        title: title,  //refId,
                        message: params.message, // Pot contenir HTML: <br>, <b>, <i>, etc.
                        closable: params.closable && true,
                        sections: params.sections,
                        dispatcher: this.dispatcher,
                        height: params.height,
                        width: params.width,
                        single: params.single,
                        minimal: params.minimal
                    }, dialogBuilder = new DialogBuilder(dialogParams);

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

            _generateRequestControlCallback: function (eventType, dataToSend, observable) {
                return function () {
                    this.eventManager.fireEvent(eventType, {
                        id: this.id,
                        dataToSend: dataToSend
                    }, observable);
                };
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
            
            _getProjectDiffDialog: function (refId, params) {
                var dialogBuilder = this._getDefaultDialog(refId, params);
                dialogBuilder.addProjectDiff(params.diff.formDocum, params.diff.formDraft, params.diff.labelDocum, params.diff.labelDraft);
                return dialogBuilder;
            },
            
            _getProjectNewElementDialog: function (refId, params) {
                var dialogBuilder = this._getDefaultDialog(refId, params);
                return dialogBuilder;
            },
            
            /**
             * Mostra un diàleg de requeriment
             * @param {type} refId
             * @param {obj} params {dialogParams:{id, ns, title, message, timeout}, buttons:[{}]}
             * @returns {DialogManager.DialogBuilder}
             */
            _getRequireDialog: function (refId, params) {
                this._checkLockedParams(params.dialogParams);
                var dialogBuilder = new DialogBuilder(params.dialogParams);
                dialogBuilder.addButtons(params.buttons);
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

            _getLockExpiringDialog: function (refId, params) {
                params.buttons =[
                    {
                        id: refId +'_ok',
                        buttonType: this.type.DEFAULT,
                        description: params.ok.text, 
                        callback: function(){
                            params.contentTool.fireEvent(params.okContentEvent, params.okEventParams);
                        }
                    },
                    {                        
                        id: refId +'_cancel',
                        buttonType: this.type.DEFAULT,
                        description: params.cancel.text,
                        callback: function(){
                            params.contentTool.fireEvent(params.cancelContentEvent, params.cancelEventParams);
                        }
                    }
                ];                
                var dialogBuilder = this._getDefaultDialog(refId, params);

                dialogBuilder.addTimeout(params.timeout)
                    .addNextRequestControlCallback(this.eventName.TIMEOUT, params.timeoutContentEvent, params.timeoutParams, params.contentTool);
//                    .addNextRequestControlCallback(this.eventName.CANCEL, params.cancelContentEvent, params.cancelEventParams, params.contentTool);

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

            _getFormDialog: function (refId, params) {
                // console.error("_getFormDialog", params);

                params.single = true;

                params.buttons =[
                    {
                        id: refId +'_ok',
                        buttonType: this.type.DEFAULT,
                        description: params.ok.text,
                        callback: function(){

                            var $form = jQuery(this.domNode).find('form');

                            var inputs= $form.serializeArray();
                            var data = {};
                            for (var i in inputs) {
                                data[inputs[i].name] = inputs[i].value;
                            }

                            var $inputs = $form.find('input');
                            data.json = [];

                            for (var i=0;i<$inputs.length; i++) {
                                var $input = jQuery($inputs[i]);

                                if ($input.attr('type') === 'button' || $input.attr('type') === 'submit') {
                                    continue;
                                }

                                data.json.push({
                                    'name':$input.attr('name'),
                                    'placeholder':$input.attr('placeholder'),
                                    // 'value':$input.val(),
                                    'value':$input.val().split('"').join('&inner-quot'),
                                    'label':$form.find('label[for="'+$input.attr('name')+'"]').text().slice(0, -1),
                                    'type': $input.val().indexOf('<img')>=0 ? 'image' : null
                                })
                            }

                            var $selects = $form.find('select');
                            for (var i=0;i<$selects.length; i++) {
                                var $select = jQuery($selects[i]);
                                data.json.push({
                                    'name':$select.attr('name'),
                                    'placeholder':jQuery($select.find('option').get(0)).text(),
                                    'value':$select.val(),
                                    'label':$form.find('label[for="'+$select.attr('name')+'"]').text().slice(0, -1),
                                    'type':'select'
                                })
                            }



                            data.json = JSON.stringify(data.json);
                            data.json = data.json.split('"').join('&quot');

                            params.callback(data);
                        }
                    },
                    {
                        id: refId +'_cancel',
                        buttonType: this.type.DEFAULT,
                        description: params.cancel.text,
                        callback: function(){
                            // no cal fer res, cal declarar-la?
                            //console.log("Cridat el close del dialog")
                        }
                    }
                ];

                var dialogBuilder = this._getDefaultDialog(refId, params);

                // TODO: afegir la secció del formulari construida a partir de params.data
                dialogBuilder.addForm(params.data);

                return dialogBuilder;
            },

            _getDropdownDialog: function (refId, params) {
                // console.error("_getDroopdownDialog", params);

                //params.single = true;

                params.minimal = true;
                params.buttons =[
                    {
                        id: refId +'_ok',
                        buttonType: this.type.DEFAULT,
                        description: params.ok.text,
                        callback: function(aux){
                            let value = jQuery(this.domNode).find('select').val();
                            params.callback(value);
                        }
                    },
                    {
                        id: refId +'_cancel',
                        buttonType: this.type.DEFAULT,
                        description: params.cancel.text,
                        callback: function(){
                            // no cal fer res, cal declarar-la?
                            //console.log("Cridat el close del dialog")
                        }
                    },

                ];

                var dialogBuilder = this._getDefaultDialog(refId, params);

                // TODO: afegir la secció del formulari construida a partir de params.data
                dialogBuilder.addSelect(params.data);

                return dialogBuilder;
            },

            _getComboBoxDialog: function (refId, params) {
                // console.error("_getDroopdownDialog", params);

                //params.single = true;

                params.minimal = true;
                params.buttons =[
                    {
                        id: refId +'_ok',
                        buttonType: this.type.DEFAULT,
                        description: params.ok.text,
                        callback: function(aux){
                            let value = jQuery(this.domNode).find('input.dijitInputInner').val();
                            params.callback(value);
                        }
                    },
                    {
                        id: refId +'_cancel',
                        buttonType: this.type.DEFAULT,
                        description: params.cancel.text,
                        callback: function(){
                            // no cal fer res, cal declarar-la?
                            //console.log("Cridat el close del dialog")
                        }
                    }
                ];

                var dialogBuilder = this._getDefaultDialog(refId, params);

                // TODO: afegir la secció del formulari construida a partir de params.data
                dialogBuilder.addComboBox(params.data);

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
                this.registerMeToEventFromObservable(dialog, this.eventName.DESTROY, this._removeDialog.bind(this));

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