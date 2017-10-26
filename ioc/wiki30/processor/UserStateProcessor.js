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

                this.inherited(arguments);
                console.log("UserStateProcessor#process", value);
                dispatcher.getGlobalState().userState = value;
                console.log("al globalstate?", dispatcher.getGlobalState().userState);

            },

            /**
             * @override
             */
            updateState: function (dispatcher, value) {

            },


        });
    return ret;
});

