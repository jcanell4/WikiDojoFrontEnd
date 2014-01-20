define([
	"dojo/_base/declare" // declare
       ,"ioc/wiki30/processor/AbstractResponseProcessor"
], function(declare, AbstractResponseProcessor){
    var ret = declare("ioc.wiki30.processor.ErrorProcessor", [AbstractResponseProcessor], {
        type: "error"
       ,process:function(value, dispatcher){
           this._processError(value, dispatcher);
       }
       ,_processError: function(message, dispatcher){
            dispatcher.diag.set("title", "ERROR");
            dispatcher.diag.set("content", message);
            dispatcher.diag.show();
        }
    });
    return ret;
});


