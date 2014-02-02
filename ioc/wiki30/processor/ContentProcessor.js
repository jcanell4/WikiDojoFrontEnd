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
//           var oPage = dispatcher.getGlobalState().pages;
//
//           //<- chivato 
//           if (!oPage[value.id]) 
//               alert("MODULO:ContentProcessor:process\n\nvalue.id : "+value.id);
//           else
//               //dispatcher.getGlobalState().__ImprimirObjeto(oPage[value.id], "MODULO:ContentProcessor:process\n\nObject:oPage[value.id]:");
//               alert("MODULO:ContentProcessor:process\n\nObject:oPage["+value.id+"].ns : "+oPage[value.id].ns +
//                        "\n\nObject:oPage["+value.id+"].action : "+oPage[value.id].action +
//                        "\n\ndispatcher.unsavedChangesState : "+dispatcher.unsavedChangesState);
//           //chivato ->
//           
//           //no entrar si hay cambios sin guardar
//           if (dispatcher.unsavedChangesState) {
//               var pestanya = "activa:"+dispatcher.getGlobalState().currentTabId;
//               if (oPage[value.id])
//                    pestanya = (oPage[value.id]["action"] === "edit") ? "seleccionada:"+value.id : pestanya;
//                alert("La pestanya "+pestanya+" està en edició.");
//           }
//           //Antes de la creación de la pestaña, el objeto "globalState.pages" está vacío, naturalmente
//           else if (!oPage[value.id]) {
//               this.__newTab(value, dispatcher);
//           }  
//           //no entrar si la pestaña clicada (en el árbol) y la pestaña activa son la misma y está en edición y con cambios sin guardar
//           else if (value.id === dispatcher.getGlobalState().currentTabId &&
//                    !dispatcher.unsavedChangesState) {
//               this.__newTab(value, dispatcher);
//           }
//           //no entrar si la pestaña clicada (en el árbol) o la pestaña activa están en edición
//           else if (oPage[value.id]["action"] !== "edit" &&
//                    oPage[dispatcher.getGlobalState().currentTabId]["action"] !== "edit" &&
//                    value.id !== dispatcher.getGlobalState().currentTabId) {
//               this.__newTab(value, dispatcher);
//           }
//           else if (oPage[value.id]["action"] === "edit" ||
//                    oPage[dispatcher.getGlobalState().currentTabId]["action"] === "edit") {
//                var pestanya = (oPage[value.id]["action"] === "edit") ? "seleccionada:"+value.id : "activa:"+dispatcher.getGlobalState().currentTabId;
//                alert("La pestanya "+pestanya+" està en edició.");
//           }
//           else {
//               this.__newTab(value, dispatcher);
//           }
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
           if(!dispatcher.getGlobalState().pages[value.id]){
               dispatcher.getGlobalState().pages[value.id] = {};
           }
           dispatcher.getGlobalState().pages[value.id]["ns"] = value.ns;
           dispatcher.getGlobalState().currentTabId = value.id;
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
                                            var currentTabId = dispatcher.getGlobalState().currentTabId;
                                            //actualitzar globalState
                                            delete dispatcher.getGlobalState().pages[content.id];
                                            //actualitzar contentCache
                                            delete dispatcher.contentCache[content.id];
                                            //elimina els widgets corresponents a les metaInfo de la pestanya
                                            if (currentTabId === content.id) {
                                                var nodeMetaInfo = registry.byId(dispatcher.metaInfoNodeId);
                                                dispatcher.removeAllChildrenWidgets(nodeMetaInfo);
                                                dispatcher.getGlobalState().currentTabId = null;
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

