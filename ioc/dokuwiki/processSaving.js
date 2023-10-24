define([
    "ioc/wiki30/dispatcherSingleton"
], function (getDispatcher) {
    return function () {
        var dispatcher = getDispatcher();
        var id = dispatcher.getGlobalState().getCurrentId();

        dispatcher.getChangesManager().resetContentChangeState(id);
        dw_locktimer.clear();
    };
});

