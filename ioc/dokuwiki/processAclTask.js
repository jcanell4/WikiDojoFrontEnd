/**
* Funció pel pluguin ACL que executa dues captures d'esdeveniments:
*  - captura la manipulació de l'arbre
*    executar mètode init() de l'objecte dw_acl.
*  - capturar el clics dels botons als forms.
*    els selectors css estan definits a la funció getAclSelectors
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
    var requestUpdateAcl = new Request();
    requestUpdateAcl.updateSectok=function(sk){
            this.sectok=sk;
    };
    requestUpdateAcl.sectok = requestUpdateAcl.dispatcher.getSectok();
    requestUpdateAcl.dispatcher.toUpdateSectok.push(requestUpdateAcl);

    var res = function(id, params){
        // captura la manipulació de l'arbre
        dw_acl.init();

        var domNode = dom.byId(id);
        requestUpdateAcl.urlBase=params.urlBase;

        // capturar el clic sobre el botó Desa/Actualitza/Suprimeix
        var form = query(params.saveSelector);
        var handle = on(form, "input[type=submit]:click", function(e){
            //enviar
            var queryString = "";
            var data = domform.toQuery(this.form);
            data += "&" + this.name + "="+ domform.fieldToObject(this);
            if (data){
              queryString = data;
            }
            requestUpdateAcl.sendRequest(queryString);
            event.stop(e);
            handle.remove();
        });

        // capturar el clic sobre el botó Actualitzar a la graella
        var form = query(params.updateSelector);
        var handle = on(form, "input[type=submit]:click", function(e){
            //enviar
            var queryString = "";
            var data = domform.toQuery(this.form);
            data += "&" + this.name + "="+ domform.fieldToObject(this);
            if (data){
              queryString = data;
            }
            requestUpdateAcl.sendRequest(queryString);
            event.stop(e);
            handle.remove();
        });


    };
    return res;
});