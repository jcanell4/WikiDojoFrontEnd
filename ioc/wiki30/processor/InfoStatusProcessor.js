define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/AbstractResponseProcessor"
], function (declare, AbstractResponseProcessor) {
    /**
     * @class InfoStatusProcessor
     * @extends AbstractResponseProcessor
     * @author Josep Cañellas <jcanell4@ioc.cat>, Xavier Garcia <xaviergaro.dev@gmail.com>
     */
    var ret = declare([AbstractResponseProcessor], {

        type: "info",

        process: function (value, dispatcher) {
            this._processInfo(value, dispatcher);
            this.inherited(arguments);
        },
        
        /**
         * @param {object} value = {(int)duration, (string)id, (string)message, (datetime)timestamp, (string)type}
         */
        _processInfo: function (value, dispatcher) {
            if (!value || !value.message) {
                console.error("Error detectact, la info que ha arribat no es vàlida", value);
                return;
            }

            var infoManager = dispatcher.getInfoManager();
            infoManager.setInfo(value);                
        }

    });
        
    return ret;
    
});

