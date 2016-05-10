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
            // TODO[Xavi] Ordenar-les i afegir-les alfabeticament
            eventName: {
                DESTROY: 'destroy',
                UNLOCK_DOCUMENT: 'unlock_document',
                LOCK_DOCUMENT: 'lock_document',
                DOCUMENT_CHANGED: 'document_changed',
                DOCUMENT_SELECTED: 'document_selected',
                DATA_REPLACED: 'data_replaced',
                CANCEL_DOCUMENT: 'cancel_document',
                CANCEL_PARTIAL: 'cancel_partial',
                EDIT_PARTIAL: 'edit_partial',
                SAVE_PARTIAL: 'save_partial',
                CANCEL: 'cancel',
                EDIT: 'edit',
                SAVE: 'save',
                SAVE_DRAFT: 'save_draft',
                CONTENT_SELECTED: 'content_selected',
                CONTENT_UNSELECTED: 'content_unselected',
                DOCUMENT_CHANGES_RESET: 'document_changes_reset',
                NOTIFY: 'notify',
                TIMEOUT: 'timeout'

            },

            // Constants/Enum TODO[Xavi] Substituir totes les cadenes per this.event.QUELCOM de manera que no hi hagi errors
            eventNameCompound: {
                CANCEL: 'cancel_',
                LOCK: 'lock_',
                UNLOCK: 'unlock_',
                DOCUMENT_CHANGED: 'document_changed_',
                DOCUMENT_REFRESHED: 'document_refreshed_',
                SAVE_PARTIAL: 'save_partial_',
                CANCEL_PARTIAL: 'cancel_partial_',
                EDIT_PARTIAL: 'edit_partial_',
                SAVE: 'save_'
            },


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
                    "id": observer.registerObserverToEvent(event, callback)
                };
                this.registeredToEvents.push(reference);

                //console.log("EventObserver#registerToEvent", event, reference);
            },

            /**
             * Recorre la lista de esdeveniments al que està subscrit i es desenregistra de tots. Això s'ha de cridar
             * abans d'eliminar l'objecte.
             */
            unregisterFromEvents: function () {
                //console.log("EventObserver#unregisterFromEvents", this.registeredToEvents);
                var observed, id;

                for (var i = 0, len = this.registeredToEvents.length; i < len; i++) {

                    observed = this.registeredToEvents[i]['observed'];
                    id = this.registeredToEvents[i]['id'];
                    observed.unregister(id);
                }

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
                //console.log("EventObserver#dispatchEvent: ", event, data);

                var observers = this.events[event];

                data.name = event;

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

                if (subscriber !== null) {
                    this.events[subscriber.event][subscriber.index] = null;
                    this.observers[observerId] = null;
                }
            },

            /**
             * Es desenregistra automàticament de tots esl esdeveniments.
             *
             * Chained before
             */
            _onDestroy: function () {
//                console.log("EventObserver#_onDestroy");
                this.onDestroy();
                this.unregisterFromEvents();
            },

            onDestroy: function () {
//                console.log("EventObserver#_onDestroy");
            },

            // TODO[Xavi] Encara queda una referencia penjada al observer a la llista d'observers. Caldria afegir un sistema per comprovar si els observers associats a aquest event ja no escolten cap event, i en aquest cas eliminar-lo també
            unregisterFromEvent: function (event) {
                //console.log("EventObserver#unregisterFromEvent", event);
                this.events[event] = [];
            }
        });
});