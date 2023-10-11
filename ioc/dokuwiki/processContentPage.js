define([
     "dojo/on"
    ,"dojo/dom"
    ,"dojo/_base/event"
    ,"ioc/dokuwiki/listHeadings"
    ,"ioc/dokuwiki/runRender"
    ,"ioc/dokuwiki/runQuiz" 
    ,"ioc/wiki30/Request"
    ,"dojo/dom-attr"
    ,"dojo/dom-class"
    ,"dojo/query"
], function(on, dom, event, listHeadings, runRender, runQuiz,
                Request, att, domClass, domQuery){

    var request = new Request();
    return function (id, params) {

        listHeadings(id, params.ns);
        runRender(id);
        runQuiz(id);

        var domNode = dom.byId(id);
        on(domNode, 'div.imgb a.media:click, div.imga a.media:click, div.iocgif a.media:click, div.iocfigure a.media:click', function (e) {
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
        
        on(domNode, "a[data-container-id-referred]:click", function(){
            var containerId = att.get(this, "data-container-id-referred");
            var node = dom.byId(containerId);
            if(domClass.contains(node, 'imploded')){
                domQuery("[data-container-id='"+containerId+"']", domNode).forEach(function(nodeItem){
                    domClass.replace(nodeItem, "exploded", "imploded");
                });
                domClass.replace(node, "exploded", "imploded");
            }else{
                domQuery("[data-container-id='"+containerId+"']", domNode).forEach(function(nodeItem){
                    domClass.replace(nodeItem, "imploded", "exploded");
                });
                domClass.replace(node, "imploded", "exploded");                    
            }
        });
        on(domNode, "a.hiddenContainer[data-container-type]:click", function(){
            var containerId = att.get(this, "id");
                if(domClass.contains(this, 'imploded')){
                    domQuery("[data-container-id='"+containerId+"']", domNode).forEach(function(nodeItem){
                        domClass.replace(nodeItem, "exploded", "imploded");
                    });
                    domClass.replace(this, "exploded", "imploded");
                }else{
                    domQuery("[data-container-id='"+containerId+"']", domNode).forEach(function(nodeItem){
                        domClass.replace(nodeItem, "imploded", "exploded");
                    });
                    domClass.replace(this, "imploded", "exploded");
                }
        });
    };
});



