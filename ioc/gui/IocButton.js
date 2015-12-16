define([
    "dojo/_base/declare",
    /*"dijit/form/Button",
    "dijit/_TemplatedMixin",*/
    "ioc/gui/ButtonToListen",
    "dojo/text!./templates/Button.html",
    "ioc/wiki30/Request",
    /*"ioc/gui/IocResizableComponent",*/
    /*"dojo/_base/lang"*/
], function (declare, button/*, _TemplatedMixin*/, template, Request /*, IocComponent, dojoBase*/) {
    var ret = declare("ioc.gui.IocButton", [button, Request /*, _TemplatedMixin, IocComponent*/],

        /**
         * Declara un Botó que realitza la funció indicada en un atribut
         * també canvia el tamany de fixe a variable segons el contenidor
         *
         * Aquest widget es un boto que Al clicarlo recorre tots els listeners associats i els processa si son objectes
         * o els executa si son funcions.
         *
         * @class IocButton
         * @extends dijit.form.Button
         * @extends dijit._TemplatedMixin
         * @extends IocResizableComponent
         * @extends Request
         */
        {
            templateString: template,
            
            /** @override */
            postListenOnClick: function(evt){
                this.sendRequest();
            }/*,

            /** @type {Object.<function|ioc.wiki30.processor.AbstractResponseProcessor>} *//*
            clickListener: null,
            */

            /**
             * Al clicar aquest botó es recorren tots els listeners afegits, si es una funció la executa i si es un
             * objecte crida al seu métode process() passant aquest event com argument.
             *
             * TODO[Xavi] els métodes isFunction(), isXXX() de lang estan obsolets, s'has de substituir pel 2.0
             *
             * @param {*} evt
             * @private
             * @override
             *//*
             _onClick: function (evt) {
                this.inherited(arguments);
                if (this.clickListener) {
                    for (var i in this.clickListener) {
                        if (dojoBase.isFunction(this.clickListener[i])) {
                            this.clickListener[i](evt);
                        } else if (dojoBase.isObject(this.clickListener[i])) {
                            this.clickListener[i].process(evt); // TODO[Xavi] Error, s'hauria de passar també el Dispatcher
                        }
                    }
                }
                if(!evt.defaultPrevented){
                    this.sendRequest();
                }
                return !evt.defaultPrevented;
            },*/

            /** @override *//*
            startup: function () {
                this.inherited(arguments);
                this.nodeToResize = this.buttonNode;
                this.topNodeToResize = this.buttonTopNode;
                this.resize();
                this.__setVisible();
            },*/


            /**
             * TODO[Xavi] No es crida enlloc?
             *
             * @param {function|AbstractResponseProcessor} listener
             * @returns {*}
             *//*
            addClickListener: function (listener) {
                var key = 'autoKey';
                if(!this.clickListener){
                    this.clickListener={};
                }
                key = key + Object.keys(this.clickListener).length;
                return this.putClickListener(key, listener);
            },*/

            /**
             * TODO[Xavi] Fer servir un diccionari?
             * @param {string} key
             * @param {function|AbstractResponseProcessor} listener
             *//*
            putClickListener: function (key, listener) {
                if (!this.clickListener) {
                    this.clickListener = {};
                }
                this.clickListener[key] = listener;
            }*/
        });
    return ret;
});