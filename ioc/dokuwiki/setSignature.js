define(["dojo/_base/lang"], function(lang){
    var res = function(params){
        var value='';
        if(params){
            if(lang.isString(params)){
                value = params;
            }else if(lang.isObject(params)){
                value = params.value;
            }else if(lang.isArray(params)){
                value = params[0];
            }
        }
        window.SIG = value;
    };
    return res;
});


