define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/StateUpdaterProcessor"
], function (declare, StateUpdaterProcessor) {
    return declare([StateUpdaterProcessor],

        /**
         * Aquesta classe s'encarrega processar la eliminació de tots els elements de un ContainerContentTool específic.
         *
         * @class RemoveAllContentProcessor
         * @extends StateUpdaterProcessor
         * @author Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "removeall",

            /**
             * Elimina tots els elements del ContainerContentTool amb la id passada com argument al paràmetre value
             * enllaçada al dispatcher passat com argument.
             *
             * @param {{container: string}} value - id del ContainerContentTool a buidar
             * @param {Dispatcher} dispatcher - Dispatcher al qeu està enllaçat el ContainerContentTool
             * @override
             */
            process: function (value, dispatcher) {
                dispatcher.removeAllChildrenWidgets(value.container);
                this.inherited(arguments);
            }
        });
});