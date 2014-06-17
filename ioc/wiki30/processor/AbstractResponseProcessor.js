define([
    "dojo/_base/declare" // declare
], function (declare, lang) {
    var ret = declare("ioc.wiki30.processor.AbstractResponseProcessor", [],
        /**
         * Superclasse de tots els processors.
         *
         * @class ioc.wiki30.processor.AbstractResponseProcessor
         */
        {
            /** @type string */
            type: "undefined",

            /**
             * Processa aquest command.
             *
             * @param {object} value
             * @param {ioc.wiki30.Dispatcher} dispatcher
             */
            process: function (value, dispatcher) {
            }
        });
    return ret;
});


