/**
 * Aquest mòdul retorna una funció que permet reemplaçar els elements de tipus <a> d'un node per una crid ajax
 * que s'activa al fer click al enllaç.
 *
 *
 * @module formRequestReplacer
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([
    "dojo/_base/event",
    "dojo/on",
    "dojo/query",
    "dojo/dom-form",
    "dojox/widget/Standby"

], function (event, on, query, domForm, Standby) {


    // TODO[Xavi] Codi duplicat a linkRequestReplacer, això s'ha de moure al Request
    function _startStandBy(request) {
        var standbyId = request.standbyId || request.dispatcher.containerNodeId;

        request._standby = new Standby({target: standbyId});
        document.body.appendChild(request._standby.domNode);
        request._standby.startup();

    }

    /**
     * Reemplaça el comportament del botó submit del formulari passat com argument per una crida ajax.
     *
     * Es crea un backup del urlBase original abans d'establir el propi.
     *
     * @params {trigger: string, request: {Request}, form} params: el trigger te el format: 'click'.
     */
    return function (params) {
        var form = query(params.form);


        on(form, 'input[type="submit"]:' + params.trigger, function (e) {

    var query = "",
                data = domForm.toQuery(this.form),
                originalUrlBase = params.request.urlBase;

            params.request.urlBase = params.urlBase;

            data += "&" + this.name + "=" + domForm.fieldToObject(this);
            if (data) {
                query = data;
            }


            params.request.setStandbyId(params.standbyTarget);

            _startStandBy(params.request);




            params.request.sendRequest(query);
            event.stop(e);

            params.request.urlBase = originalUrlBase;
        });
    }

});
