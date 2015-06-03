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
    "dojo/on",
    "dojox/widget/Standby"
], function (event, domAttr, dom, on, Standby) {


    // TODO[Xavi] Codi duplicat a linkRequestReplacer, això s'ha de moure al Request
    function _startStandBy(request) {
        var standbyId = request.standbyId || request.dispatcher.containerNodeId;

        request._standby = new Standby({target: standbyId});
        document.body.appendChild(request._standby.domNode);
        request._standby.startup();

    }

    /**
     * Reemplaça el comportament del enllaços del node passat com argument per una crida ajax.
     *
     * Es crea un backup del urlBase original abans d'establir el propi.
     *
     * @params {trigger: string, request: {Request}, urlBase: string, standbyTarget: string?} params: el trigger te el format: 'click', 'mouseover', etc.
     */
    return function (params) {
        var query = null,
            node = dom.byId(this.id);


        on(node, 'a:' + params.trigger, function (e) {
            var arr = domAttr.get(this, "href").split("?"),
                originalUrlBase = params.request.urlBase,
                call = domAttr.get(this, "data-call"),
                pattern = /(call=page)[^&]?/;

            if (call) {
                params.request.urlBase = params.urlBase.replace(pattern, 'call=' + call);
            } else {
                params.request.urlBase = params.urlBase;
            }

            if (arr.length > 1) {
                query = arr[1];
            }

            params.request.setStandbyId(params.standbyTarget);

            _startStandBy(params.request);

            params.request.sendRequest(query);

            event.stop(e);

            params.request.urlBase = originalUrlBase;
        });

    }
});
