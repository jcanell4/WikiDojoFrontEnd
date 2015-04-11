define([
    "dojo/_base/declare",
    "dojo/_base/array"
], function (declare, array) {
    return declare(null,
        /**
         * Gestiona el llençament d'esdeveniments i la comunicació als observadors
         *
         * @class EventManager
         * @author Xavier Garcia <xaviergaro.dev@gmail.com>
         */
        {
            events: {}, // {string: function[]};

            observers: [],

            dispatcher: null,

            constructor: function (dispatcher) {
                this.dispatcher = dispatcher;
                //alert("Constructor EVENT MANAGER");
            },

            registerToEvent: function (event, callback) {
                alert("RegisterToEvent EVENT MANAGER");
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
             * Despatxa l'esdeveniment amb les dades passades com argument a tots els observadors.
             *
             * @param {string} event - Nom del esdeveniment
             * @param {object} data - Dades que es passaran als observadors
             */
            dispatchEvent: function (event, data) {
                alert("DispatchEvent EVENT MANAGER");
                var observers = this.events[event];

                //console.log("llençant esdeveniment:", event, data);

                if (observers) {
                    array.forEach(observers, function (callback) {
                        if (callback) {
                            callback(data);
                        }
                    });
                }
            },

            /**
             * Alliberem els objectes però no els esborrem per no alterar la correspondencia dels index de al resta dels
             * subscriptors
             *
             * @param {int} observerId - Identificador del event observat
             */
            unregister: function (observerId) {
                alert("Unregister EVENT MAANGER");
                var subscriber = this.observers[observerId];

                this.events[subscriber.event][subscriber.index] = null;
                this.observers[observerId] = null;

                console.log("Eliminat observador: ", observerId);
            }

        });
});
