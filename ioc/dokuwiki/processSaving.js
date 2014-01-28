define([           
    "ioc/wiki30/dispatcherSingleton"
], function(dispatcher){
    var res = function(){
        window.textChanged=false;
        dispatcher.setUnsavedChangesState(false);
        dw_locktimer.clear();
    };
    return res;
});

