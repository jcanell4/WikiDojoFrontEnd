define([
    "dojo/_base/declare"
], function (declare) {

    return declare(null,
        /**
         * Classe per afegir la funcionalitat que controla la correcta eliminació dels listeners que s'afegeixen durant
         * la renderització.
         *
         * @deprecated
         * @class AbstractContentToolListenersManagement
         * @author Xavier García <xaviergaro.dev@gmail.com>
         */
        {


            /** @typedef {remove: function} Handler */

            ///** @type {Handler[]} */
            //listeners:null,

            preRender: function () {
                console.log("AbstractContentToolListenersManagement#preRender()", this.id);
                //alert("Ara s'esborren els listeners");

                //alert("preRender dels Listeners");
                this.removeListenerHandlers();

                //if (this.postRender) {
                //    this.postRender();
                //} else {
                //    console.warning("no existeix el porsRender()", this);
                //}

                this.inherited(arguments);
            },

            postRender: function() {
                console.log("AbstractContentToolListenersManagement#postRender()", this.id);
                alert("useless");
                this.inherited(arguments);
            },


            // Compte, si aquest existeix es cridat en lloc del propi de la subclasse
            //postRender: function() {
            //    console.log("POSTRENDER");
            //},

            addListenerHandler: function (handler) {

                if (Array.isArray(handler)) {
                    this._setListenerHandlers(this._getListenerHandlers().concat(handler));
                } else {
                    this._getListenerHandlers().push(handler);
                }
                console.log("AbstractContentToolListenersManagement#addListenerHandler()", this.id);

            },

            removeListenerHandlers: function () {
                console.log("AbstractContentToolListenersManagement#removeListenerHandlers()", this.id);

                this._getListenerHandlers().forEach(function (handler) {
                    handler.remove();
                    console.log("Eliminat");
                });

                this._setListenerHandlers([]);
                //this.listenerHandlers = [];
            },

            _getListenerHandlers: function () {
                //console.log("AbstractContentToolListenersManagement#_getListenerHandlers()", this.listenerHandlers);
                return (this.listenerHandlers ? this.listenerHandlers : []);

            },

            _setListenerHandlers: function (listenerHandlers) {
                this.listenerHandlers = listenerHandlers;
                //console.log("AbstractContentToolListenersManagement#_setListenerHandlers()", listenerHandlers);
            }

        });
});
