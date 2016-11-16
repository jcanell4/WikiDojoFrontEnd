define([
     "dojo/on"
    ,"dojo/dom"
    ,"dojo/_base/event"
    ,"ioc/dokuwiki/listHeadings"
    ,"ioc/dokuwiki/runRender"
    ,"ioc/dokuwiki/runQuiz" 
    ,"ioc/wiki30/Request"
    ,"dojo/dom-attr"
], function(on, dom, event, listHeadings, runRender, runQuiz,
                Request, att){

    var request = new Request();
    return function (id, params) {

        listHeadings(id);
        runRender(id);
        runQuiz(id);

        var domNode = dom.byId(id);
        on(domNode, 'div.imgb a.media:click, div.iocfigure a.media:click', function (e) {
            var query = "";
            var arr = att.get(this, "href").split("?");
            if (arr.length > 1) {
                query = arr[1];
            }
            request.set('standbyId', domNode.id);
            request.urlBase = params.detailCommand;
            request.sendRequest(query);
            event.stop(e);
        });
        
        var onClickWikiLink = function(e){
            var query = "";
            var hash = "";
            var idtag = "";
            var arr = att.get(this, "href").split("?");
            if (arr.length > 1) {
                query = arr[1];
                arr = query.split("#");
                query = arr[0];
                hash = arr[1];
                idtag= query.substring(query.indexOf("=")+1, query.length).replace(/:/g, "_");
            }
            if(hash && idtag===domNode.id){
                window.location.href = "#" + hash;
            }else{
                request.set('standbyId', domNode.id);
                request.urlBase = params.pageCommand;
                request.sendRequest(query);
            }
            event.stop(e);            
        };
        on(domNode, 'a[class=wikilink1]:click', onClickWikiLink);
        on(domNode, 'a[class=wikilink2]:click', onClickWikiLink);
    };
});



