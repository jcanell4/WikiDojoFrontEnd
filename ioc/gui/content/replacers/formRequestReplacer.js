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
], function (event, on, query, domForm) {

    /**
     * Reemplaça el comportament del botó submit del formulari passat com argument per una crida ajax.
     *
     * Es crea un backup del urlBase original abans d'establir el propi.
     *
     * @params {trigger: string, request: {Request}, form} params: el trigger te el format: 'click'.
     */
    return function (params) {
        //console.log("Params:", params);

        var form = query(params.form),
            targetId = params.standbyTarget || params.request.dispatcher.containerNodeId;


        //console.log("S'ha trobat el form?", form);

        return on(form, 'input[type="submit"]:' + params.trigger, function (e) {
            //console.log("formRequestReplacer#onSubmit", e);


            var query = "",
                data = domForm.toQuery(this.form),
                originalUrlBase = params.request.urlBase,
                dataCall = jQuery(this).attr('data-call-type');


            if (dataCall) {
                params.request.urlBase = "lib/exe/ioc_ajax.php?call=" + dataCall;
            } else {
                params.request.urlBase = params.urlBase;
            }


            data += "&" + this.name + "=" + domForm.fieldToObject(this);
            if (data) {
                query = data;
            }

            params.request.setStandbyId(targetId);
            params.request.sendRequest(query);


            if (!params.continue) {

                event.stop(e);
            }


            params.request.urlBase = originalUrlBase;
        });
    }

});
