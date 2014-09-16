define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/StateUpdaterProcessor"
], function (declare, StateUpdaterProcessor) {
    var ret = declare("ioc.wiki30.processor.SectokProcessor", [StateUpdaterProcessor],

        /**
         * @class ioc.wiki30.processor.SectokProcessor
         * @extends ioc.wiki30.processor.StateUpdaterProcessor
         */
        {

            type: "sectok",

            /**
             * @param {*} value
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {
                this._processSectok(value, dispatcher);
                this.inherited(arguments);
            },

            /**
             * Estableix el token de seguretat al GlobalState
             *
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @param {string} value
             */
            updateState: function (dispatcher, value) {
                dispatcher.getGlobalState().sectok = value;
            },

            /**
             * Afegeix el token de seguretat al Dispatcher
             * @param {string}result
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @private
             */
            _processSectok: function (result, dispatcher) {
                dispatcher.putSectok(result);
            }
        });
    return ret;
});

