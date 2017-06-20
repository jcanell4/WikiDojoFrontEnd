define([
    "dojo/_base/declare",
    "ioc/wiki30/Request",
    "ioc/wiki30/manager/EventObserver",
    "ioc/wiki30/dispatcherSingleton",
], function (declare, Request, EventObserver, getDispatcher) {

    var dispatcher = getDispatcher();

    var ret = declare([EventObserver],
        /**
         * @class RequestControl
         */
        {
            constructor: function (/*String*/ eventToControl,
                                   /*String*/ urlBase,
                                   /*boolean*/ post,
                                   /*boolean*/ disableOnSend,
                                   /*Object o Array*/ validatorData) {
                this.request = new Request();
                this.request.set("urlBase", urlBase);
                if (disableOnSend) {
                    this.request.set("disableOnSend", disableOnSend);
                }
                this.post = post;

                if (post) {
                    var self = this;

                    this.request.getPostData = function () {
                        return self.dataToSend;
                    };
                }

                this.id = 'RequestControl#' + eventToControl;

                var eventManager = this.request.dispatcher.getEventManager();
                //eventManager.registerEventForBroadcasting(this, eventToControl, this._sendRequest.bind(this)); // Alerta [Xavi] No cal fer broadcasting, aquest objecte només escolta
//                this.registerToEvent(eventManager, eventToControl, this._sendRequest.bind(this)); 
                //NOU CANVI. ARA cal afegir-lo al event manager com observador d'un objecte observable
                // eventManager.registerObserverToEvent(this, eventToControl, this._sendRequest.bind(this));
                eventManager.registerObserverToEvent(this, eventToControl, this._validate.bind(this));


                // En cas de passar com a validador només una funcío la assignem a un objecte correcte. Es farà servir el missatge d'error per defecte
                if (typeof validatorData === 'function') {
                    validatorData = {
                        callback: validatorData
                    }
                }

                this.validatorData = validatorData;

            },

            /**
             * Casos posibles:
             *  El validator no existeix
             *  El validator és un objecte amb el format: {callback: {function}, message: {string}}
             *  El validator és un array d'objectes amb el format anterior i s'han de passar totes les validadcions.
             * @param validator
             * @private
             */
            validator: function (data) {

                var result = {
                    success: true
                };


                if (!this.validatorData) {
                    // No cal fer res

                } else if (Array.isArray(this.validatorData)) {

                    for (var i = 0; i < this.validatorData.length; i++) {
                        if (!this.validatorData[i].callback(data)) {
                            result = {
                                success: false,
                                message: this.validatorData[i].message || null
                            };
                            break;
                        }
                    }


                } else {

                    if (!this.validatorData.callback(data)) {
                        result = {
                            success: false,
                            message: this.validatorData.message || null
                        };

                    }
                }

                return result;
            },


            /**
             * Els casos possibles són:
             *      Validació amb èxit: envia la petició
             *      Validació erronea amb missatge: es mostra missatge d'error
             *      Validació erronea sense missatge: s'ignora la petició silenciosament
             */
            _validate: function (data) {
                var validationResult = this.validator(data);

                if (validationResult.success) {
                    this._sendRequest(data);
                } else if (validationResult.message !== null) {
                    var errorMessage = {response: {text: validationResult.message}};
                    this._sendError(errorMessage);
                }
            },


            _sendRequest: function (data) {
                //console.log('RequestControl#_sendRequest', data);
                this.dataToSend = data.dataToSend;

                this.request.setStandbyId(data.standbyId);

                if (this.post) {
                    this.request.sendRequest();
                } else {
                    this.request.sendRequest(data.dataToSend);
                }
            },

            _sendError: function (message) {
                dispatcher.processError(message);
            }
        });
    return ret;
});