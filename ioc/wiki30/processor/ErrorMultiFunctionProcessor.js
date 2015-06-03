define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/ErrorProcessor"
], function (declare, ErrorProcessor) {

    var ret = declare([ErrorProcessor],
        /**
         * @class ErrorProcessor
         * @extends AbstractResponseProcessor
         */
        {
            errorAction:null,
            
            addErrorAction: function(code, action){
                if(this.errorAction==null){
                    this.errorAction = new Array();
                }
                this.errorAction[code]=action;
                console.log("ErrorMultiFunctionProcessor#addErrorAction:code="+code+". action="+action);
            },
            
            /**
             * @param {*} value
             * @param {Dispatcher} dispatcher
             *
             * @override
             */
            process: function (value, dispatcher) {
                if(this.errorAction[value.code]){
                    var action = this.errorAction[value.code];
                    action(dispatcher);
                }else{
                    this._processError(value.message, dispatcher);
                }
                console.log("ErrorMultiFunctionProcessor#process:value.code="+value.code+". dispatcher="+dispatcher);
            }
        });
    console.log("ErrorMultiFunctionProcessor#ret");
    return ret;
});


