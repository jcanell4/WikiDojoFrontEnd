define([
	"dojo/_base/declare" // declare
       ,"ioc/wiki30/processor/StateUpdaterProcessor"
       ,"dojo/dom"
], function(declare, StateUpdaterProcessor, dom){
    var ret = declare("ioc.wiki30.processor.LoginProcessor", [StateUpdaterProcessor], {
       type: "login"
       ,process:function(value, dispatcher){
           this._processLogin(value, dispatcher);
           this.inherited(arguments);
       } 
       ,updateState: function(dispatcher, value){
           dispatcher.globalState.login=value.loginResult;           
       }
       ,_processLogin: function(result, dispatcher){
            if (result.loginRequest && !result.loginResult){
                    dispatcher._processError("Usuari o contrasenya incorrectes");
            }else if (!result.loginRequest && !result.loginResult){
                    dom.byId(dispatcher.infoNodeId).innerHTML="usuari desconnectat";
            }else {
                    dom.byId(dispatcher.infoNodeId).innerHTML="usuari connectat";
            }
       }
    });
    return ret;
});

