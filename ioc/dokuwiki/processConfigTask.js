/**
* Funció pel pluguin CONFIG que executa captures d'esdeveniments:
*  - capturar el clics dels botons als forms.
*    els selectors css estan definits a la funció getConfigSelectors
*    del DokuModelAdapter
*
* @author Eduardo Latorre Jarque <eduardo.latorre@gmail.com>
*/
define([
     "dojo/on"
    ,"dojo/query"
    ,"dojo/_base/event"
    ,"dojo/dom-form"
    ,"ioc/wiki30/Request"
], function(on, query, event, domform, Request){

    var requestUpdate = new Request();

    var res = function(id, params){
        requestUpdate.urlBase = params.urlBase;
        if(params.standbyId){
            requestUpdate.setStandbyId(params.standbyId);
        }else{
            requestUpdate.setStandbyId(id);
        }

        var enviar = function(objThis, e){
            var queryString = "";
            var data = objThis.name + "="+ domform.fieldToObject(objThis);
            if (data){
                queryString = data;
            }
            var data = domform.toObject(objThis.form);
            requestUpdate.getPostData = function () {
                return data;
            };
            event.stop(e);
            requestUpdate.sendRequest(queryString);
        };

        // capturar el clic sobre el botó Desa
        var form = query(params.configSelector);
        var handle1 = on(form, "input[type=submit]:click", function(e){
            enviar(this, e);
            handle1.remove();
        });
        var handle2 = on(form, "button[name=submit]:click", function(e){
            enviar(this, e);
            handle2.remove();
        });
    };
    return res;
});
