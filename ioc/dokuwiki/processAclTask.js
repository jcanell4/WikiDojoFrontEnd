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
    ,"dojo/query"
    ,"dojo/_base/event"
    ,"dojo/dom-form"
    ,"ioc/wiki30/Request"
], function(on, query, event, domform, Request){
    
    var requestUpdateAcl = new Request();

    var res = function(id, params){
        // captura la manipulació de l'arbre
        dw_acl.init();

        requestUpdateAcl.urlBase=params.urlBase;

        // capturar el clic sobre el botó Desa/Actualitza/Suprimeix
        var form = query(params.saveSelector);
        var fDesa = function(objThis, e){
            //enviar
            var queryString = domform.toQuery(objThis.form);
            queryString += "&" + objThis.name + "=" + domform.fieldToObject(objThis);
            if(params.standbyId){
                requestUpdateAcl.setStandbyId(params.standbyId);
            }
            requestUpdateAcl.sendRequest(queryString);
            event.stop(e);
        };
        var handle1 = on(form, "input[type=submit]:click", function(e){
            fDesa(this, e);
            handle1.remove();
        });
        var handle2 = on(form, "button[type=submit]:click", function(e){
            fDesa(this, e);
            handle2.remove();
        });

        // capturar el clic sobre el botó Actualitzar a la graella
        var form = query(params.updateSelector);
        var fACtualitzar = function(objThis, e){
            //enviar
            var data = objThis.name + "=" + domform.fieldToObject(objThis);
            if(params.standbyId){
                requestUpdateAcl.setStandbyId(params.standbyId);
            }
            requestUpdateAcl.sendForm(objThis.form, data);
            event.stop(e);
        };
        var handle3 = on(form, "input[type=submit]:click", function(e){
            fACtualitzar(this, e);
            handle3.remove();
        });
        var handle4 = on(form, "button[type=submit]:click", function(e){
            fACtualitzar(this, e);
            handle4.remove();
        });
    };
    
    return res;
});