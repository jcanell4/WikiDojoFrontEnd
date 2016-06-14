define(function(){
    var res = function(){
        dw_locktimer.clear();
    };
    return res;
});

/* OLD *///[JOSEP] Analitzar quin desl dos codis és el correcte!
//define([
//    'ioc/wiki30/dispatcherSingleton',
//], function (getDispatcher) {
//
//    var dispatcher = getDispatcher(),
//        draftManager = dispatcher.getDraftManager();
//
//
//    return function (params) {
//        //console.log("processCancellation", params);
//        draftManager.clearDraft(params.id);
//
//        //dw_locktimer.clear();
//    };
//});

