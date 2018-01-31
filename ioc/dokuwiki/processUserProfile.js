/**
* Funció pel pluguin PLUGIN que executa captures d'esdeveniments:
*  - capturar el clics dels botons als forms.
*    els selectors css estan definits a la funció getPluginSelectors
*    del DokuModelAdapter
* @authors Eduard Latorre, Rafael
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

        requestUpdate.urlBase=params.urlBase;

        // capturar el clic sobre el botó Baixa i instal·la un nou connector
        var forms = query(params.formsSelector, id);
        for (var i = 0; i < forms.length; i++) {
            var handle = on(forms[i], "input[type=submit]:click", function(e){
                //enviar
                var queryString = domform.toQuery(this.form);
                if (!queryString) 
                    queryString = "";
                else {
                    queryString += "&user="+params.user;
                    queryString += "&" + this.name + "=submit";
                }
                
                requestUpdate.sendRequest(queryString);
                event.stop(e);
                handle.remove();
            });
        };

    };
    return res;
});
