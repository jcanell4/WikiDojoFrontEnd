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
            dispatcher.getGlobalState().getContent(value.id)[value.type]=value.value;
            //console.log("Actualitzat estat:", value.id, dispatcher.getGlobalState().getContent(value.id));
        }
    });
    return ret;
});

