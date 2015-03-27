define([
    "dojo/_base/declare",
    "ioc/wiki30/Request2",
    "ioc/gui/RenderContentTool",
    "dojo/_base/event",
    "dojo/dom-attr",
    'dojo/dom',
    'dojo/on'
], function (declare, Request, RenderContentTool, event, att, dom, on) {

    return declare([RenderContentTool, Request], {

        /**
         *
         * @protected
         */
        render: function () {
            this.set('content', this.renderEngine(this.data))
            this.replaceLinksWithRequest();
        },

        /** @private */
        replaceLinksWithRequest: function () {
            var q = null;
            var tab = this;

            var node = dom.byId(this.id);

            on(node, "a:click", function (e) {
                var arr = att.get(this, "href").split("?");
                if (arr.length > 1) {
                    q = arr[1];
                }
                tab.sendRequest(q);
                event.stop(e); // TODO[Xavi] fer servir e.stopPropagation()?
            });
        }

    });

});
