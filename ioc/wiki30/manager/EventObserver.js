define([
    'dojo/_base/declare',
], function (declare) {
    return declare(null, {

        "-chains-": {
            onUnload: "before"
        },

        /** @type {int[]} indentificador propi dels events als que està subscrit */
        registeredToEvents: [],

        constructor: function (args) {

            if (!args.dispatcher) {
                console.error("El EventObserver no pot funcionar sense una referencia al dispatcher");
                throw new Error("S'ha depassar una referencia al dispatcher");
            }

            declare.safeMixin(this, args);
            this.eventManager = args.dispatcher.getEventManager();

            this.registeredToEvents = [];
        },


        /**
         * Es registra al esdeveniment i respón amb la funció passada com argument quan es escoltat.
         *
         * Es guarda la referencia obtinguda al registrar-lo per poder desenregistrar-se quan sigui
         * necessari.
         *
         * @param {string} event - nom del esdeveniment
         * @param {function} callback - funció a executar
         */
        registerToEvent: function (event, callback) {
            this.registeredToEvents.push(this.eventManager.registerToEvent(event, callback));
        },

        /**
         * Recorre la lista de esdeveniments al que està subscrit i es desenregistra de tots.
         */
        unregisterFromEvents: function () {
            for (var i = 0, len = this.registeredToEvents.length; i < len; i++) {
                this.eventManager.unregister(this.registeredToEvents[i]);
            }

            this.registeredToEvents = [];
        },

        triggerEvent: function (event, data) {
            this.eventManager.dispatchEvent(event, data);
        }


    })

});