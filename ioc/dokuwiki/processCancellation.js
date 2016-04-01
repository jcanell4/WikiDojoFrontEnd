define([
    'ioc/wiki30/dispatcherSingleton',
], function (getDispatcher) {

    var dispatcher = getDispatcher(),
        draftManager = dispatcher.getDraftManager();


    return function (params) {
        //console.log("processCancellation", params);
        draftManager.clearDraft(params.id);

        //dw_locktimer.clear();
    };
});

