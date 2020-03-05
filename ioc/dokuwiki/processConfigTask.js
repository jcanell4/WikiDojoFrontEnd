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

        var enviar = function(e){
            var queryString = "";
            var data = this.name + "="+ domform.fieldToObject(this);
            if (data){
                queryString = data;
            }
            var data = domform.toObject(this.form);
            requestUpdate.getPostData = function () {
                return data;
            };
            event.stop(e);
            requestUpdate.sendRequest(queryString);
            handle.remove();
        };

        // capturar el clic sobre el botó Desa
        var form = query(params.configSelector);
        var handle = on(form, "input[type=submit]:click", enviar);
        var handle = on(form, "button[name=submit]:click", enviar);
    };
    return res;
});
