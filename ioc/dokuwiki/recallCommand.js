/**
* Funció que torna a creidar la comanda que arriba per paràmetres
* @author Josep Cañellas & Eduard Latorre
*/
define([
    "ioc/wiki30/Request"
], function(Request){
    var requestUpdate = new Request();
//    requestUpdate.updateSectok=function(sk){
//            this.sectok=sk;
//    };
//    requestUpdate.sectok = requestUpdate.dispatcher.getSectok();
//    requestUpdate.dispatcher.toUpdateSectok.push(requestUpdate);


    var res = function(params){

        requestUpdate.urlBase=params.urlBase;
        if(params.method && params.method.toLowerCase()=="post"){
            requestUpdate.method="post";
            requestUpdate.getPostData = function(){
                return params.data
            }
        }else{
            requestUpdate.method="get";
        }
        if(params.query){
            requestUpdate.query = params.query;
        }
        requestUpdate.sendRequest();
    };
    return res;
});
