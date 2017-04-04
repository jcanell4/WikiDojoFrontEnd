define([
    'ioc/wiki30/dispatcherSingleton',
], function (getDispatcher) {

    var dispatcher = getDispatcher();

    return function(param){
        console.log("processCloseTab", param);

        var contentTool = dispatcher.getContentCache(param.id).getMainContentTool();
        contentTool.removeContentTool();
    };

});

