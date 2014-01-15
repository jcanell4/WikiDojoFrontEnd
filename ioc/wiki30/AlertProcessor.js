define([
	"dojo/_base/declare" // declare
       ,"ioc/wiki30/AbstractResponseProcessor"
], function(declare, AbstractResponseProcessor){
    var ret = declare("ioc.wiki30.AlertProcessor", [AbstractResponseProcessor], {
        type: "alert"
       ,process:function(response, dispatcher){
           this._processAlert(response.value, dispatcher);
       }
       ,_processAlert: function(alert, dispatcher){
            dispatcher.diag.set("title", "ALERTA");
            dispatcher.diag.set("content", alert);
            dispatcher.diag.show();
        }
    });
    return ret;
});


