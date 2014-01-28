define([
     "dojo/on"
    ,"dojo/dom"
    ,"dojo/_base/event"
    ,"dojo/dom-form"
    ,"ioc/dokuwiki/listHeadings"
    ,"ioc/dokuwiki/runRender"
    ,"ioc/dokuwiki/runQuiz" 
    ,"ioc/wiki30/Request"
], function(on, dom, event, domform, listHeadings, runRender, runQuiz, 
                Request){
    var res = function(id, params){
        //JSINFO.id=params.ns;
        listHeadings(id);
        runRender(id);   
        runQuiz();
        
        var domNode = dom.byId(id);
        var request = new Request();
        request.updateSectok=function(sk){
            this.sectok=sk;
        };
        request.sectok = request.dispatcher.getSectok();
        request.dispatcher.toUpdateSectok.push(request);
        request.urlBase=params.command;
        
        on(domNode, "form.btn_secedit:submit", function(e){
            //enviar  
            var query = "";
            var data;
            data = domform.toQuery(this);
            if (data){
                query = data;
            }
            request.sendRequest(query);
            event.stop(e);
        });
        
        dw_page.sectionHighlight();
    };
    return res;
});



