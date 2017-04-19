define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver',
    'ioc/wiki30/manager/EventObservable',
    "dijit/registry" 

], function (declare, EventObserver, EventObservable, registry) {
    return declare([EventObservable, EventObserver], {

        _resolveObservable: function(pObservable){
            var observable;
            if(typeof pObservable === "string"){
                observable = this.observables[pObservable];
                if(!observable){
                    observable = registry.byId(pObservable);                
                }
            }else{
                observable = pObservable;
            }
            return observable;
        },

        fireEventFromObservable: function(eventName, eventExtraData, pObservable){
            var observable = this._resolveObservable(pObservable);
                observable.fireEvent(eventName, eventExtraData);
        },
        
        _fireEventFromObservable: function(eventName, eventExtraData, observable){
                observable.fireEvent(eventName, eventExtraData);
        },
        
        fireEvent: function(eventName, eventExtraData, pObservable){
            var observable = this._resolveObservable(pObservable);
            if(observable){
                this._fireEventFromObservable(eventName, eventExtraData, observable)
            }else{
                this._dispatchEvent(eventName, eventExtraData);
            }
        },
        
        addObservable: function(id, observable){
            this.inherited(arguments);
            return this;
        },
 
        dispatchEvent: null,
        
        _dispatchEvent: function (event, eventData) {
            console.log("EventManager#dispatchEvent: ", event, eventData);
            var callbacks;

            eventData.name = event;
            callbacks = this.callbacks[eventData.name];

            if (callbacks) {
                for(var key in callbacks){
                    for(var i=0; i<callbacks[key].callbacks.length; i++){
                        console.log("avisant a: ", key, "amb", eventData);
                        callbacks[key].callbacks[i](eventData);
                    }
                }
            }

        },
    });
});
