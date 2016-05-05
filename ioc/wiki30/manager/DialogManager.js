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
                CUSTOM: 'custom'
            },

            dialogs: null,

            constructor: function (args) {

                this.dispatcher = args.dispatcher;
                this.dialogs = {};
            },

            // refId: el refId ens permetrà agrupar tots els dialogs d'un mateix document o concepte
            // type: el tipus de dialog pot ser Custom o Diff en aquests moments, si no es passen els argumetns necessaris es llença excepció


            getDialog: function (type, refId, params) {

                switch (type) {
                    case this.type.REQUEST_CONTROL:
                        return this._getRequestControlDialog(refId, params);

                    case this.type.EVENT:
                        return this._getEventDialog(refId, params);

                    case this.type.DIFF:
                        return this._getDiffDialog(refId, params);

                    case this.type.CUSTOM:
                        return this._getCustomDialog(refId, params);

                    default:
                        throw new DialogManagerException("El tipus de dialeg no existeix: ", type);
                }
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
                //
                //    dialogParams = {
                //        title: params.title,
                //        content: params.message, // Pot contenir HTML: <br>, <b>, <i>, etc.
                //        closable: params.closable || true,// opcional amb default
                //        buttons: [],
                //        initFunctions: [],
                //        eventManager: this.dispatcher.getEventManager()
                //    }, newButton;
                //
                //console.log(params);
                //
                //for (var i = 0; i < params.buttons.length; i++) {
                //    console.log(i);
                //    newButton = params.buttons[i];
                //    newButton.id = refId + now + i;
                //
                //    newButton.callback = this._generateRequestControlCallback(params.buttons[i].extra.eventType, params.buttons[i].extra.dataToSend);
                //
                //    dialogParams.buttons.push(newButton);
                //    console.log("Afegit boto", newButton);
                //}
                //
                //var dialog = new CustomDialog(dialogParams);
                //this._addDialog(refId, dialog);
                //return dialog;
                //
                //
                //
                    var dialogParams = {
                        title: params.title,
                        message: params.message, // Pot contenir HTML: <br>, <b>, <i>, etc.
                        closable: params.closable || true,// opcional amb default
                        dispatcher: this.dispatcher
                    },
                    dialogBuilder = new DialogBuilder(dialogParams);


                this._addRequestButtonsToBuilder(params.buttons, dialogBuilder);


                return dialogBuilder.build();


                //throw new DialogManagerException("_getAjaxDialog no implementat");
            },

            // TODO[Xavi] en el moment que tinguen més tipus de butons hem de refactoritzar per afegir el tipus concret de botó
            _addRequestButtonsToBuilder: function(buttons, dialogBuilder, refId) {

                for (var i = 0; i < buttons.length; i++) {
                    console.log(i);
                    newButton = buttons[i];
                    dialogBuilder.addButton(dialogBuilder.type.REQUEST_CONTROL, newButton);
                }
            },

            _generateRequestControlCallback: function (eventType, dataToSend) {

                return function () {
                    console.log("que es això:", this);
                    //var id = this.getAttribute('id'),
                    //    eventType= this.getAttribute('eventtype'),
                    //    dataToSend = this.getAttribute('datatosend');

                    console.log("Callback de dialog:", eventType, dataToSend);

                    this.eventManager.dispatchEvent(eventType, {
                        id: this.id,
                        dataToSend: dataToSend
                    });
                }
            },

            /**
             * Aquest dialog mostra un diff entre dos textos, les crides dels botons son Ajax
             * @param params
             */
            _getDiffDialog: function (refId, params) {
                var dialogParams = {
                        title: params.title,
                        message: params.message, // Pot contenir HTML: <br>, <b>, <i>, etc.
                        closable: true,
                        dispatcher: this.dispatcher,
                        style: "width: 700px"
                    },
                    dialogBuilder = new DialogBuilder(dialogParams);


                dialogBuilder.addDiff(params.diff.text1, params.diff.text2, params.diff.text1Label, params.diff.text2Label);

                this._addRequestButtonsToBuilder(params.buttons, dialogBuilder);

                return dialogBuilder.build();
            },

            /**
             * Els botons d'aquest dialeg son funcions
             * @param params
             */
            _getCustomDialog: function (docId, params) {
                var dialog = new CustomDialog(params);
                this._addDialog(docId, dialog);
                return dialog;
            },

            _addDialog: function (docId, dialog) {
                if (!this.dialogs[docId]) {
                    this.dialogs[docId] = [];
                }

                //TODO[Xavi] Afegir listeners per detectar quan es destrueix el dialog per eliminar-lo automàticament

                this.dialogs[docId].push(dialog);
            },

            _removeDialog: function (dialog) {

            },

            /**
             * Cancela tots els dialogs corresponents al document passat com argument
             * @param docId
             */
            cancelDialogs: function (docId) {

            }


        });
});