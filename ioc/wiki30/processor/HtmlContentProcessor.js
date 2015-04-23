define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory",
    "dijit/registry",
], function (declare, ContentProcessor, contentToolFactory, registry) {

    var ret = declare([ContentProcessor],
        /**
         * @class HtmlContentProcessor
         * @extends ContentProcessor
         */
        {

            type: "html",

            /**
             * @param {Content} value
             * @param {Dispatcher} dispatcher
             *
             * @override
             */
            process: function (value, dispatcher) {
                return this.inherited(arguments);
            },

            /**
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument, i afegeix
             * el valor de la acció a "view".
             *
             * @param {Dispatcher} dispatcher
             * @param {Content} value
             *
             * @override
             */
            updateState: function (dispatcher, value) {
                this.inherited(arguments);
                dispatcher.getGlobalState().pages[value.id]["action"] = "view";
            },

            createContentTool: function (content, dispatcher) {
                var args = {
                    id:         content.id,
                    title:      content.title,
                    content:    content.content,
                    closable:   true,
                    dispatcher: dispatcher
                };

                return contentToolFactory.generate(contentToolFactory.generation.BASE, args)
                    .decorate(contentToolFactory.decoration.DOCUMENT, args);
            },

            /**
             *
             * @param content
             * @param dispatcher
             * @param container
             *
             * @protected
             * @override
             */
            addContent: function (content, dispatcher, container) {
                var oldContentTool = registry.byId(content.id),
                    cp,
                    position = 0;

                if (oldContentTool && oldContentTool.getType() == 'HTML') {
                    oldContentTool.setData(content.content);
                    cp = oldContentTool;

                } else {
                    if (oldContentTool) {
                        position = container.getChildIndex(oldContentTool.id);
                        oldContentTool.removeContentTool();
                    }

                    cp = this.createContentTool(content, dispatcher);

                    cp.setType('HTML');
                    container.addChild(cp, position);
                    container.selectChild(cp);
                }
                dispatcher.addDocument(content);
                cp.setCurrentDocument(content.id);
            }
        });
    return ret;
});

