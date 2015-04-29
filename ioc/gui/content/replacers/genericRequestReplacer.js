/**
 * Aquest mòdul retorna una funció que permet reemplaçar els elements de tipus <a> d'un node per una crid ajax
 * que s'activa al fer click al enllaç.
 *
 * @module genericRequestReplacer
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define(["dojo/_base/event",
    "dojo/dom-attr",
    "dojo/dom",
    "dojo/on"
], function (event, domAttr, dom, on) {
    /**
     * @params {trigger: string, request: {Request}} params: el trigger te el format: 'click', 'mouseover', etc.
     */
    return function (params) {
        var query = null,
            node = dom.byId(this.id);

        on(node, 'a:' + params.trigger, function (e) {
            var arr = domAttr.get(this, "href").split("?");

            if (arr.length > 1) {
                query = arr[1];
            }

            params.request.sendRequest(query);
            event.stop(e);
        });

    }
});
