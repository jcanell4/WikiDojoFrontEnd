define([], function(){
    var res = function(params){
        var toolbar = window[params.varName];
        if(toolbar && params.toolbarId && params.wikiTextId){
            //initToolbar('tool__bar','wiki__text', toolbar);
            initToolbar(params.toolbarId,params.wikiTextId, toolbar);
            jQuery('#'+params.toolbarId).attr('role', 'toolbar');
        }
    };
    return res;
});

