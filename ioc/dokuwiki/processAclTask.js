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

    var res = function(id, params){
        // captura la manipulació de l'arbre
        dw_acl.init();

        requestUpdateAcl.urlBase=params.urlBase;

        // capturar el clic sobre el botó Desa/Actualitza/Suprimeix
        var form = query(params.saveSelector);
        var fDesa = function(e){
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
        };
        var handle = on(form, "input[type=submit]:click", fDesa);
        var handle = on(form, "button[type=submit]:click", fDesa);

        // capturar el clic sobre el botó Actualitzar a la graella
        var form = query(params.updateSelector);
        var fACtualitzar = function(e){
            //enviar
            var data = this.name + "="+ domform.fieldToObject(this);
            requestUpdateAcl.sendForm(this.form, data);
            event.stop(e);
            handle.remove();
        };
        var handle = on(form, "input[type=submit]:click", fACtualitzar);
        var handle = on(form, "button[type=submit]:click", fACtualitzar);
    };
    
    return res;
});