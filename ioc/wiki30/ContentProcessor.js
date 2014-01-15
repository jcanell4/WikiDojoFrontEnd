define([
	"dojo/_base/declare" // declare
       ,"ioc/wiki30/StateUpdaterProcessor"
       ,"dijit/registry" //search widgets by id       
       ,"dojo/dom"
       ,"dijit/layout/ContentPane"        //per a la funció newTab
], function(declare, StateUpdaterProcessor, registry, dom, ContentPane){
    var ret = declare("ioc.wiki30.ContentProcessor", [StateUpdaterProcessor], {
       process:function(response, dispatcher){
           this.inherited(arguments);
           this.__newTab(response.value, dispatcher);           
       } 
       ,__newTab: function(content, dispatcher){
                var tc = registry.byId(dispatcher.containerNodeId);
                var widget = registry.byId(content.id);
                /*Construeix una nova pestanya*/
                if (!widget) {
                        var cp = new ContentPane({
                                        id: content.id,
                                        title: content.title,
                                        content: content.content,
                                        closable: true
                        });
                        tc.addChild(cp);
                        tc.selectChild(cp);
                }else {
                        tc.selectChild(widget);
                        var node = dom.byId(content.id);
                        node.innerHTML=content.content;
                }
                return 0;
        }        
    });
    return ret;
});

