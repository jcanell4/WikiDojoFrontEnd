define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory"
], function (declare, ContentProcessor, contentToolFactory) {
    var ret = declare([ContentProcessor],
        {
            type: "html_new_user_teachers_form",
            
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
                        aRequestFormArgs: content.aRequestFormArgs
                    };

                return contentToolFactory.generate(contentToolFactory.generation.HTML_NEW_USER_TEACHERS_FORM, args);
            },
            
            /** @override
             * Actualitza els valors del GlobalState fent servir el valor passat com argument.
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @param {{id: string, ns: string, title: string, content: string}} value
             */
            updateState: function (dispatcher, value) {
                this.inherited(arguments);
                //recoge todos los inputs del formulario y los convierte en una cadena para enviar por POST (para F5 reload)
                var parms = "";
                var $form = jQuery('#'+value.aRequestFormArgs.formId)[0];
                for (var i=0; i<$form.length; i++){
                    if ($form[i].type !== "hidden" && $form[i].type !== "submit") {
                        parms += "&" + $form[i].name + "=" + $form[i].value;
                    }
                };
                dispatcher.getGlobalState().getContent(value.id)["action"] = this.type;
                dispatcher.getGlobalState().getContent(value.id)["parms"] = parms;
            }

        });
    return ret;
});