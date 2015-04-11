define([
    'dojo/_base/declare',
    "dojo/_base/array"
], function (declare, dojoArray) {
    return declare(null,
        /**
         * @class EventObserver
         */
        {

            "-chains-": {
                onUnload: "before"
            },

            events: {}, // {string: function[]};

            observers: [],

            /** @type {{observed: EventObserver, id: int}[]} indentificador propi dels events als que està subscrit */
            registeredToEvents: [],

            constructor: function (args) {

                if (!args.dispatcher) {
                    console.error("El EventObserver no pot funcionar sense una referencia al dispatcher");
                    throw new Error("S'ha depassar una referencia al dispatcher");
                }

                declare.safeMixin(this, args);
                //this.eventManager = args.dispatcher.getEventManager();

                this.registeredToEvents = [];
                this.events = {};
                this.observers = [];
            },


            /**
             * Es registra al esdeveniment i respón amb la funció passada com argument quan es escoltat.
             *
             * Es guarda la referencia obtinguda al registrar-lo per poder desenregistrar-se quan sigui
             * necessari.
             *
             * @param {EventObserver} observer - observador al que ens enregistrem
             * @param {string} event - nom del esdeveniment
             * @param {function} callback - funció a executar
             */

            registerToEvent: function (observer, event, callback) {
                console.log("Observed: ", observer);
                console.log("MEtode: ", observer.registerObserverToEvent);
                //alert("dins de register");


                var reference = {
                    "observed": observer,
                    "id":       observer.registerObserverToEvent(event, callback)
                };

                console.log("Vull enregistrarme!");
                this.registeredToEvents.push(reference);
            },

            /**
             * Recorre la lista de esdeveniments al que està subscrit i es desenregistra de tots.
             */
            unregisterFromEvents: function () {
                var observed, id;

                for (var i = 0, len = this.registeredToEvents.length; i < len; i++) {
                    observed = this.registeredToEvents[i]['observed'];
                    id = this.registeredToEvents[i]['id'];
                    observed.unregister(id);
                }

                console.log("Desenregistrat observadors");
                this.registeredToEvents = [];
            },

            /**
             * @deprecated Use dispatchEvent(event, data)
             * @param event
             * @param data
             */
            triggerEvent: function (event, data) {
                //this.eventManager.dispatchEvent(event, data);
                this.dispatchEvent(event, data);
            },

            dispatchEvent: function (event, data) {
                var observers = this.events[event];

                console.log("llençant esdeveniment:", event, data);

                console.log("Interessats:", observers);
                console.log("Totals:",this.events);

                if (observers) {
                    dojoArray.forEach(observers, function (callback) {
                        console.log("Cridat");
                        if (callback) {
                            callback(data);
                        }
                    });
                }

            },


            /**
             *
             * @param {string} event
             * @param {function} callback
             * @returns {int}
             */
            registerObserverToEvent: function (event, callback) {
                //alert("dins de registerObserver");
                var index,
                    observer;

                if (!Array.isArray(this.events[event])) {
                    this.events[event] = [];
                }

                index = this.events[event].push(callback) - 1;
                observer = {event: event, index: index};


                console.log("Enregistrat observador al esdeveniment:"+event);

                return this.observers.push(observer) - 1;
            }

        })

});