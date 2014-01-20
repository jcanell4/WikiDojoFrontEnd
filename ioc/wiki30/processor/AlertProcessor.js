define([
	"dojo/_base/declare" // declare
       ,"ioc/wiki30/processor/AbstractResponseProcessor"
], function(declare, AbstractResponseProcessor){
    var ret = declare("ioc.wiki30.processor.AlertProcessor", [AbstractResponseProcessor], {
        type: "alert"
       ,process:function(value, dispatcher){
           this._processAlert(value, dispatcher);
       }
       ,_processAlert: function(alert, dispatcher){
            dispatcher.diag.set("title", "ALERTA");
            dispatcher.diag.set("content", alert);
            dispatcher.diag.show();
        }
    });
    return ret;
});


