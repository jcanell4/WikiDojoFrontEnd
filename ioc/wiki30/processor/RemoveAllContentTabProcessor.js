define([
	"dojo/_base/declare" // declare
       ,"ioc/wiki30/processor/StateUpdaterProcessor"
       ,"dojo/query"
], function(declare, StateUpdaterProcessor, query){
    var ret = declare("ioc.wiki30.processor.RemoveAllContentTabProcessor", [StateUpdaterProcessor], {
       type: "removeall"
       ,process:function(value, dispatcher){
           dispatcher.removeAllChildrenWidgets(dispatcher.containerNodeId);
       } 
       ,updateState: function(dispatcher, value){
           dispatcher.contentCache={}
           dispatcher.globalState.pages={};
           dispatcher.globalState.currentTabId=null;
       }
    });
    return ret;
});

