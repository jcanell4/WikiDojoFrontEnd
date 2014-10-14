define([           
    "dojo/ready"
   ,"ioc/dokuwiki/ace-main"
   ,"dijit/registry"
   ,"dojo/dom"
], function(ready, ace, registry, dom){
    
    var res = function(params){
        ready(function(){
            var aceObj;
            var wg = registry.byId(params.buttonId)
            wg.putClickListener(params.key, function(){
                if(aceObj.dokuWrapper.get_cookie('aceeditor')
                        && aceObj.dokuWrapper.get_cookie('aceeditor') !== 'off'){
                    var textArea = dom.byId(params.textAreaId);
                    textArea.value = aceObj.ace.get_value();
                }
            });
            aceObj = ace();
        });
    };
    return res;
});

