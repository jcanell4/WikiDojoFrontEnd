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
    ,"dojo/_base/event"
    ,"dojo/dom-form"
    ,"ioc/wiki30/Request"
], function(on, dom, event, domform, Request){


    var res = function(id, params){
      // captura la manipulació de l'arbre
      dw_acl.init();

      var domNode = dom.byId(id);
        var requestUpdateAcl = new Request();
        requestUpdateAcl.updateSectok=function(sk){
            this.sectok=sk;
        };
        requestUpdateAcl.sectok = requestUpdateAcl.dispatcher.getSectok();
        requestUpdateAcl.dispatcher.toUpdateSectok.push(requestUpdateAcl);


        // capturar el clic sobre el botó Desa
        on(domNode, params.saveSelector, function(e){
            requestUpdateAcl.urlBase=params.urlBaseDesa;
            //enviar
            var query = "";
            var data;
            data = domform.toQuery(this);
            if (data){
                query = data;
            }
            requestUpdateAcl.sendRequest(query);
            event.stop(e);
        });

        // capturar el clic sobre el botó Actualitzar
        on(domNode, params.updateSelector, function(e){
            requestUpdateAcl.urlBase=params.urlBaseActualiza;
            //enviar
            var query = "";
            var data;
            data = domform.toQuery(this);
            if (data){
                query = data;
            }
            requestUpdateAcl.sendRequest(query);
            event.stop(e);
        });


    };
    return res;
});
