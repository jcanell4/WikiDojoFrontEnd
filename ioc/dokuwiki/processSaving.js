define([
    "ioc/wiki30/dispatcherSingleton"
], function (getDispatcher) {
    var dispatcher = getDispatcher();
    return function () {
        var id = dispatcher.getGlobalState().getCurrentId();

        dispatcher.getChangesManager().resetContentChangeState(id);
        dw_locktimer.clear();
    };
});

