define([
    'dojo/_base/declare',
    'dojo/_base/array',
    "ioc/wiki30/manager/EventFactory",
    'dojo/Stateful'
], function (declare, dojoArray, EventFactory, Stateful) {
    return declare([Stateful],
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
            eventName: EventFactory.eventName,

//            // Constants/Enum TODO[Xavi] Substituir totes les cadenes per this.event.QUELCOM de manera que no hi hagi errors
//            eventNameCompound: {
//                CANCEL: 'cancel_',
//                LOCK: 'lock_',
//                UNLOCK: 'unlock_',
//                DOCUMENT_CHANGED: 'document_changed_',
//                DOCUMENT_REFRESHED: 'document_refreshed_',
//                SAVE_PARTIAL: 'save_partial_',
//                CANCEL_PARTIAL: 'cancel_partial_',
//                EDIT_PARTIAL: 'edit_partial_',
//                SAVE: 'save_'
//            },


            "-chains-": {
                _onDestroy: "before"/*,
                onUnload: "before" //AQUÍ NO hi ha onUnload??????
                */
            },

//            /** @type {{string?: function[]}} @private */
//            events: {},
//
//            /** @type EventObserver[] @private */
//            observers: [],
//
//            /**
//             * @type {{observed: EventObserver, id: int}[]} indentificador propi dels events als que està subscrit
//             * @private
//             */
//            registeredToEvents: [],

            constructor: function (params) {
                ///================================///
                this.observables = {};
                ///===============================///
                declare.safeMixin(this, params);

//                this.registeredToEvents = [];
//                this.events = {};
//                this.observers = [];
            },

//            /**
//             * Es registra al esdeveniment i respón amb la funció passada com argument quan es escoltat.
//             *
//             * Es guarda la referencia obtinguda al registrar-lo per poder desenregistrar-se quan sigui
//             * necessari.
//             *
//             * @param {EventObserver} observer - observador al que ens enregistrem
//             * @param {string} event - nom del esdeveniment
//             * @param {function} callback - funció a executar
//             */
//
//            registerToEvent: function (observer, event, callback) {
//                var reference = {
//                    "observed": observer,
//                    "id": observer.registerObserverToEvent(event, callback)
//                };
//                this.registeredToEvents.push(reference);
//
//                //console.log("EventObserver#registerToEvent", event, reference);
//            },
//
//            /**
//             * Recorre la lista de esdeveniments al que està subscrit i es desenregistra de tots. Això s'ha de cridar
//             * abans d'eliminar l'objecte.
//             */
//            unregisterFromEvents: function () {
//                //console.log("EventObserver#unregisterFromEvents", this.registeredToEvents);
//                var observed, id;
//
//                for (var i = 0, len = this.registeredToEvents.length; i < len; i++) {
//
//                    observed = this.registeredToEvents[i]['observed'];
//                    id = this.registeredToEvents[i]['id'];
//                    observed.unregister(id);
//                }
//
//                this.registeredToEvents = [];
//            },
//
//            /**
//             * Dispara l'esdeveniment cridant cadascunta de les funcions dels observadors enregistrats amb les dades
//             * passades com argument.
//             *
//             * @param {string} event - Nom del esdeveniment
//             * @param {*} data - Dades a passar a les funcions dels observadors
//             */
//            dispatchEvent: function (event, p1, p2) {
//                //console.log("EventObserver#dispatchEvent: ", event, data);
//                var data, eventName, observers;
//                
//                if(typeof p1 === "string"){ //NameCompound
//                    eventName=event.concat("_",p1);
//                    data = p2;
//                }else{
//                    eventName=event;
//                    data = p1;
//                }
//                
//
//                data.name = eventName;
//                observers = this.events[data.name];
//                
//                if (observers) {
//                    dojoArray.forEach(observers, function (callback) {
//                        if (callback) {
//                            callback(data);
//                        }
//                    });
//                }
//            },
//
//            /**
//             * Registra la funció al esdeveniment amb el nom passat com argument.
//             *
//             * @param {string} event - Nom del esdeveniment que llençarà la funció.
//             * @param {function} callback - Funció que es cridarà al disparar-se el esdeveniment.
//             * @returns {int} - Id de referencia per poder desenregistrar-se
//             * @protected
//             */
//            registerObserverToEvent: function (event, callback) {
//                var index,
//                    observer;
//
//                if (!Array.isArray(this.events[event])) {
//                    this.events[event] = [];
//                }
//
//                index = this.events[event].push(callback) - 1;
//                observer = {event: event, index: index};
//
//                return this.observers.push(observer) - 1;
//            },
//
//            /**
//             * Alliberem els objectes però no els esborrem per no alterar la correspondencia dels index de al resta dels
//             * subscriptors
//             *
//             * @param {int} observerId - Identificador del event observat
//             */
//            unregister: function (observerId) {
//                var subscriber = this.observers[observerId];
//
//                if (subscriber !== null) {
//                    this.events[subscriber.event][subscriber.index] = null;
//                    this.observers[observerId] = null;
//                }
//            },
//
//            /**
//             * Es desenregistra automàticament de tots esl esdeveniments.
//             *
//             * Chained before
//             */
//            _onDestroy: function () {
////                console.log("EventObserver#_onDestroy");
//                this.onDestroy();
//                this.unregisterFromEvents();
//            },
//
//            onDestroy: function () {
////                console.log("EventObserver#_onDestroy");
//            },
//
//            // TODO[Xavi] Encara queda una referencia penjada al observer a la llista d'observers. Caldria afegir un sistema per comprovar si els observers associats a aquest event ja no escolten cap event, i en aquest cas eliminar-lo també
//            unregisterFromEvent: function (event) {
//                //console.log("EventObserver#unregisterFromEvent", event);
//                this.events[event] = [];
//            }
            
            ///============================================================///
                      
            observables:[],  

            registerMeToEventFromObservable: function (observable, event, callback) {
                observable.registerObserverToEvent(this, event, callback);
            },


            addObservable: function(observableId, observable){
                this.observables[observableId] = observable;
            },
            
            removeObservable: function(observableId){
                delete this.observables[observableId];
            },
            
            /**
             * Es desenregistra automàticament de tots esl esdeveniments.
             *
             * Chained before
             */
            _onDestroy: function () {
//                console.log("EventObserver#_onDestroy");
                this._unregisterFromObservables();
            },

            _unregisterFromObservables: function () {
                for(var key in this.observables){
                    this.observables[key].unregisterObserver(this.id);
                }
            }
            
        });
});
