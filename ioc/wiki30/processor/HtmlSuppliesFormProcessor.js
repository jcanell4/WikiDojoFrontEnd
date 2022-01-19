define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory"
], function (declare, ContentProcessor, contentToolFactory) {
    var ret = declare([ContentProcessor],
        {
            type: "html_supplies_form",
            
            process: function (value, dispatcher) {
                this.inherited(arguments);
            },

            createContentTool: function (content, dispatcher) {
                var args = {
                        id:         content.id,
                        title:      content.title,
                        content:    content.content,
                        closable:   true,
                        dispatcher: dispatcher,
                        type:       this.type,
                        params:     content.params,
                        aRequestFormArgs: content.aRequestFormArgs,
                        requestLinkArgs:  content.requestLinkArgs
                    };

                return contentToolFactory.generate(contentToolFactory.generation.HTML_SUPPLIES_FORM, args);
            },
            
            /** @override
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument, i afegeix
             * el valor de la acció a "view".
             *
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @param {{id: string, ns: string, title: string, content: string}} value
             */
            updateState: function (dispatcher, value) {
                this.inherited(arguments);
                dispatcher.getGlobalState().getContent(value.id)["params"] = value.params;
                dispatcher.getGlobalState().getContent(value.id)["action"] = this.type;
            }

        });
    return ret;
});