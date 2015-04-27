define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/AbstractResponseProcessor"
], function (declare, AbstractResponseProcessor) {

    /**
     * @class StateUpdaterProcessor
     * @extends AbstractResponseProcessor
     */
    var ret = declare([AbstractResponseProcessor], {

        /**
         *
         * @param {*} value
         * @param {Dispatcher} dispatcher
         */
        process: function (value, dispatcher) {
            this.updateState(dispatcher, value);
        },

        /**
         * TODO[Xavi] Es pasan els arguments al contrari que al process, s'hauria de canviar per fer-ho mes consistent.
         *
         * @param {Dispatcher} dispatcher
         * @param {*} value
         */
        updateState: null /*function(dispatcher, value){}*/
    });
    return ret;
});