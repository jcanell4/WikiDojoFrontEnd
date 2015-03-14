define([
    "dojo/_base/declare",
    "dojo/_base/array",

], function (declare, array) {
    return declare(null,
        /**
         * Gestiona el llençament d'esdeveniments i la comunicació als observadors
         *
         * @class EventManager
         * @author Xavier Garcia <xaviergaro.dev@gmail.com>
         */
        {
            events: {}, // string: function[];

            observers: [],

            dispatcher: null,

            constructor: function (dispatcher) {
                this.dispatcher = dispatcher;
            },

            registerToEvent: function (event, callback) {
                var index,
                    observer;

                if (!Array.isArray(this.events[event])) {
                    this.events[event] = [];
                }

                index = this.events[event].push(callback) - 1;
                observer = {event: event, index: index};


                console.log ('Enregistrament detectat per: ' + event);
                return this.observers.push(observer) - 1;
            },

            /**
             * Despatxa l'esdeveniment amb les dades passades com argument a tots els observadors.
             *
             * @param {string} event - Nom del esdeveniment
             * @param {object} data - Dades que es passaran als observadors
             */
            dispatchEvent: function (event, data) {

                var observers = this.events[event];


                if (observers) {

                    array.forEach(observers, function (callback) {

                        if (callback) {
                            callback(data);
                        }
                    });
                }

                console.log ('Esdeveniment disparat: ' + event);
            },

            /**
             * Alliberem els objectes però no els esborrem per no alterar la correspondencia dels index de al resta dels
             * subscriptors
             *
             * @param {int} observerId - Identificador del event observat
             */
            removeObserver: function (observerId) {
                console.log ('es vol elminar Observador eleminat amb id: '+ observerId);
                var subscriber = this.observers[observerId];

                this.events[subscriber.event][subscriber.index] = null;
                this.observers[observerId] = null;
                console.log ('Observador eleminat amb id: '+ observerId);
                console.log(this.observers);
            }

        });
});
