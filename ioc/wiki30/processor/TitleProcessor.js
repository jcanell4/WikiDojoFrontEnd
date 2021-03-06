define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/StateUpdaterProcessor",
    "dojo/query"
], function (declare, StateUpdaterProcessor, query) {
    var ret = declare([StateUpdaterProcessor],
        /**
         * @class TitleProcessor
         * @extends StateUpdaterProcessor
         */
        {
            type: "title",

            /**
             * @param {*} value
             * @param {ioc.wiki30.Dispatcher} dispatcher
             *
             * @override
             */
            process: function (value, dispatcher) {
                this._processTitle(value);
                this.inherited(arguments);
            },


            /**
             * Actualitza el valor del títol de la finestra del explorador.
             *
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @param {string} value
             */
            updateState: function (dispatcher, value) {
                dispatcher.getGlobalState().title = value;
            },

            /**
             * Estableix el titol de la finestra.
             *
             * @param {string} title
             * @private
             */
            _processTitle: function (title) {
                var nodeTitle = query("title")[0];
                nodeTitle.innerHTML = title;
            }
        });
    return ret;
});

