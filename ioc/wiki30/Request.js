define([
    "dojo/_base/declare",
    "dojox/widget/Standby",
    "dojo/request",
    "dojo/request/iframe",
    "ioc/wiki30/dispatcherSingleton",
    "dojo/Stateful",
    "dojox/timing",
    "dojo/dom-construct",
    "dojo/dom-geometry",
    "dojo/dom-style",
    "dojo/dom",
    "dojo/Evented",
    "dojo/io-query"
], function (declare, Standby, request, iframe, getDispatcher, Stateful,
                timing, domConstruct, domGeom, style, dom, Evented, ioQuery) {

    /**
     * @class Request
     */
    var ret = declare([Stateful, Evented],
        {
            standbyId: null,
            hasTimer: false,
            disableOnSend: false,
            _disabled: false,
            _timer: null,
            urlBase: null,
            method: "post",
            _standby: null,
            sectokId: null,
            sectokParam: "sectok",
            query: "",
            processors: null,
            dataToSend: null,

            constructor: function () {
                //console.log("Request");
                this.dispatcher = getDispatcher();
                this._initTimer();
            },

            /**
             *
             * @param {string} type
             * @param {function} processor
             */
            addProcessor: function (type, processor) {
                if (this.processors === null) {
                    this.processors = [];
                }
                this.processors[type] = processor;
            },

            /**
             *
             * @param {string} type
             * @returns {function}
             */
            getProcessor: function (type) {
                return this.processors[type];
            },

            /**
             * Retorna la query emmagatzemada. Aquest métode es sobrescrit a scriptesRef.tpl.
             * @returns {string}
             */
            getQuery: function () {
                return this.query;
            },

            /**
             * Retorna true si hi ha PostData o false en cas contrari.
             * @returns {boolean}
             */
            hasPostData: function () {
                return this.getPostData() !== null;
            },

            /**
             * TODO[Xavi] es sobrescrit a scriptsRef.tpl
             * @returns {null}
             * @interface
             */
            getPostData: function () {
                return null;
            },

            /**
             * Retorna el token de seguretat emmagatzemat al dispatcher.
             * @returns {string} token de seguretat
             */
            getSectok: function () {
                return this.dispatcher.getSectok(this.sectokId);
            },

            getDataToSend: function(){
                return this.dataToSend;
            },

            setDataToSend: function(dataToSend){
                this.dataToSend = dataToSend;
            },

            /**
             * Es cridat quan rep la resposta del servidor i passa les dades al dispatcher per processar-les.
             * El type es el tipus de comanda i value es un objecte amb les dades necessaries per processar
             * la comanda.
             *
             * Si s'està mostrant el standby l'amaguem.
             *
             * @param {Command|Command[]} data dades per processar.
             */
            responseHandler: function (data) {
                this._stopStandby();
                this.dispatcher.processResponse(data, this.processors);
            },

            /**
             * Es cridat quan la resposta de la petició es erronia. Per exemple quan s'intenta accedir a una pàgina
             * sense estar autenticat.
             *
             * Si s'està mostrant el standby l'amaguem.
             *
             * @param {Error} error
             */
            errorHandler: function (error) {
//                console.error(error);
                this._stopStandby();
                this.dispatcher.processError(error);
            },

            /**
             * Realitzar una petició ajax de tipus post, passant com a dades
             * el contingut  d'un formulari (fromObject). A més se li pot
             * afegir a la petició un string en forma d query de la petició
             * (buttonQuery): "id=valor&do=valorDo&..."
             *
             * @param {string} formObject objecte de tipus formulari que es vol
             * enviar a la comanda.
             * @param {string} buttonQuery petició que fem a la dokuwiki
             *
             * @returns {dojo.promise.Promise}
             */
            sendForm: function (formObject, buttonQuery) {
                if(this._disabled){
                    return;
                }
                //run standby resource while ajax response doesn't arribe
                this._createStandbyObject();

                if (this.urlBase === null || this.dispatcher === null) {
                    return;
                }
                var linkChar = (this.urlBase[this.urlBase.length - 1] === "=") ? "" : (this.urlBase.indexOf("?") !== -1) ? "&" : "?";
                var vUrl = this.urlBase;
                if (buttonQuery) {
                    vUrl += linkChar + buttonQuery;
                    linkChar = "&";
                }
                this._startStandby();

                var gSect = this.getSectok();
                if (gSect) {
                    vUrl += linkChar + this.sectokParam + "=" + gSect;
                    linkChar = "&";
                }
                
                var moodleToken = this.dispatcher.getGlobalState().getUserState("moodleToken");
                if(moodleToken && moodleToken!==""){
                    vUrl += linkChar + "moodleToken=" + moodleToken;
                }                

                var resp;
                var req = this;
                var configPost = {handleAs: "json"};
                if (this.dataToSend) {
                    configPost.query = this.dataToSend;
                }
                configPost.form = formObject;
                configPost.data = {iframe: 1};

                resp = iframe.post(vUrl, configPost).then(
                    function (data) {
                        return req.responseHandler(data);
                    }, function (error) {
                        return req.errorHandler(error);
                    }
                );
                return resp;
            },

            /**
             * Realitzar una petició ajax, pot ser només una ordre o més d'una per exemple:
             *      'id=start'
             *      'do=edit&id=start'
             *
             * TODO[Xavi] Aquest métode es confus, no fa servir un únic var i te diversos punts de retorn.
             *
             * @param {string} query petició que fem a la dokuwiki
             *
             * @param {bool} synchronized
             * @returns {dojo.promise.Promise}
             */
            sendRequest: function (query, synchronized) {
                if(this._disabled){
                    return;
                }
//                console.log("Request:sendRequest ("+query+"). this.parameters: " + this.parameters);
                //run standby resource while ajax response doesn't arribe
                this._createStandbyObject();

                //Checking if sending can be run.
                if (this.urlBase === null || this.dispatcher === null) {
                    return;
                }

                //starting standby proces if exsit some stantBy object
                this._startStandby();

                //Set the query value and set the linkChar value to build a good query.
                //if query param is null, query takes the value returned by getQuery function.
                var linkChar = (this.urlBase[this.urlBase.length - 1] === "=") ? "" : (this.urlBase.indexOf("?") !== -1) ? "&" : "?";
                var vUrl = this.urlBase;
                if (!query) {
                    query = this.getQuery();
                }

                //Setting the linkChar value.
                var dataToSend;
                if (this.method!=="post" && query && typeof query === "string" && query.length > 0) {
                    vUrl += linkChar + query;
                    linkChar = "&";
                }else if(this.dataToSend) {
                    if(typeof (this.dataToSend)==="string"){
                        dataToSend = this.dataToSend;
                    }else{
                        dataToSend={};
                        for (var attrname in this.dataToSend) {
                            dataToSend[attrname] = this.dataToSend[attrname];
                        }
                        for (var attrname in query) {
                            dataToSend[attrname] = query[attrname];
                        }
                    }
                }else if(query){
                    dataToSend = query;
                }

                //Setting the sectok value to a correct checking in the server side.
                var gSect = this.getSectok();
                if (gSect) {
                    vUrl += linkChar + this.sectokParam + "=" + gSect;
                    linkChar = "&";
                }

                var moodleToken = this.dispatcher.getGlobalState().getUserState("moodleToken");
                if(moodleToken && moodleToken!==""){
                    vUrl += linkChar + "moodleToken=" + moodleToken;
                }


                // console.log("query", query, this.method, this.getPostData());
                var validationResult = this.validate(query || this.getPostData());

                if (!validationResult.success) {
                    // if (!validationResult.message) {
                    //     validationResult.message = "No es pot enviar la petició"; // TODO[Xavi] Localitzar
                    // }

                    var errorMessage = {response: {text: validationResult.message}};
                    this._sendError(errorMessage);
                    this._stopStandby();
                    return;
                }


                //Build and send the request.
                var resp;
                var req = this;
                var configPost = {handleAs: "json", sync: (synchronized || false)};
                if (this.method === "post") {

                    if (this.hasPostData()) {
                        configPost.data = this.getPostData();
                        if (typeof (dataToSend)=="string") {
                            if(typeof (configPost.data)=="string"){
                                configPost.data.concat(dataToSend);
                            }else if(configPost.data){
                                var objectQuery = ioQuery.queryToObject(dataToSend);
                                configPost.data = Object.assign(configPost.data, objectQuery);
                            }else{
                                configPost.data = dataToSend;
                            }
                        }else{
                            for (var attrname in dataToSend) {
                                configPost.data[attrname] = dataToSend[attrname];
                            }
                        }
                    }else if (dataToSend) {
                        configPost.data = dataToSend;
                    }

                    resp = request.post(vUrl, configPost).then(
                        function (data) {
                            req.emit("completed", {status: 'success', data:data});
                            return req.responseHandler(data);
                        }, function (error) {
                            req.emit("completed", {status: 'error'});
                            return req.errorHandler(error);
                        }
                    );
                } else {

                    if (this.dataToSend) {
                        configPost.query = this.dataToSend;
                    }
                    resp = request.get(vUrl, configPost).then(
                        function (data) {
                            req.emit("completed", {status: 'success'});
                            return req.responseHandler(data);
                        }, function (error) {
                            req.emit("completed", {status: 'error'});
                            return req.errorHandler(error);
                        }
                    );
                }

                return resp;
            },

            /**
             * Si es passa false en lloc de la id es desactiva. Això permet reutilitzar el request sense forçar que es
             * mostri el paramId
             * @param {string|bool} id del contenidor o false si no es vol mostrar
             */
            setStandbyId:     function (id) {

                if (!id===false) {
                // if (!id===false && this.get("standbyId") !== id) {
                    if (this.get("standbyId") !== id) {
                        this.set("standbyId", id);
                        this._standby = null;
                    }
                    this._standbyDisabled = false;

                } else {
                    this._standbyDisabled = true;
                }

            },

            _createStandbyObject:function () {
                /*It sets the Standby object in a variable to be accessible from any site.
                 *The private attibute is used to control the construction of the object
                 */

                if (this.standbyId !== null && !this._standby) {
                    this._standby = new Standby({target: this.standbyId});
                    document.body.appendChild(this._standby.domNode);
                    this._standby.startup();
                }
            },

            _standbyIdSetter: function (id) {
                if (this.standbyId !== id) {
                    this.standbyId = id;
                    this._standby = null;
                }
            },

            _startStandby: function () {
                if (this._standbyDisabled) {
                    return;
                }
                if (this._standby) {
                    this._standby.show();
                    if (this.hasTimer) {
                        this._timer.start();
                    }
                }
                if (this.disableOnSend) {
                    this.set("disabled", true);
                    this._disabled=true;
                }
            },

            _stopStandby: function () {
                if (this._standby) {
                    // this._standby.hide();
                    // ALERTA[Xavi] la reutilització no funciona, si es tanca un document
                    // i es torna a obrir els standby no es mostren, així que els destruim
                    // i els refem quan sigui necessari
                    this._standby.destroy();
                    this._standby=null;
                }
                if (this.hasTimer && this._timer.isRunning) {
                    this._timer.stop();
                }
                if (this.disableOnSend) {
                    this.set("disabled", false);
                    this._disabled=false;
                }
            },

            _initTimer: function () {
                var counterDiv = null;
                var self = this;
                var textSize;
                this._timer = new timing.Timer(1000);
                this._timer.counter = 0;
                this._timer.onStop = function () {
                    domConstruct.destroy(counterDiv);
                    counterDiv = null;
                };

                this._timer.onStart = function () {
                    this.counter = 0;
                    if (self._standby) {

                        var output = domGeom.getContentBox(self.standbyId, style.getComputedStyle(self.standbyId));
                        textSize = output.w < (output.h / 2) ? output.w : output.h / 2;
                        counterDiv = domConstruct.toDom(
                            "<div style='text-align: center;vertical-align: middle;"
                            + "height: 100%;'><span id='counter_" + self.standbyId
                            + "' style='font-size:" + (textSize) + "px;'>" + this.counter + "</span></div>"
                        );
                        domConstruct.place(counterDiv, self.standbyId, "first");
                    }
                };

                this._timer.onTick = function () {
                    var nodeCounter = dom.byId("counter_" + self.standbyId);
                    var outputExt = domGeom.getContentBox(self.standbyId, style.getComputedStyle(self.standbyId));
                    var outputInt = domGeom.getContentBox(nodeCounter, style.getComputedStyle(nodeCounter));
                    this.counter++;
                    nodeCounter.innerHTML = this.counter;
                    if (outputExt.w < outputInt.w) {
                        textSize = textSize - outputInt.w + outputExt.w - 2;
                        if (textSize > outputExt.h / 2) {
                            textSize = outputExt.h / 2;
                        }
                        nodeCounter.style["font-size"] = "" + (textSize) + "px";
                    }
                };
            },

            setValidator: function(validatorData) {
                // En cas de passar com a validador només una funció la assignem a un objecte correcte. Es farà servir el missatge d'error per defecte
                if (typeof validatorData === 'function') {
                    validatorData = {
                        callback: validatorData,
                        message: LANG.template['ioc-template'].default_validation_request_error
                    };
                }

                this.validatorData = validatorData;
            },

            validate: function (data) {
                // console.log('Request#validate', data);
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
                                message: this.validatorData[i].message || LANG.template['ioc-template'].default_validation_request_error
                            };
                            break;
                        }
                    }

                } else {

                    if (!this.validatorData.callback(data)) {
                        result = {
                            success: false,
                            message: this.validatorData.message || LANG.template['ioc-template'].default_validation_request_error
                        };
                    }
                }

                return result;
            },

            _sendError: function (message) {
                this.dispatcher.processError(message);
            }
            //
            // /**
            //  * Els casos possibles són:
            //  *      Validació amb èxit: envia la petició
            //  *      Validació erronea amb missatge: es mostra missatge d'error
            //  *      Validació erronea sense missatge: s'ignora la petició silenciosament
            //  */
            // _validate: function (data) {
            //     var validationResult = this.validator(data);
            //
            //     if (validationResult.success) {
            //         this._sendRequest(data);
            //     } else if (validationResult.message !== null) {
            //         var errorMessage = {response: {text: validationResult.message}};
            //         this._sendError(errorMessage);
            //     }
            // },
        });
    return ret;
});
