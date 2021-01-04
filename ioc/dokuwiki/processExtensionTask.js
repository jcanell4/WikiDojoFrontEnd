/**
 * Funció pel pluguin EXTENSION que executa captures d'esdeveniments:
 *  - capturar els clics dels links i dels botons del form.
 *  Els selectors CSS estan definits a la funció getExtensionSelectors de DokuModelAdapter
*/
define([
     "dojo/on"
    ,"dojo/query"
    ,"dojo/_base/event"
    ,"dojo/dom-attr"
    ,"dojo/dom-form"
    ,"ioc/wiki30/Request"
], function(on, query, event, attr, domform, Request) {
    
    var requestUpdate = new Request();

    var res = function(id, params) {

        requestUpdate.urlBase = params.urlBase;
        if(params.standbyId){
            requestUpdate.setStandbyId(params.standbyId);
        }else{
            requestUpdate.setStandbyId(id);
        }

        // capturar el clic sobre els links
        var links = query(params.hrefSelector);
        var handle1 = on(links, "a:click", function (e) {
            var arr = attr.get(this, "href").split("?");
            var query = (arr.length > 1) ? arr[1] : "";
            requestUpdate.sendRequest(query);
            event.stop(e);
            handle1.remove();
        });

        // capturar el clic sobre el botons dels plugins
        var form = query(params.extensionsSelector);
        var handle2 = on(form, "button[type=submit]:click", function(e){
            var query = domform.toQuery(this.form);
            var q = query.match(/&?sectok=[^&]*/);  //eliminar &sectok=*
            if (q) {query = query.replace(q, "");}
            query += "&" + this.name + "=" + domform.fieldToObject(this);
            requestUpdate.sendRequest(query);
            event.stop(e);
            handle2.remove();
        });

    };
    return res;
});
