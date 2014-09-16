define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/AbstractResponseProcessor"
], function (declare, AbstractResponseProcessor) {

    /**
     * @class ioc.wiki30.processor.StateUpdaterProcessor
     * @extends ioc.wiki30.processor.AbstractResponseProcessor
     */
    var ret = declare("ioc.wiki30.processor.StateUpdaterProcessor", [AbstractResponseProcessor], {

        /**
         *
         * @param {*} value
         * @param {ioc.wiki30.Dispatcher} dispatcher
         */
        process: function (value, dispatcher) {
            this.updateState(dispatcher, value);
        },

        /**
         * TODO[Xavi] Es pasan els arguments al contrari que al process, s'hauria de canviar per fer-ho mes consistent.
         *
         * @param {ioc.wiki30.Dispatcher} dispatcher
         * @param {*} value
         */
        updateState: null /*function(dispatcher, value){}*/
    });
    return ret;
});