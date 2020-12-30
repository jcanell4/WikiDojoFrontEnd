/**
* Funció pel pluguin USERMANAGER que executa captures d'esdeveniments:
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

    var res = function(id, params){

        var domNode = dom.byId(id);
        requestUpdate.urlBase=params.urlBase;
        if(params.standbyId){
            requestUpdate.setStandbyId(params.standbyId);
        }else{
            requestUpdate.setStandbyId(id);
        }

        // capturar el clic sobre el botons
        var forms = query(params.formsSelector);
        var func  = function(objThis, e){
            if (objThis.name !== params.exportCsvName) {
                requestUpdate.sendForm(
                        objThis.form,
                        objThis.name + "="+ domform.fieldToObject(objThis)
                );
                event.stop(e);
            }   
        };
        for (var i = 0; i < forms.length; i++) {
            var handle1 = on(forms[i], "input[name*=fn]:click", function(e){
                func(this, e);
                handle1.remove();
            });
            var handle2 = on(forms[i], "button[name*=fn]:click", function(e){
                func(this, e)
                handle2.remove();
            });

            // capturar el clic sobre els enllaços dels usuaris <a>
            var handle = on(forms[i], "tr.user_info a:click", function(e){
                //enviar
                var uri = this.href;
                var queryString = uri.substring(uri.indexOf("?") + 1, uri.length);
                queryString = "call=admin_task&" + queryString /*+ "&sectok=" + requestUpdate.sectok*/;

                requestUpdate.sendRequest(queryString);
                event.stop(e);
                handle.remove();
            });
        };
    };
    
    return res;
    
});
