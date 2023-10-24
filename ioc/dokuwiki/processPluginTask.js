/**
* Funció pel pluguin PLUGIN que executa captures d'esdeveniments:
*  - capturar el clics dels botons als forms.
*    els selectors css estan definits a la funció getPluginSelectors
*    del DokuModelAdapter
*
* @author Eduard Latorre
*/
define([
     "dojo/on"
    ,"dojo/dom"
    ,"dojo/query"
    ,"dojo/_base/event"
    ,"dojo/dom-form"
    ,"ioc/wiki30/Request"
], function(on, dom, query,event, domform, Request){
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

        // capturar el clic sobre el botó Baixa i instal·la un nou connector
        var form = query(params.commonSelector);
        var handle = on(form, "input[type=submit]:click", function(e){
            //enviar
            var queryString = "";
            var data = domform.toQuery(this.form);
            data += "&" + this.name + "="+ domform.fieldToObject(this);
            if (data){
              queryString = data;
            }
            requestUpdate.sendRequest(queryString);
            event.stop(e);
            handle.remove();
        });

        // capturar el clic sobre el botons dels plugins
        var form = query(params.pluginsSelector);
        var handle = on(form, "input[type=submit]:click", function(e){
            //enviar
            var queryString = "";
            var data = domform.toQuery(this.form);
            data += "&" + this.name + "="+ domform.fieldToObject(this);
            if (data){
              queryString = data;
            }
            requestUpdate.sendRequest(queryString);
            event.stop(e);
            handle.remove();
        });


    };
    return res;
});
