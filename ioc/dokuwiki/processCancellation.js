define([           
    "ioc/wiki30/dispatcherSingleton"
], function(dispatcher){
    var res = function(){

        dispatcher.getChangesManager().resetDocumentChangeState();

        //TODO[Xavi] Eliminar quan el changesManager estigui complet
        //dispatcher.setUnsavedChangesState(false);
        dw_locktimer.clear();
    };
    return res;
});

