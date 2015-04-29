/**
 * Aquest mòdul retorna una funció que permet reemplaçar els elements de tipus <a> d'un node per una crid ajax
 * que s'activa al fer click al enllaç.
 *
 * @module linkRequestReplacer
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define(["dojo/_base/event",
    "dojo/dom-attr",
    "dojo/dom",
    "dojo/on"
], function (event, domAttr, dom, on) {
    /**
     * Es crea un backup del urlBase original abans d'establir el propi.
     *
     * @params {trigger: string, request: {Request}, urlBase: string} params: el trigger te el format: 'click', 'mouseover', etc.
     */
    return function (params) {
        var query = null,
            node = dom.byId(this.id);


        on(node, 'a:' + params.trigger, function (e) {
            var arr = domAttr.get(this, "href").split("?"),
                originalUrlBase = params.request.urlBase; //TODO[Xavi] es innecessari perquè sempre es null

            params.request.urlBase = params.urlBase;

            if (arr.length > 1) {
                query = arr[1];
            }

            params.request.sendRequest(query);
            event.stop(e);

            params.request.urlBase = originalUrlBase; //TODO[Xavi] es innecessari perquè sempre es null
        });

    }
});
