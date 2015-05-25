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
    "dojo/dom"
], function (declare, Standby, request, iframe, dispatcherSingleton, Stateful
                , timing, domConstruct, domGeom, style, dom) {
    var ret = declare([Stateful],
        /**
         * @class Request
         */
        {
            standbyId:   null,
            
            hasTimer:   false,
            
            disableOnSend: false,

            _timer:      null,

            urlBase:     null,

            method:      "post",

            dispatcher:  dispatcherSingleton,

            _standby:    null,

            sectokId:    null,

            sectokParam: "sectok",

            query:       "",

            processors:  null,

            content:     null,
            
            constructor: function(){
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
                console.error(error);
                this._stopStandby();
                this.dispatcher.processError(error);
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
                
                this._startStandby();

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
                console.log(query);
                //run standby resource while ajax response doesn't arribe
                if (this.standbyId !== null && !this._standby) {
                    this._standby = new Standby({target: this.standbyId});
                    document.body.appendChild(this._standby.domNode);
                    this._standby.startup();
                }


                /*It sets the Standby object in a variable to be accessible from any site.
                 *The private attibute is used to control the construction of the object
                 */
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

                this._startStandby();

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
            },
            
            setStandbyId: function(id){
                this.set("standbyId", id);
                this._standby=null;                
            },
            _standbyIdSetter: function(id){
                this.standbyId=id;
                this._standby=null;
            },
            
            _startStandby: function(){
                if(this._standby){
                    this._standby.show();
                    if(this.hasTimer){
                        this._timer.start();
                    }
                }
                if(this.disableOnSend){
                    this.set("disabled", true);
                }
            },
            
            _stopStandby: function(){
                if(this._standby){
                   this._standby.hide();
                }
                if(this.hasTimer && this._timer.isRunning){
                    this._timer.stop();
                }      
                if(this.disableOnSend){
                    this.set("disabled", false);
                }
            },
            
            _initTimer:function(){
                var counterDiv=null;
                var self = this;
                var textSize;
                this._timer = new timing.Timer(1000);
                this._timer.counter= 0;
                this._timer.onStop = function(){
                    domConstruct.destroy(counterDiv);
                    counterDiv=null;
                }
                this._timer.onStart = function(){                   
                    this.counter=0;
                    if(self._standby){
                        var output = domGeom.getContentBox(self.standbyId, style.getComputedStyle(self.standbyId));
                        textSize=output.w<(output.h/2)?output.w:output.h/2;
                        counterDiv = domConstruct.toDom(
                            "<div style='text-align: center;vertical-align: middle;"
                            +"height: 100%;'><span id='counter_"+self.standbyId
                            + "' style='font-size:"+(textSize)+"px;'>"+this.counter+"</span></div>"
                        );
                        domConstruct.place(counterDiv, self.standbyId);
                    }
                };
                this._timer.onTick= function(){
                        var nodeCounter = dom.byId("counter_"+ self.standbyId);
                        var outputExt = domGeom.getContentBox(self.standbyId, style.getComputedStyle(self.standbyId));
                        var outputInt = domGeom.getContentBox(nodeCounter, style.getComputedStyle(nodeCounter));
                        this.counter++;
                        nodeCounter.innerHTML=this.counter;
                        if(outputExt.w<outputInt.w){
                            textSize=textSize-outputInt.w+outputExt.w-2;
                            if(textSize>outputExt.h/2){
                                textSize=outputExt.h/2
                            }
                            nodeCounter.style["font-size"] = "" + (textSize) + "px";
                        }
                };               
            }                        
        });
    return ret;
});
