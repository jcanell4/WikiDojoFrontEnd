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
     * Reemplaça el comportament del enllaços del node passat com argument per una crida ajax.
     *
     * Es crea un backup del urlBase original abans d'establir el propi.
     *
     * @params {trigger: string, request: {Request}, urlBase: string, standbyTarget: string?} params: el trigger te el format: 'click', 'mouseover', etc.
     * @return el listener que es pot fer servir com a referencia per eliminar-lo.
     */
    return function (params) {
        var query = null,
            node = dom.byId(this.id);


        return [on(node, 'a:' + params.trigger, function (e) {
            var arr = domAttr.get(this, "href").split("?"),
                originalUrlBase = params.request.urlBase,
                call = domAttr.get(this, "data-call"),
                pattern = /(call=page)[^&]?/,
                targetId = params.standbyTarget || params.request.dispatcher.containerNodeId;

            if (call) {
                params.request.urlBase = params.urlBase.replace(pattern, 'call=' + call);
            } else {
                params.request.urlBase = params.urlBase;
            }

            if (arr.length > 1) {
                query = arr[1];
            }

            params.request.setStandbyId(targetId);
            params.request.sendRequest(query);

            event.stop(e);

            params.request.urlBase = originalUrlBase;
        })];

    }
});
