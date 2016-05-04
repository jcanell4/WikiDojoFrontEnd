define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver',
    'ioc/gui/CustomDialog',
    'ioc/gui/DiffDialog',
], function (declare, EventObserver, CustomDialog, DiffDialog) {

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

            // docId: el docId ens permetrà agrupar tots els dialogs d'un mateix document, la id del dialog estarà composta pel docId i ¿?¿?
            // type: el tipus de dialog pot ser Custom o Diff en aquests moments, si no es passen els argumetns necessaris es llença excepció


            /**
             * Els botons d'aquests dialogs disparen un event
             * @param type
             * @param params
             */
            getDialog: function (type, docId, params) {

                switch (type) {
                    case this.type.REQUEST_CONTROL:
                        return this._getRequestControlDialog(docId, params);

                    case this.type.EVENT:
                        return this._getEventDialog(docId, params);

                    case this.type.DIFF:
                        return this._getDiffDialog(docId, params);

                    case this.type.CUSTOM:
                        return this._getCustomDialog(docId, params);

                    default:
                        throw new DialogManagerException("El tipus de dialeg no existeix: ", type);
                }
            },


            /**
             * Els botons d'aquests dialogs disparen un event
             * @param params
             */
            _getEventDialog: function (docId, params) {
                throw new DialogManagerException("_getEventDialog no implementat");
            },

            /**
             * Els botons d'aquests dialogs llencen una crida Ajax
             * @param params
             */
            _getRequestControlDialog: function (docId, params) {

                // Que necessitem?
                //    title: 'S\'ha trobat un esborrany complet',
                //        content: 'S\'ha trobat un esborrany complet del document. Si continuas amb la edició parcial ' +
                //    '<b>aquest esborrany serà eliminat</b>. Pots obrir el document en edicio completa per recuperar-lo.',
                //        style: 'width: 300px',
                //        closable: true,
                //        onHide: this.destroy.bind(this),
                //
                //        buttons: [
                //        {
                //            id: 'open_full_edition',
                //            description: 'Editar document complet',
                //            callback: function () {
                //                this._openFullDocument(value);
                //            }.bind(this)
                //        },
                //        {
                //            id: 'open_partial_edition',
                //            description: 'Editar fragment (s\'esborrarà l\'esborrany)',
                //            callback: function () {
                //                this._openPartialDocument(value);
                //            }.bind(this)
                //        }
                //    ]
                //
                //};
                //


                var now = Date.now(),


                    dialogParams = {
                        title: params.title,
                        content: params.message, // Pot contenir HTML: <br>, <b>, <i>, etc.
                        closable: params.closable || true,// opcional amb default
                        style: 'width: 400px', // fixe
                        buttons: [],
                        eventManager: this.dispatcher.getEventManager()
                    }, newButton;

                console.log(params);

                for (var i = 0; i < params.buttons.length; i++) {
                    console.log(i);
                    newButton = params.buttons[i];
                    newButton.id = docId + now + i;

                    newButton.callback = this._generateRequestControlCallback(params.buttons[i].extra.eventType, params.buttons[i].extra.dataToSend);
                    //newButton.callback = this._generateRequestControlCallback();

                    dialogParams.buttons.push(newButton);

                    //description = params.button[i].description,
                    //eventType = params.button[i].eventType,
                    //queryParams = params.button[i].dataToSend
                    console.log("Afegit boto", newButton);
                }

                var dialog = new CustomDialog(dialogParams);
                this._addDialog(docId, dialog);
                return dialog;


                //throw new DialogManagerException("_getAjaxDialog no implementat");
            },

            _generateRequestControlCallback: function (eventType, dataToSend) {

                return function() {
                    console.log("que es això:" , this);
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
            _getDiffDialog: function (docId, params) {
                throw new DialogManagerException("_getDiffDialog no implementat");
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