define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver',
    'ioc/wiki30/manager/EventObservable',
    "dijit/registry" 

], function (declare, EventObserver, EventObservable, registry) {
    return declare([EventObservable, EventObserver], {
        

//        // El manager ha d'escoltar al content tool
//        // quan detecta que es despatxa l'esdeveniment el dispara en si mateix per avisar als interessats
//        registerEventForBroadcasting: function (observed, eventName, callback) {
//            //console.log("registered for Broadcasting", observed.id, eventName);
//
//            // ens enregistrem al esdeveniment del observed
//            this.registerToEvent(observed, eventName, this._broadcast.bind(this));
//
//            // enregistrem al observed per rebre les notificacions des del manager automàticament
//            observed.registerToEvent(this, eventName, callback);
//
//        },
//
//
//        _broadcast: function (data) {
//            //console.log("EventManager#broadcast", data.name, data);
//            this.dispatchEvent(data.name, data);
//        },
        
        
        ///=============================================///
        
//        eventName: EventFactory.eventName,
//
//        callbacks: [],
//        callbacksFromObservable: [],
//        
//        constructor: function (params) {
//            this.callbacks = [];
//            this.fireEvents = [];
//            declare.safeMixin(this, params);
//        },
//
//        _registerObserverToEvent: function (observer, event, callback, list) {
//            if(!observer.id){
//                observer.id = (new Date()).getTime();
//            }
//            if(!this.id){
//                this.id = (new Date()).getTime();
//            }
//            observer.addObservable(this.id, this);
//
//            if(!list[event]){
//                list[event]=[]
//            }
////            list[event].push({observerId:observer.id, callback:callback});
//            list[event][observer.id]={callback:callback, observer:observer};
//
//        },
//
//        registerObserverToGlobalEvent: function (observer, event, callback) {
//            this._registerObserverToEvent(observer, event, callback, this.callbacks);
//        },
//
//        registerObserverToGlobalEvent: function (observer, event, callback) {
//            this._registerObserverToEvent(observer, event, callback, this.callbacks);
//        },
//
//        registerObserverToLocalEvent: function(observer, event, callback){
//            this._registerObserverToEvent(observer, event, callback, this.callbacksFromObservable);
//        },
//        
//        unregisterObserver: function (id) {
//            var observed, id;
//
//            var toDelete = [];
//            for (var eName in this.callbacks) {                    
//                for (var key in this.callbacks[eName]) {                    
//                    if(key === id){
//                        toDelete.push({"event":eName, "key":key});
//                    }
//                }
//            }
//
//            for(var i=0; i<toDelete.length; i++){
//                delete this.callbacks[toDelete[i].event][toDelete[i].key];
//            }
//            
////            toDelete = [];
////            for (var eName in this.callbacksFromObservable) {                    
////                for (var key in this.callbacksFromObservable[eName]) {                    
////                    if(key === id){
////                        toDelete.push({"event":eName, "pos":key});
////                    }
////                }
////            }
////
////            for(var i=0; i<toDelete.length; i++){
////                delete this.callbacksFromObservable[toDelete[i].event][toDelete[i].key];
////            }
//        },

        fireEventFromObservable: function(eventName, eventExtraData, pObservable){
            var ret=false;
            var observable;
            if(typeof pObservable === "string"){
                observable = registry.byId(pObservable);
            }else{
                observable = pObservable;
            }
            if(observable){
                observable.fireEvent(eventName, eventExtraData);
                ret = true;
            }
            return ret;
        },
        
        fireEvent: function(eventName, eventExtraData, pObservable){
            if(!this.fireEventFromObservable(eventName, eventExtraData, pObservable)){
                this.dispatchEvent(eventName, eventExtraData);
            }
        },
 
        dispatchEvent: null,
        
        _dispatchEvent: function (event, eventData) {
            //console.log("EventObserver#dispatchEvent: ", event, data);
            var callbacks;

            eventData.name = event;
            callbacks = this.callbacks[eventData.name];

            if (callbacks) {
                for(var key in callbacks){
                    callbacks[key].callback(eventData);
                }
            }
        },
        
//        dispatchEventFromObservable: function(eventName, eventData){
//            var callbacks;
//
//            eventData.name = eventName;
//            callbacks = this.callbacksFromObservable[eventData.name];
//
//            if (callbacks) {
//                for(var key in callbacks){
//                    callbacks[key].callback(eventData);
//                }
//            }
//        },
        
//        dispatchEvent: function(eventName, eventData){
//            var callbacks;
//
//            eventData.name = eventName;
//            callbacks = this.callbacks[eventData.name];
//
//            if (callbacks) {
//                for(var key in callbacks){
//                    callbacks[key].callback(eventData);
//                }
//            }
//        }
    });
});
