define([         
    "ioc/wiki30/dispatcherSingleton"
], function(dispatcher){
    var res = function(){
        dispatcher.getChangesManager().setDocument();
        dw_locktimer.clear();
    };
    return res;
});

