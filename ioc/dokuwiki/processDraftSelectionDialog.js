define([
    'dijit/Dialog',
    'ioc/wiki30/Request'
], function (Dialog, Request) {


    // TODO[Xavi] Tot el tema de la selecció ha d'anar en un process diferent que serà cridat en lloc del HtmlPartialContentProcessor
    var requester,

        _showDraftSelectionDialog = function (params) {

            // TODO[Xavi] Localitzar els missatges, es pot enviar des del servidor en lloc del valor cert
            var dialog = new Dialog({
                title: 'S\'ha trobat un esborrany complet',
                content: 'S\'ha trobat un esborrany complet del document. Si continuas amb la edició parcial ' +
                '<b>aquest esborrany serà eliminat</b>. Pots obrir el document en edicio completa per recuperar-lo.'
                + '<div class="dijitDialogPaneActionBar">'
                + '<button data-dojo-type="dijit/form/Button" type="button" id="cancel-edition-' + params.id + "\">Tornar</button>"
                + '<button data-dojo-type="dijit/form/Button" type="button" id="partial-edition-' + params.id + "\">Edició parcial</button>"
                + '<button data-dojo-type="dijit/form/Button" type="button" id="full-edition-' + params.id + "\">Edició completa</button>"
                + '</div>',
                style: 'width: 300px',
                closable: false,

                startup: function () {
                    // TODO[Xavi] Afegir els listeners als botons
                    jQuery('#cancel-edition-' + params.id).on('click', function () {
                        dialog.destroyRecursive();
                    });

                    jQuery('#partial-edition-' + params.id).on('click', function () {
                        // Als params s'ha de passar suficient informació per retornar la mateixa petició + clear draft

                        var query = 'do=edit_partial'
                            + '&section_id=' + params.section_id
                            + '&editing_chunks=' + params.editing_chunks// TODO[Obtenir la llista de chunks en edició -> crear una funció per fer això
                            + '&target=' + params.target
                            + '&id=' + params.ns
                            + '&rev=' + params.rev
                            + '&summary=' + params.summary
                            + '&range=-'
                            + '&discard_draft=true'; // Descartem el draft complet


                        requester.urlBase = 'lib/plugins/ajaxcommand/ajax.php?call=edit_partial';
                        requester.sendRequest(query);

                        dialog.destroyRecursive();
                    });

                    jQuery('#full-edition-' + params.id).on('click', function () {
                        var query = '&id=' + params.ns;

                        requester.urlBase = 'lib/plugins/ajaxcommand/ajax.php?call=edit';
                        requester.sendRequest(query);

                        dialog.destroyRecursive();


                    });
                }
            });


            dialog.show();
        },
        _createRequest = function () {
            requester = new Request();

            requester.updateSectok = function (sectok) {
                this.sectok = sectok;
            };

            requester.sectok = requester.dispatcher.getSectok();
            requester.dispatcher.toUpdateSectok.push(requester);
        };

    return function (params) {
        _createRequest();
        _showDraftSelectionDialog(params.original_call);

    };

});