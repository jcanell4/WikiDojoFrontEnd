define([
    'dojo/_base/declare',
    'ioc/wiki30/processor/AbstractResponseProcessor',
    'ioc/gui/DiffDialog',

], function (declare, AbstractResponseProcessor, DiffDialog) {
    var ret = declare([AbstractResponseProcessor],
        /**
         * @class DraftProcessor
         * @extends AbstractResponseProcessor
         */
        {
            type: "draft",

            /**
             * Processa un missatge de tipus alert el que fa que es configuri un dialeg i es mostri.
             *
             * @param {string} value - Missatge que es mostrarà
             * @param {Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {
                console.log("value:",value);
                this._processDialog(value, dispatcher);
            },

            /**
             * Configura el dialge amb el text passat com argument i el mostra.
             *
             * @private
             */
            _processDialog: function (value, dispatcher) {
                //console.log("DraftProcessor#_processDialog", value);


                // TODO[Xavi] En lloc de fer-ho així cercar una manera de passar directament el valor des de la wiki
                var document = this._getDocument(value.params),
                    draft = this._getDraft(value.params);

                console.log("Document: ", document);
                console.log("Draft: ", draft);

                var dialog = new DiffDialog({
                    title: "S'ha trobat un esborrany",
                    style: "width: 700px",
                    //document: {content: currentContent, date: value.lastmod},
                    //draft:    {content: value.draft.content, date: value.draft.date},
                    document: document,
                    draft: draft,
                    docId: value.id,
                    ns: value.ns,
                    rev: value.rev,
                    timeout: value.timeout,
                    dispatcher: dispatcher,
                    query: 'id=' + value.ns + (value.rev ? '&rev=' + value.rev : ''),
                    base: DOKU_BASE + 'lib/plugins/ajaxcommand/ajax.php?call=edit'
                });


                dialog.show();


            },

            // TODO[Xavi] En lloc de fer-ho així cercar una manera de passar directament el valor des de la wiki
            _getDocument: function (value) {
                console.log(value);
                switch (value.type) {
                    case 'full_document':
                        var currentContent = jQuery(value.content).find('textarea').val();
                        return {content: currentContent, date: value.lastmod};
                }

            },

            // TODO[Xavi] En lloc de fer-ho així cercar una manera de passar directament el valor des de la wiki
            _getDraft: function (value) {
                switch (value.type) {
                    case 'full_document':
                        return {content: value.draft.content, date: value.draft.date};
                }

            }
        });

    return ret;
});

