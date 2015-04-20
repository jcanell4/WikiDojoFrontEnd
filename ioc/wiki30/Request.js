define([
    "dojo/_base/declare",
    "dojox/widget/Standby",
    "dojo/request",
    "dojo/request/iframe",
    "ioc/wiki30/dispatcherSingleton",
    "dojo/Stateful"
], function (declare, Standby, request, iframe, dispatcherSingleton, Stateful) {
    var ret = declare([Stateful],
        /**
         * @class Request
         */
        {
            standbyId:   null,

            urlBase:     null,

            method:      "post",

            dispatcher:  dispatcherSingleton,

            _standby:    null,

            sectokId:    null,

            sectokParam: "sectok",

            query:       "",

            processors:  [],

            content:     null,

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
             *
             * @returns {string}
             */
            getQuery: function () {
                return this.query;
            },

            /**
             * Retorna true si hi ha PostData o false en cas contrari.
             *
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
             *
             * @returns {string} token de seguretat
             */
            getSectok: function () {
                return this.dispatcher.getSectok(this.sectokId);
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
                this.dispatcher.processResponse(data, this.processors);
                if (this._standby) {
                    this._standby.hide();
                }
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
                console.log(error);
                this.dispatcher.processError(error);
                if (this._standby) {
                    this._standby.hide();
                }
            },

            sendForm: function (formObject, buttonQuery) {
                //run standby resource while ajax response doesn't arribe
                if (this.standbyId !== null && !this._standby) {
                    this._standby = new Standby({target: this.standbyId});
                    document.body.appendChild(this._standby.domNode);
                    this._standby.startup();
                }
                /*It sets the Standby object in a variable to be accessible from any site.
                 *The private attibute is used to control the construction of the object
                 */
                var standby = this._standby;

                if (this.urlBase === null || this.dispatcher === null) {
                    return;
                }
                var linkChar = this.urlBase[this.urlBase.length - 1] === "=" ? "" :
                    (this.urlBase.indexOf("?") !== -1) ? "&" : "?";
                var vUrl = this.urlBase;               
                if(buttonQuery){
                    vUrl += linkChar + buttonQuery;
                    linkChar = "&";
                }
                var gSect = this.getSectok();
                if (gSect) {
                    vUrl += linkChar + this.sectokParam + "=" + gSect;
                }
                if (standby) {
                    standby.show();
                }
                var resp;
                var req = this;
                var configPost = {handleAs: "json"};
                if (this.content) {
                    configPost.content = this.content;
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
             * @returns {?dojo.promise.Promise}
             */
            sendRequest: function (query) {
                //run standby resource while ajax response doesn't arribe
                if (this.standbyId !== null && !this._standby) {
                    this._standby = new Standby({target: this.standbyId});
                    document.body.appendChild(this._standby.domNode);
                    this._standby.startup();
                }
                /*It sets the Standby object in a variable to be accessible from any site.
                 *The private attibute is used to control the construction of the object
                 */
                var standby = this._standby;

                if (this.urlBase === null || this.dispatcher === null) {
                    return;
                }
                var linkChar = this.urlBase[this.urlBase.length - 1] === "=" ? "" :
                    (this.urlBase.indexOf("?") !== -1) ? "&" : "?";
                var vUrl = this.urlBase;
                if (!query) {
                    var q = this.getQuery();
                    if (q && typeof q === "string" && q.length > 0) {
                        query = q;
                    } else {
                        this.content = q;
                    }
                }
                if (query) {
                    vUrl += linkChar + query;
                    linkChar = "&";
                }
                var gSect = this.getSectok();
                if (gSect) {
                    vUrl += linkChar + this.sectokParam + "=" + gSect;
                }
                if (standby) {
                    standby.show();
                }
                var resp;
                var req = this;
                var configPost = {handleAs: "json"};
                if (this.content) {
                    configPost.content = this.content;
                }
                if (this.method === "post") {

                    if (this.hasPostData()) {
                        configPost.data = this.getPostData();
                    }

                    resp = request.post(vUrl, configPost).then(
                        function (data) {
                            return req.responseHandler(data);
                        }, function (error) {
                            return req.errorHandler(error);
                        }
                    );
                } else {

                    resp = request.get(vUrl, configPost).then(
                        function (data) {
                            return req.responseHandler(data);
                        }, function (error) {
                            return req.errorHandler(error);
                        }
                    );
                }
                return resp;
            }
        });
    return ret;
});
