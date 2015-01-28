define([
    "dojo/_base/declare"
], function (declare) {
    var ret = declare("ioc.wiki30.processor.AbstractResponseProcessor", [],
        /**
         * Superclasse de tots els processors.
         *
         * @class AbstractResponseProcessor
         */
        {
            /** @type string */
            type: "undefined",

            /**
             * Processa aquest command. Si no es sobreescriu a la subclasse no realitza cap acció.
             *
             * @param {*} value - Contingut a processar
             * @param {Dispatcher} dispatcher
             */
            process: function (value, dispatcher) {
            }
        });
    return ret;
});