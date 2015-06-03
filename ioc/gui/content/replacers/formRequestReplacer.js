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
], function (event, on, query, domForm) {

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

            params.request.startStandBy(params.standbyTarget);

            params.request.sendRequest(query);
            event.stop(e);

            params.request.urlBase = originalUrlBase;
        });
    }

});
