define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/StateUpdaterProcessor",
], function (declare, StateUpdaterProcessor) {

    /**
     * @class ExtraContentStateProcessor
     * @extends StateUpdaterProcessor
     */
    var ret = declare([StateUpdaterProcessor], {

        /**
         * @param {Dispatcher} dispatcher
         * @param {*} value
         */
        updateState: function(dispatcher, value){
            if (value.value) {
                dispatcher.getGlobalState().getContent(value.id)[value.type]=value.value;
            }else {
                delete dispatcher.getGlobalState().getContent(value.id)[value.type];
            }
        }
    });
    return ret;
});

