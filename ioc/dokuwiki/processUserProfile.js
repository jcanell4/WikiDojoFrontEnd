/**
 * Funció per capturar clics de botons als forms.
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

        requestUpdate.urlBase = params.urlBase;

        //captura el clic sobre un botó tipus submit
        var forms = query(params.formsSelector, id);

        var handle = on(forms[0], "input[type=submit]:click", function(e){
            //captura la cadena de text a enviar
            var queryString = domform.toQuery(this.form);
            if (!queryString) {
                queryString = "";
            }else {
                queryString += "&user="+params.user;
                queryString += "&" + this.name + "=submit";
            }

            requestUpdate.sendRequest(queryString);
            event.stop(e);
            handle.remove();
        });

    };
    return res;
});
