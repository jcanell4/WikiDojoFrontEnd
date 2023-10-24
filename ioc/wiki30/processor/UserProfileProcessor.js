define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory"
], function (declare, ContentProcessor, contentToolFactory) {
    var ret = declare([ContentProcessor],
        /**
         * @class UserProfileProcessor
         * @extends AbstractResponseProcessor
         */
        {
            type: "profile",
            
            /**
             * @param {*} value
             * @param {Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {
                this.inherited(arguments);
            },

            createContentTool: function (content, dispatcher) {
                // console.log("USerProfile", content);
                var args = {
                        id:         content.id,
                        title:      content.title,
                        content:    content.content,
                        closable:   true,
                        dispatcher: dispatcher,
                        type:       this.type
                    };
                return contentToolFactory.generate(contentToolFactory.generation.DOCUMENT, args);
            }
            
        });
        
    return ret;
});