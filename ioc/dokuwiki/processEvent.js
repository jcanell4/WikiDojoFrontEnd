define([
    'ioc/wiki30/dispatcherSingleton',
], function (getDispatcher) {

    var dispatcher = getDispatcher();

    return function(params){

        var eventManager = dispatcher.getEventManager();

        eventManager.fireEvent(params.event, params, params.id);

    };

});

