/**
* Funció que torna a cridar la comanda que arriba per paràmetres
* @author Josep Cañellas & Eduard Latorre
*/
define([
    "ioc/wiki30/Request"
], function(Request){
    
    var requestUpdate = new Request();
    
    function sleep(delay) {
        if (delay===undefined || delay<0) delay = 0;
        return new Promise((resolve) => setTimeout(resolve, delay));
    }

    var res = function(params){
        requestUpdate.urlBase = params.urlBase;
        if (params.method && params.method.toLowerCase()==="post"){
            requestUpdate.method = "post";
            requestUpdate.getPostData = function(){
                return params.data;
            };
        }else{
            requestUpdate.method="get";
        }
        if (params.query){
            requestUpdate.query = params.query;
        }
        sleep(params.delay).then(function() {
            requestUpdate.sendRequest();
        });
    };
    return res;
    
});
