define([
	"dojo/_base/declare" // declare
       ,"ioc/wiki30/processor/StateUpdaterProcessor"
       ,"dijit/registry"
], function(declare, StateUpdaterProcessor, registry){
    var ret = declare("ioc.wiki30.processor.RemoveContentTabProcessor", [StateUpdaterProcessor], {
       type: "remove"
       ,process:function(value, dispatcher){
           dispatcher.removeWidgetChild(dispatcher.containerNodeId, value);
           this.inherited(arguments);
       } 
       ,updateState: function(dispatcher, value){
           delete dispatcher.contentCache[value]
           delete dispatcher.globalState.pages[value];
           var container = registry.byId(dispatcher.containerNodeId);
           dispatcher.globalState.currentTabId=container.selectedChildWidget.id;
       }
    });
    return ret;
});

