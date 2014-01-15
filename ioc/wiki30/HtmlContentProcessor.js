define([
	"dojo/_base/declare" // declare
       ,"ioc/wiki30/ContentProcessor"
       ,"ioc/wiki30/DokuwikiContent"
], function(declare, ContentProcessor, DokuwikiContent){
    var ret = declare("ioc.wiki30.HtmlContentProcessor", [ContentProcessor], {
        type: "html"
       ,process:function(response, dispatcher){ 
           this.inherited(arguments);
           if(!dispatcher.contentCache[response.value.id]){
               dispatcher.contentCache[response.value.id]=
                                    new DokuwikiContent({
                                         "id": response.value.id
                                        ,"title": response.value.title
                                    });
           }
           dispatcher.contentCache[response.value.id].setDocumentHTML(
                                                        response.value);
       }
       ,updateState: function(dispatcher, value){
           if(!dispatcher.globalState.pages[value.id]){
               dispatcher.globalState.pages[value.id]={};
           }
           dispatcher.globalState.pages[value.id]["ns"]=value.title;
       }
    });
    return ret;
});

