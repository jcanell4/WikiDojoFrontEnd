define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/StateUpdaterProcessor"
], function (declare, StateUpdaterProcessor) {
    var ret = declare([StateUpdaterProcessor],

        /**
         * @class UserStateProcessor
         * @extends StateUpdaterProcessor
         */
        {
            type: "user_state",

            /**
             * @param {*} value
             * @param {Dispatcher} dispatcher
             *
             * @override
             */
            process: function (value, dispatcher) {
                // console.log("UserStateProcessor#process", value);
                this.inherited(arguments);
                dispatcher.getGlobalState().userState = value;
            },

            /**
             * @override
             */
            updateState: function (dispatcher, value) {

            },


        });
    return ret;
});

