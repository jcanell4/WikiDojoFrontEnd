define([
    "dojo/_base/declare",
    "dijit/form/Button",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/Button.html",
    "ioc/gui/ResizableComponent",
    "dojo/_base/lang",
    "ioc/wiki30/dispatcherSingleton",
], function (declare, button, _TemplatedMixin, template, Resizable, dojoBase, getDispatcher) {
    var ret = declare("ioc.gui.ButtonToListen", [button, _TemplatedMixin, Resizable],

        /**
         * Declara un Botó que executa la funció postListenOnClick, un cop ha 
         * recorregut tots els listeners associats i els ha processat (si son objectes)
         * o executat (si son funcions). 
         * 
         * Es pot prevenir l'execució de la funció postListenOnClick executant 
         * el mètode preventDefault de l'esdeveniment o bé fent servir la utilitat 
         * dojo/_base/event de dojo, executant dojo._base.event#stop(event);
         * 
         * Aquesta classe també dota al botó de la propietat d'adaptar-se a 
         * la mida del contenidor per defecte.
         * 
         *
         * @class ButtonToListen
         * @extends dijit.form.Button
         * @extends dijit._TemplatedMixin
         * @extends ResizableComponent
         */
        {
            templateString: template,
            

            getDataEventObject: null, //funció que retorna un objecte hash amb el 
                                  //valor dels paràmetres a passar a través de 
                                  //l'objecte event.
                                  
            constructor:function(args){
                //console.log("ButtonToListen");
                if(!this.dispatcher){
                    this.dispatcher = getDispatcher();
                }
                declare.safeMixin(this, args);
            },
            
            postListenOnClick: function(evt){},

            /** @type {Object.<function|ioc.wiki30.processor.AbstractResponseProcessor>} */
            clickListener: null,

            /**
             * En clicar aquest botó es recorren tots els listeners afegits, si es una funció la executa i si es un
             * objecte crida al seu métode process() passant aquest event com argument.
             *
             *En acabar si no s'ha previngut l'esdeveniment per defecte, s'executa la funció postListenOnClick.
             *
             * @param {*} evt
             * @private
             * @override
             */
             _onClick: function (evt) {
                this.inherited(arguments);
                if(this.getDataEventObject){
                    evt.data = this.getDataEventObject();
                }
                if (this.clickListener) {
                    for (var i in this.clickListener) {
                        if (typeof this.clickListener[i] == "function") {
                            this.clickListener[i](evt);
                        } else if (dojoBase.isObject(this.clickListener[i])) {
                            this.clickListener[i].process(evt);
                        }
                    }
                }
                if(!evt.defaultPrevented){
                    this.postListenOnClick(evt);
                }
                return !evt.defaultPrevented;
            },

            /** @override */
            startup: function () {
                this.inherited(arguments);
                this.set("nodeToResize", this.buttonNode); //this.nodeToResize = this.buttonNode;
                this.set("topNodeToResize", this.buttonTopNode); //this.topNodeToResize = this.buttonTopNode;
                this.resize();
                this.__setVisible();
            },


            /**
             *
             * @param {function|AbstractResponseProcessor} listener
             * @returns {*}
             */
            addClickListener: function (listener) {
                var key = 'autoKey';
                if(!this.clickListener){
                    this.clickListener={};
                }
                key = key + Object.keys(this.clickListener).length;
                return this.putClickListener(key, listener);
            },

            /**
             * @param {string} key
             * @param {function|AbstractResponseProcessor} listener
             */
            putClickListener: function (key, listener) {
                if (!this.clickListener) {
                    this.clickListener = {};
                }
                this.clickListener[key] = listener;
            }
        });
    return ret;
});