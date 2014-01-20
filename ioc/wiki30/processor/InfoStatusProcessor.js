define([
	"dojo/_base/declare" // declare
       ,"ioc/wiki30/processor/StateUpdaterProcessor"
       ,"dojo/dom"
], function(declare, StateUpdaterProcessor, dom){
    var ret = declare("ioc.wiki30.processor.InfoStatusProcessor", [StateUpdaterProcessor], {
       type: "info"
       ,process:function(value, dispatcher){
           this._processInfo(value, dispatcher);
           this.inherited(arguments);
       } 
       ,updateState: function(dispatcher, value){
           dispatcher.globalState.info=value;
       }
       ,_processInfo: function(info, dispatcher){
           dom.byId(dispatcher.infoNodeId).innerHTML=info;
       } 
    });
    return ret;
});

