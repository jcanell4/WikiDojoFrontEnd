define([
	"dojo/_base/declare"
       ,"ioc/wiki30/processor/StateUpdaterProcessor"
       ,"dijit/registry"            //search widgets by id       
       ,"dojo/dom"
       ,"dijit/layout/ContentPane"  //per a la funció newTab
       ,"ioc/wiki30/DokuwikiContent"
], function(declare, StateUpdaterProcessor, registry, dom, ContentPane, DokuwikiContent){
    var ret = declare("ioc.wiki30.processor.ContentProcessor", [StateUpdaterProcessor], {
       process:function(value, dispatcher){
           this.__newTab(value, dispatcher);   
           this.inherited(arguments);
       } 
       ,updateState: function(dispatcher, value){
           if(!dispatcher.contentCache[value.id]){
                dispatcher.contentCache[value.id] = new DokuwikiContent({
                                                            "id": value.id /*
                                                            ,"title": value.title */
                });
           }
//         dispatcher.contentCache[value.id].setDocumentHTML(value);           
           if(!dispatcher.globalState.pages[value.id]){
               dispatcher.globalState.pages[value.id] = {};
           }
           dispatcher.globalState.pages[value.id]["ns"] = value.ns;
           dispatcher.globalState.currentTabId = value.id;
       }
       ,__newTab: function(content, dispatcher){
            var tc = registry.byId(dispatcher.containerNodeId);
            var widget = registry.byId(content.id);
            /*Construeix una nova pestanya*/
            if (!widget) {
                var cp = new ContentPane({
                                id: content.id
                                ,title: content.title
                                ,content: content.content
                                ,closable: true
                                ,onClose: function(){
                                            var currentTabId = dispatcher.globalState.currentTabId;
                                            //actualitzar globalState
                                            delete dispatcher.globalState.pages[content.id];
                                            //actualitzar contentCache
                                            delete dispatcher.contentCache[content.id];
                                            //elimina els widgets corresponents a les metaInfo de la pestanya
//                                            alert('currentTabId='+currentTabId + '\n\ncontent.id='+content.id);
                                            if (currentTabId == content.id) {
                                                var nodeMetaInfo = registry.byId(dispatcher.metaInfoNodeId);
                                                dispatcher.removeAllChildrenWidgets(nodeMetaInfo);
                                                dispatcher.globalState.currentTabId = null;
                                            }
                                            return true;
                                }
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

