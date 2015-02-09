define([
    "dojo/_base/declare",
    "dijit/form/Form",
    "dojo/dom-form",
    "ioc/wiki30/Request",
    "dojo/on",
    "dojo/_base/event",
    "dojo/NodeList-dom"
], function (declare, Form, domForm, Request) {
    var ret = declare("ioc.gui.IocForm", [Form, Request],

        /**
         * Aquest widget modifica el formulari de dojo per enviar les dades via Ajax al fer submit.
         *
         * @class IocForm
         * @extends dijit.form.Form
         * @extends Request
         */
        {
            /** @override */
            startup: function () {
                var thisForm = this;
                var ret = false;
                this.inherited(arguments);
                this.on('submit', function () {
                    if (!this.urlBase) {
                        ret = true;
                    }
                    else if (this.validate()) {
                        //enviar
                        var query = "";
                        var sep = "";
                        var data;
                        if (this.action) {
                            query = this.action;
                            sep = "&";
                        }
                        data = domForm.toQuery(this.id);
                        if (data) {
                            query += sep + data;
                        }
                        thisForm.sendRequest(query);
                    } else {
                        alert('Les dades no són correctes');
                    }
                    return ret;
                });
            }
        });
    return ret;
});
