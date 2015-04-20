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
    requestUpdate.updateSectok=function(sk){
            this.sectok=sk;
    };
    requestUpdate.sectok = requestUpdate.dispatcher.getSectok();
    requestUpdate.dispatcher.toUpdateSectok.push(requestUpdate);


    var res = function(id, params){

        var domNode = dom.byId(id);
        requestUpdate.urlBase=params.urlBase;

        // capturar el clic sobre el botons
        var forms = query(params.formsSelector);
        for (var i = 0; i < forms.length; i++) {
            var handle = on(forms[i], "input[name*=fn]:click", function(e){
                //enviar
                // el botó ExportCSV no passa per Ajax
                if (this.name !== params.exportCsvName) {
                    requestUpdate.sendForm(
                            this.form,
                            this.name + "="+ domform.fieldToObject(this)
                    );
                    event.stop(e);
                    handle.remove();
                }   
            });

            // capturar el clic sobre els enllaços dels usuaris <a>
            var handle = on(forms[i], "tr.user_info a:click", function(e){
            //enviar
            var uri = this.href;
            var queryString = uri.substring(uri.indexOf("?") + 1, uri.length);
            queryString = "call=admin_task&" + queryString + "&sectok=" + requestUpdate.sectok;
            
            requestUpdate.sendRequest(queryString);
            event.stop(e);
        });
            
        };

    };
    return res;
});
