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
//                var $boto, self, targetId;
//                self = this;
//                targetId = this.domNode;
//
//                $boto = jQuery("#btn_cerca");
//                $boto.on('click', function(event) {
//                    var $this, request, call, urlBase, params;
//                    request = self.requester;
//                    $this = jQuery(this);
//                    call = $this.attr('data-query');
//                    urlBase = value.aRequestFormArgs.urlBase.split('?');
//                    params = "call="+call;
//                    request.urlBase = urlBase[0];
//                    request.setStandbyId(targetId);
//                    request.sendRequest(params);
//                });
            },

            createContentTool: function (content, dispatcher) {
                var args = {
                        id:         content.id,
                        title:      content.title,
                        content:    content.content,
                        closable:   true,
                        dispatcher: dispatcher,
                        type:       this.type,
                        aRequestFormArgs: content.aRequestFormArgs,
                        requestLinkArgs:  content.requestLinkArgs
                    };

                return contentToolFactory.generate(contentToolFactory.generation.HTML_SUPPLIES_FORM, args);
            },
            
            /** @override
             * Actualitza els valors del GlobalState fent servir el valor passat com argument.
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @param {{id: string, ns: string, title: string, content: string}} value
             */
            updateState: function (dispatcher, value) {
                this.inherited(arguments);
                dispatcher.getGlobalState().getContent(value.id)["action"] = this.type;
            }

        });
    return ret;
});