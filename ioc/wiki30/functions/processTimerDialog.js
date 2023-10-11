define([
//    'ioc/wiki30/dispatcherSingleton',
    'ioc/gui/DialogBuilder' ,
    'ioc/wiki30/Timer'
], function (/*getDispatcher,*/ DialogBuilder, Timer) {

/*
 * Alerta [Josep] Aquesta funció no es fa servir. No més és aquí per ilustrar com generar diversos diàlegs amb diferents tipus de botons
 */
    return function (params) {
        console.log("processTimerDIalog", params);
        
        var refId = "requiring_timer",
                dlg,
                timer = new Timer(),
                dialogManager = params.dispatcher.getDialogManager(),
                eventManager = params.dispatcher.getEventManger();
        
        var callBackButton = function(text, callback){
            return {
                        id: refId + '_ok',
                        buttonType: 'default',
                        description: text,
                        callback: callback
                    };
        };
        
        var requestControlButton = function(text, eventType, dataToSend){
            return {
                        id: params.id + '_ok',
                        buttonType: "request_control",
                        description: text,
                        callback: function(){
                            eventManager.fireEvent(eventType, {
                                id: params.id,
                                dataToSend: dataToSend
                            });                            
                        }
                    };
        }
        
        var requestButton = function(text, urlBase, dataToSend, classButton){
            return {
                        id: params.id + '_ok',
                        buttonType: "default",
                        description: text,
                        classButton: classButton,
                        props: {"urlBase":urlBase, "query":dataToSend}
                    };
        }

        var generateDialog = function(func){
            var dialogParams = {
                    dispatcher: params.dispatcher,
                    id: "DlgRequiringTimer",
                    ns: params.ns, 
                    title: params.dialog.title,
                    message: params.dialog.message,
                    closable: true
                },
                button;

            var builder =  new DialogBuilder(dialogParams);
            
            
            dlg = dialogManager.getDialog(refId, builder.getId());
            if(!dlg){
                if(params.dialog.dialog.ok.type==="amd"){
                    button = callBackButton(params.dialog.ok.text, func);
                }else if(params.dialog.ok.type==="request_control"){
                    button = requestControlButton(params.dialog.ok.text, params.dialog.ok.eventType, params.dialog.ok.dataToSend);
                }else if(params.dialog.ok.type==="request"){
                    button = requestButton(params.dialog.ok.text, params.dialog.ok.urlBase, params.dialog.ok.dataToSend);
                }else if(params.dialog.ok.callback){
                    button = callBackButton(params.dialog.ok.text, params.dialog.ok.callback);
                }else{
                    button = callBackButton(params.dialog.ok.text, func);
                }
            
                builder.addButton(button.buttonType, button);
                builder.addCancelDialogButton({description: params.dialog.cancel.text});
                
                dlg = builder.build();
                dialogManager.addDialog(refId, dlg);
            }
            
            dlg.show();            
        };
        
        if(params.dialog.dialog.ok.type==="amd"){
            require(params.dialog.amdFunction, function(func){
                generateDialog(func);
            });
        }else if(params.dialog.ok.type==="request_control"){
            generateDialog();
        }else if(params.dialog.ok.type==="request"){
            require(["ioc/gui/IocButton"], function(cb){
                generateDialog(cb);
            });
        }else if(params.dialog.ok.callback){
            generateDialog(params.dialog.ok.callback);
        }else{
            generateDialog(function(){
                timer.start(params.timer.timeout, params.timer.params);
            });
        }
        

        if(params.timer.onCancel){
            timer.init({
                    onExpire: params.timer.onExpire,
                    paramsOnExpire: params.timer.paramsOnExpire,
                    onCancel: params.timer.onCancel,
                    paramsOnCancel: params.timer.paramsOnCancel
                });
        }else{
            timer.init({
                    onExpire: params.timer.onExpire,
                    paramsOnExpire: params.timer.paramsOnExpire
                });
        }
        return timer;
    };
});

