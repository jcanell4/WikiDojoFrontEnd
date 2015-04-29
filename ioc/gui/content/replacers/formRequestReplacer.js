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
    "dojo/dom-form"

], function (event, on, query, domform) {

    /**
     * TODO[Xavi] Sense provar! Pendent d'implementar la comparació de revisions
     *
     * @params {trigger: string, request: {Request}, form} params: el trigger te el format: 'click'.
     */
    return function (params) {


        var form = query(params.form),
            handle = on(form, "input[type=submit]:" + params.trigger, function (e) {
                var query = "",
                    data = domform.toQuery(this.form),
                    originalUrlBase = params.request.urlBase; //TODO[Xavi] es innecessari perque sempre es null

                params.request.urlBase = params.urlBase;

                data += "&" + this.name + "=" + domform.fieldToObject(this);
                if (data) {
                    query = data;
                }
                params.request.sendRequest(query);
                event.stop(e);
                handle.remove();
                params.request.urlBase = originalUrlBase; //TODO[Xavi] es innecessari perque sempre es null
            });
    }
});
