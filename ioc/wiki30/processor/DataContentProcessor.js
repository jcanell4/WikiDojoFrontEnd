define([
    "dojo/dom",
    "ioc/dokuwiki/editorManager/Editor",
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/ContentProcessor"
], function (dom, Editor, declare, ContentProcessor) {


    var ret = declare("ioc.wiki30.processor.DataContentProcessor", [ContentProcessor],
        /**
         * @class DataContentProcessor
         * @extends ContentProcessor
         */
        {

            type: "data",

            /**
             * @param {Content} value
             * @param {Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {

                var ret;

                value.editor = new Editor(value.id, value.content);
                value.content = "<p></p>";



                ret = this.inherited(arguments);
                value.editor.select();

                return ret;
            },


            /**
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument, i afegeix
             * el valor de la acció a "edit".
             *
             * @param {Dispatcher} dispatcher
             * @param {Content} value
             * @override
             */
            updateState: function (dispatcher, value) {
                this.inherited(arguments);
                dispatcher.getGlobalState().pages[value.id]["action"] = "edit";
                dispatcher.getContentCache(value.id).setEditor(value.editor);
            }


        });


    return ret;
});

