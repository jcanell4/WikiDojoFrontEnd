define([
    'ioc/wiki30/dispatcherSingleton'
], function (getDispatcher) {

    var dispatcher = getDispatcher();

    return function(param){
        // ALERTA[Xavi] Pendent de determinar si hi ha algun cas en que le pestanya no estigui carregada i cal controlar-lo
        var cache = dispatcher.getContentCache(param.id);
        
        var contentTool = cache.getMainContentTool();
        
        contentTool.removeContentTool(param.idToShow);
    };

});

