define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/AlertProcessor"
], function (declare, AlertProcessor) {
    /**
     * @class CodeResponseProcessor
     * @extends ErrorProcessor
     */
    var ret = declare([AlertProcessor], {
        
        type: "code",

        /**
         * @param {*} value
         * @param {Dispatcher} dispatcher
         * @override
         */
        process: function (value, dispatcher) {
            if (value.code < 0){
                this._processAlert(value.info, dispatcher);
            }
        }
    });
    
    return ret;
});


