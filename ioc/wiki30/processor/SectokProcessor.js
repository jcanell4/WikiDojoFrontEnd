define([
	"dojo/_base/declare" // declare
       ,"ioc/wiki30/processor/StateUpdaterProcessor"
], function(declare, StateUpdaterProcessor){
    var ret = declare("ioc.wiki30.processor.SectokProcessor", [StateUpdaterProcessor], {
       type: "sectok"
       ,process:function(value, dispatcher){
           this._processSectok(value, dispatcher);
           this.inherited(arguments);
       } 
       ,updateState: function(dispatcher, value){
           dispatcher.getGlobalState().sectok=value;
       }
       ,_processSectok: function(result, dispatcher){
           dispatcher.putSectok(result);
       }
    });
    return ret;
});

