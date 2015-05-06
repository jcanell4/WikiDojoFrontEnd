define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/RemoveAllContentProcessor"
], function (declare, RemoveAllContentProcessor) {
    return declare([RemoveAllContentProcessor],

        /**
         * Aquesta classe es responsable de executar el process de eliminar tot els elements del ContainerContentTool
         * principal.
         *
         * @class RemoveAllContentTabProcessor
         * @extends RemoveAllContentProcessor
         * @author Josep Cañellas <jcanell4@ioc.cat>
         */
        {
            type: "removeall",

            /**
             * Executa el process de eliminar tots els continguts del ContainerContentTool principal de la aplicació.
             *
             * @param {*} value - Aquest valor es ignorat, es respecta només per concordancia amb la superclasse
             * @param {Dispatcher} dispatcher - Dispatcher al que està enllaçat el ContainerContentTool
             * @override
             */
            process: function (value, dispatcher) {
                arguments[0] = {container: dispatcher.containerNodeId};
                this.inherited(arguments);
            },

            /**
             * Elimina tots els documents carregats.
             *
             * @param {Dispatcher} dispatcher
             * @param {*} value - Aquest valor es ignorat, es respecta només per concordancia amb la superclasse
             * @override
             */
            updateState: function (dispatcher, value) {
                dispatcher.contentCache = {};
                dispatcher.getGlobalState().pages = {};
                dispatcher.getGlobalState().currentTabId = null;
            }
        });
});