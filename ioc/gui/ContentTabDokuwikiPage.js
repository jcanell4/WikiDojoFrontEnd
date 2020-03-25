define([
    "dojo/_base/declare", // declare
    "dojo/on",
    "dojo/dom-attr",
    "dojo/_base/event",
    "dijit/layout/ContentPane",
    "ioc/wiki30/Request"
], function (declare, on, att, event, ContentPane, Request) {
    var ret = declare("ioc.gui.ContentTabDokuwikiPage", [ContentPane, Request],

        /**
         * Converteix enllaços normals en crides AJAX.
         *
         * @class ContentTabDokuwikiPage
         * @extends dijit.layout.ContentPane
         * @extends Request
         */
        {

            /** @override */
            startup: function () {
                this.inherited(arguments);
                /*TO DO: */
                var q = null;
                var tab = this;
                on(this.domNode, "a:not(.nocommand):click", function (e) {
                    var arr = att.get(this, "href").split("?");
                    if (arr.length > 1) {
                        q = arr[1];
                        if(q.indexOf("call") === -1 && tab.defaultCall){
                            q = tab.defaultCall + "&" + q;
                        }
                    }
                    tab.sendRequest(q);
                    event.stop(e);
                });
            }
        });
    return ret;
});
