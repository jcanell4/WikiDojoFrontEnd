/**
* Funció pel pluguin REVERT que executa captures d'esdeveniments:
*  - capturar el clics dels botons als forms.
*    els selectors css estan definits a la funció getConfigSelectors
*    del DokuModelAdapter
*
* @author Eduardo Latorre Jarque <eduardo.latorre@gmail.com>
*/
define([
     "dojo/on"
    ,"dojo/dom"
    ,"dojo/query"
    ,"dojo/_base/event"
    ,"dojo/dom-form"
    ,"ioc/wiki30/Request"
], function(on, dom, query, event, domform, Request){
    var requestUpdate = new Request();
//    requestUpdate.updateSectok=function(sk){
//            this.sectok=sk;
//    };
//    requestUpdate.sectok = requestUpdate.dispatcher.getSectok();
//    requestUpdate.dispatcher.toUpdateSectok.push(requestUpdate);


    var res = function(id, params){

        var domNode = dom.byId(id);
        requestUpdate.urlBase=params.urlBase;
        if(params.standbyId){
            requestUpdate.setStandbyId(params.standbyId);
        }else{
            requestUpdate.setStandbyId(id);
        }

        // capturar el clic sobre el botó Cerca
        var form = query(params.revertSelector);
        var handle1 = on(form, "input[type=submit]:click", function(e){
            //enviar
            var queryString = "call=admin_task&do=admin&page=revert"; 
            
            var data = domform.toObject(this.form);
            requestUpdate.getPostData = function () {
                return data;
            };
            requestUpdate.sendRequest(queryString);
            event.stop(e);
            handle1.remove();
        });

        // capturar el clic sobre els enllaços <a>
        var handle2 = on(form, "a:click", function(e){
            //enviar
            var uri = this.href;
            var queryString = uri.substring(uri.indexOf("?") + 1, uri.length);
            queryString = "call=page&" + queryString /*+ "&sectok=" + requestUpdate.getSectok()*/;
            
            requestUpdate.sendRequest(queryString);
            event.stop(e);
        });


    };
    return res;
});
