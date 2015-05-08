define([
    'dojo/_base/declare',
    "dojo/_base/array"
], function (declare, dojoArray) {
    return declare(null,
        /**
         * Aquesta classe permet enregistrar-se com observador o enregistrar-se a altres observadors per comunicar
         * quan es disparen determinats esdeveniments.
         *
         * La comunicació es realitza mitjançant una funció que es cridada amb les dades que es pasin al disparar-se
         * el esdeveniment.
         *
         * No es guarda cap referencia als sucriptors, només la funció a la que caldrà cridar, que al tractar-se de
         * closures continuen tenint accès al seu contexte original (el EventObserver suscriptor).
         *
         * @class EventObserver
         * @author Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            "-chains-": {
                onUnload: "before"
            },

            /** @type {{string?: function[]}} @private */
            events: {},

            /** @type EventObserver[] @private */
            observers: [],

            /**
             * @type {{observed: EventObserver, id: int}[]} indentificador propi dels events als que està subscrit
             * @private
             */
            registeredToEvents: [],

            constructor: function (params) {

                if (!params.dispatcher) {
                    console.error("El EventObserver no pot funcionar sense una referencia al dispatcher");
                    throw new Error("S'ha depassar una referencia al dispatcher");
                }

                declare.safeMixin(this, params);

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
                var reference = {
                    "observed": observer,
                    "id":       observer.registerObserverToEvent(event, callback)
                };
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

                //console.log("Desenregistrat observadors");
                this.registeredToEvents = [];
            },

            /**
             * Dispara l'esdeveniment cridant cadascunta de les funcions dels observadors enregistrats amb les dades
             * passades com argument.
             *
             * @param {string} event - Nom del esdeveniment
             * @param {*} data - Dades a passar a les funcions dels observadors
             */
            dispatchEvent: function (event, data) {
                var observers = this.events[event];

                if (observers) {
                    dojoArray.forEach(observers, function (callback) {
                        if (callback) {
                            callback(data);
                        }
                    });
                }
            },

            /**
             * Registra la funció al esdeveniment amb el nom passat com argument.
             *
             * @param {string} event - Nom del esdeveniment que llençarà la funció.
             * @param {function} callback - Funció que es cridarà al disparar-se el esdeveniment.
             * @returns {int} - Id de referencia per poder desenregistrar-se
             * @protected
             */
            registerObserverToEvent: function (event, callback) {
                var index,
                    observer;

                if (!Array.isArray(this.events[event])) {
                    this.events[event] = [];
                }

                index = this.events[event].push(callback) - 1;
                observer = {event: event, index: index};

                return this.observers.push(observer) - 1;
            },

            /**
             * Alliberem els objectes però no els esborrem per no alterar la correspondencia dels index de al resta dels
             * subscriptors
             *
             * @param {int} observerId - Identificador del event observat
             */
            unregister: function (observerId) {
                var subscriber = this.observers[observerId];

                this.events[subscriber.event][subscriber.index] = null;
                this.observers[observerId] = null;
            },

            /**
             * Es desenregistra automàticament de tots esl esdeveniments.
             *
             * Chained before
             */
            onUnload: function () {
                this.unregisterFromEvents();
            }
        })
});