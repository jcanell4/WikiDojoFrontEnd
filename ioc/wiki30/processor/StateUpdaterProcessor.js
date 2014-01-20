define([
	"dojo/_base/declare" // declare
       ,"ioc/wiki30/processor/AbstractResponseProcessor"
], function(declare, AbstractResponseProcessor){
    var ret = declare("ioc.wiki30.processor.StateUpdaterProcessor", [AbstractResponseProcessor], {
       process:function(value, dispatcher){
           this.updateState(dispatcher, value);
       }
       ,updateState: null /*function(dispatcher, value){
        }*/
    });
    return ret;
});