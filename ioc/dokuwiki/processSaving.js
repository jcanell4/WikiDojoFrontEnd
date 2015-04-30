define([         
    "ioc/wiki30/dispatcherSingleton"
], function(dispatcher){
    var res = function(){
        dispatcher.getChangesManager().resetContentChangeState();
        dw_locktimer.clear();
    };
    return res;
});

