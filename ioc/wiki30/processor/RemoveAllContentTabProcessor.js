define([
	"dojo/_base/declare" // declare
       ,"ioc/wiki30/processor/StateUpdaterProcessor"
       ,"dojo/query"
], function(declare, StateUpdaterProcessor, query){
    var ret = declare("ioc.wiki30.processor.RemoveAllContentTabProcessor", [StateUpdaterProcessor], {
       type: "removeall"
       ,process:function(value, dispatcher){
           dispatcher.removeAllChildrenWidgets(dispatcher.containerNodeId);
           this.inherited(arguments);
       } 
       ,updateState: function(dispatcher, value){
           dispatcher.contentCache={}
           dispatcher.getGlobalState().pages={};
           dispatcher.getGlobalState().currentTabId=null;
       }
    });
    return ret;
});

