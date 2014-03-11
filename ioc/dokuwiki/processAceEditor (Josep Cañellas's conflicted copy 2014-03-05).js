define([           
    "dojo/ready"
    ,"ioc/dokuwiki/ace-main"
], function(ready,  ace){
    
    var res = function(){
        ready(function(){
            ace();
        });
    };
    return res;
});

