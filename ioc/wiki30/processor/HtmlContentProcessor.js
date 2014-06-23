define([
    "dojo/_base/declare",
    "dijit/registry",    //search widgets by id
    "ioc/wiki30/processor/ContentProcessor"
], function (declare, registry, ContentProcessor) {

    var ret = declare("ioc.wiki30.processor.HtmlContentProcessor", [ContentProcessor],
        /**
         * @class ioc.wiki30.processor.HtmlContentProcessor
         * @extends ioc.wiki30.processor.ContentProcessor
         */
        {

            type: "html",

            /**
             * @param {*} value
             * @param {ioc.wiki30.Dispatcher} dispatcher
             *
             * @override
             */
            process: function (value, dispatcher) {
                this.inherited(arguments);

                /* Provisional */
                //           var node = registry.byId(value.id);
                //           var childNodeH1 = node.domNode.children[0]; //domNode de H1
                //           var childNodeDIV1 = node.domNode.children[1]; //domNode de DIV1
                //           var childNodeDIV2 = node.domNode.children[2]; //domNode de DIV2
                ////           dispatcher.getGlobalState().__ImprimirObjeto(node.domNode.children, "node.domNode.children");
                ////           dispatcher.getGlobalState().__ImprimirObjeto(childNodeDIV2, "node.domNode.children[2]");
                //           dispatcher.getGlobalState().getIdSectionNode(childNodeDIV1);
                /* Provisional */
            },

            /**
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument, i afegeix
             * el valor de la acció a "view".
             *
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @param {{id: string, ns: string, title: string, content: string}} value
             *
             * @override
             */
            updateState: function (dispatcher, value) {
                this.inherited(arguments);
                dispatcher.getGlobalState().pages[value.id]["action"] = "view";
            }
        });
    return ret;
});

