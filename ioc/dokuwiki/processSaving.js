define([         
    "ioc/wiki30/dispatcherSingleton"
], function(dispatcher){
    var res = function(){
        //dispatcher.getChangesManager().removeDocumentChanged();

        dispatcher.getChangesManager().resetDocument();
        //dispatcher.setUnsavedChangesState(false);
        dw_locktimer.clear();
    };
    return res;
});

