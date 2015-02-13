/* class processAclTask
Executa dues captures d'esdeveniments:
  - captura la manipulació de l'arbre
    executar mètode init() de l'objecte dw_acl.
  - capturar el clic sobre el botó.
de dojo. Mira el processContentPage, de la linia 50 a la 110
 està ple de captures.
  Fixa't com fa el tractament pel node dom que es passa
   per paràmetre (el dom central de la pestanya corresponent),
    com selecciona un subnode i un esdeveniment associat a aquest
     i com li passa una funció que cal executar quan s'activi l'esdevenment.

  El que tu hauràs de fer és semblant al que es fa a la
  línia 50-69 del perocessContentPage.
  doncs has de capturar el submit dels formularis de la tasca
   i redirigir-los a les comandes ajax rebudes
    per paràmetre (urlbaseSelecciona i urlBaseActualitza respectivament).
*/

define([
     "dojo/on"
    ,"dojo/dom"
    ,"dojo/_base/event"
    ,"dojo/dom-form"
    ,"ioc/dokuwiki/listHeadings"
    ,"ioc/dokuwiki/runRender"
    ,"ioc/dokuwiki/runQuiz"
    ,"ioc/wiki30/Request"
    ,"ioc/dokuwiki/dwPageUi"
    ,"dojo/dom-class"
    ,"ioc/wiki30/dispatcherSingleton"
    ,"dojo/dom-attr"
], function(on, dom, event, domform, listHeadings, runRender, runQuiz,
                Request, dwPageUi, domClass, dispatcher, att){


    var res = function(id, params){
      // captura la manipulació de l'arbre
      dw_acl.init();

      // capturar el clic sobre el botó Actualitzar
      var domNode = dom.byId(id);
        var requestEdita = new Request();
        requestEdita.updateSectok=function(sk){
            this.sectok=sk;
        };
        requestEdita.sectok = requestEdita.dispatcher.getSectok();
        requestEdita.dispatcher.toUpdateSectok.push(requestEdita);
        requestEdita.urlBase=params.editCommand;


        on(domNode, "#acl__detail input[type=submit]:click", function(e){
          alert("hola");
        });

        //on(domNode, "#acl_manager input[name='cmd[update]']:click", function(e){
        //  alert("hola2");
        //});


        on(domNode, "#acl__detail form:click", function(e){
            //enviar
            var query = "";
            var data;
            data = domform.toQuery(this);
            if (data){
                query = data;
            }
            requestEdita.sendRequest(query);
            event.stop(e);
        });

        // capturar el clic sobre el botó Actualitzar
        on(domNode, "#acl__user input[type=submit]:click", function(e){
            //enviar
            var query = "";
            var data;
            data = domform.toQuery(this);
            if (data){
                query = data;
            }
            requestEdita.sendRequest(query);
            event.stop(e);
        });


    };
    return res;
});
