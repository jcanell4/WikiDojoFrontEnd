define([
     "dojo/on"
    ,"dojo/dom"
    ,"dojo/_base/event"
    ,"ioc/dokuwiki/listHeadings"
    ,"ioc/dokuwiki/runRender"
    ,"ioc/dokuwiki/runQuiz" 
    ,"ioc/wiki30/Request"
    ,"ioc/wiki30/dispatcherSingleton"
    ,"dojo/dom-attr"
], function(on, dom, event, listHeadings, runRender, runQuiz,
                Request, dispatcher, att){

    return function (id, params) {

        listHeadings(id);
        runRender(id);
        runQuiz(id);

        var domNode = dom.byId(id);
        var requestEdita = new Request();
        requestEdita.updateSectok = function (sk) {
            this.sectok = sk;
        };
        requestEdita.sectok = requestEdita.dispatcher.getSectok();
        requestEdita.dispatcher.toUpdateSectok.push(requestEdita);
        requestEdita.urlBase = params.editCommand;


        var requestImgDetail = new Request();
        requestImgDetail.updateSectok = function (sk) {
            this.sectok = sk;
        };
        requestImgDetail.sectok = requestImgDetail.dispatcher.getSectok();
        requestImgDetail.dispatcher.toUpdateSectok.push(requestImgDetail);
        requestImgDetail.urlBase = params.detailCommand;

        on(domNode, 'div.imgb a.media:click, div.iocfigure a.media:click', function (e) {
            var query = "";
            var arr = att.get(this, "href").split("?");
            if (arr.length > 1) {
                query = arr[1];
            }
            requestImgDetail.sendRequest(query);
            event.stop(e);
        });

    };
});



