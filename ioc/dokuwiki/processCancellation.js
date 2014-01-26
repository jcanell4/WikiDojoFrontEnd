define([           
    "ioc/wiki30/dispatcherSingleton"
    ,"dojo/dom"
    ,"dojo/on"
    ,"dojo/query"
    ,"dijit/focus"
    ,"dojo/ready"
    ,"dojo/dom-geometry"
    ,"dojo/dom-style"
], function(dispatcher, dom, on, query, focus, ready, geometry, style){
    var res = function(){
        window.textChanged=false;
        dispatcher.setUnsavedChangesState(false);
    };
    return res;
});

