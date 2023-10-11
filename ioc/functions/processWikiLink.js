define([
    "dojo/on"
   ,"dojo/_base/event"
   ,"dojo/dom"
   ,"dojo/dom-attr"
], function (on, event, dom, att) {
    var ret = function(idOrWin, params){
        var domNode;
        if(typeof idOrWin === 'string' || idOrWin instanceof String){
            domNode = dom.byId(idOrWin);
        }else{
            domNode = idOrWin.document.body;
        }
//        if(!req){
//           //req = new Request(); 
//        }
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
                idtag= query.substring(query.indexOf("=")+1, query.length);
            }
            if(hash && idtag===params.ns){
                window.location.href = "#" + hash;
            }else{
//                request.set('standbyId', domNode.id);
//                request.urlBase = params.pageCommand;
//                request.sendRequest(query);
            }
            event.stop(e);            
        };
        on(domNode, 'a[class=wikilink1]:click', onClickWikiLink);
        on(domNode, 'a[class=wikilink2]:click', onClickWikiLink);
    };
    return ret;
});


