define([
	"dojo/_base/declare" // declare
       ,"ioc/wiki30/processor/StateUpdaterProcessor"
       ,"dojo/query"
], function(declare, StateUpdaterProcessor, query){
    var ret = declare("ioc.wiki30.processor.TitleProcessor", [StateUpdaterProcessor], {
       type: "title"
       ,process:function(value, dispatcher){
           this._processTitle(value);
           this.inherited(arguments);
       } 
       ,updateState: function(dispatcher, value){
           dispatcher.getGlobalState().title=value;
       }
       ,_processTitle: function(title){
           var nodeTitle = query("title")[0];
           nodeTitle.innerHTML=title;
       }
    });
    return ret;
});

