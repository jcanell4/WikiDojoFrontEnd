define([
    'dojo/_base/declare',
    "dojo/_base/array",
    "ioc/wiki30/manager/EventFactory",
    "dojo/_base/lang"
], function (declare, dojoArray, EventFactory, lang) {
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
         * @class EventObservable
         * @author Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            
            "-chains-": {
                _onDestroy: "before"
            },

            eventName: EventFactory.eventName,

            callbacks: {},
            fireEvents: {},

            constructor: function (params) {
                this.callbacks = {};
                this.fireEvents = {};
                declare.safeMixin(this, params);
            },
            
            setFireEventHandler: function(eventName, handler, preventGlobalpropagation ){
                this.fireEvents[eventName] = {
                    handler:handler.bind(this),
                    preventGlobalPropagation: preventGlobalpropagation
                };
            },

            registerObserverToEvent: function (observer, event, callback) {
                console.log("RegisteredObserverToEvent:", observer, event);
                if(!observer.id){
                    observer.id = (new Date()).getTime();
                }
                if(!this.id){
                    this.id = (new Date()).getTime();
                }
                observer.addObservable(this.id, this);
                
                if(!this.callbacks[event]){
                    this.callbacks[event]={}
                }
                if(!this.callbacks[event][observer.id]){
                    this.callbacks[event][observer.id]={observer:observer, callbacks:[]}
                }
//                this.callbacks[event].push({observerId:observer.id, callback:callback, observer:observer});
                this.callbacks[event][observer.id].callbacks.push(callback);
            },

            unregisterObserver: function (id) {
                var toDelete = [];
                for (var eName in this.callbacks) {                    
                    for (var key in this.callbacks[eName]) {                    
                        if(key === id){
                            toDelete.push({"event":eName, "key":key});
                        }
                    }
                }
                
                for(var i=0; i<toDelete.length; i++){
                    delete this.callbacks[toDelete[i].event][toDelete[i].key];
                }
            },

            unregisterEventForObserver: function (id, eName) {
                var toDelete = [];
                for (var key in this.callbacks[eName]) {                    
                    if(key === id){
                        toDelete.push(key);
                    }
                }
                
                for(var i=0; i<toDelete.length; i++){
                    delete this.callbacks[eName][toDelete[i]];
                }
            },
            
            fireEvent: function(eventName, dataEventBase, preventGlobalProp){
                console.log("EventObservable#fireEvent: ", eventName, dataEventBase);
                var eventData,
                        fireEventFunc = this.fireEvents[eventName];
                if(fireEventFunc){
                    eventData=fireEventFunc.handler(dataEventBase);
                    if(typeof preventGlobalProp === "undefined"){
                        preventGlobalProp = fireEventFunc.preventGlobalPropagation;
                    }
                }else if(dataEventBase){
                    eventData = dataEventBase;
                }else{
                    eventData={};
                }
                this.dispatchEvent(eventName, eventData, !preventGlobalProp);
            },
            
            dispatchEvent: function (event, eventData, globalPropagation) {
                // console.log("EventObservable#dispatchEvent: ", event, eventData);
                var callbacks;
                

                if (eventData._cancel) {
                    // console.warn("S'ha cancel·lat l'event");
                } else {
                    eventData.name = event;
                    callbacks = this.callbacks[eventData.name];


                    if (callbacks) {
                        for(var key in callbacks){
                            for(var i=0; callbacks[key] && i<callbacks[key].callbacks.length; i++){
                                callbacks[key].callbacks[i](eventData);
                            }
                        }
                    }

                    if(globalPropagation
                        && (this.eventManager || this.dispatcher)){
                        if(!this.eventManager){
                            this.eventManager=this.dispatcher.getEventManager();
                        }
                        this.eventManager._dispatchEvent(event, eventData);
                    }
                }


            },
            
             _onDestroy: function () {
//                console.log("EventObserver#onDestroy");
                this._removeMeInObservers();
            },

            _removeMeInObservers: function () {
                var toRemove= [];
                for (var eName in this.callbacks) {                    
                    for (var key in this.callbacks[eName]) {                    
                        toRemove[key]=this.callbacks[eName][key].observer;
                    }
                }
                
                for(var key in toRemove){
                    toRemove[key].removeObservable(this.id);
                }
            }
        });
});