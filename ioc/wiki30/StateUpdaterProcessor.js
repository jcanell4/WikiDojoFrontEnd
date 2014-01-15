define([
	"dojo/_base/declare" // declare
       ,"ioc/wiki30/AbstractResponseProcessor"
], function(declare, AbstractResponseProcessor){
    var ret = declare("ioc.wiki30.StateUpdaterProcessor", [AbstractResponseProcessor], {
       process:function(response, dispatcher){
           this.updateState(dispatcher, response.value);
       }
       ,updateState: null /*function(dispatcher, value){
        }*/
    });
    return ret;
});