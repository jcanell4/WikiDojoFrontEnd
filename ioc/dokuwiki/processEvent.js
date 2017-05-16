define([
    'ioc/wiki30/dispatcherSingleton',
], function (getDispatcher) {

    var dispatcher = getDispatcher();


    console.log("processEvent Loaded");

    return function(params){
        console.log("processEvent#call", params);

        var eventManager = dispatcher.getEventManager();

        eventManager.fireEvent(params.event, {dataToSend: params.data}, params.id);





        // eventManager.fireEvent(eventManager.eventName.CANCEL, {
        //     id: this.ns,
        //     name: eventManager.eventName.CANCEL,
        //     // dataToSend: "cancel=true"
        // }, this.id);
    };

});

