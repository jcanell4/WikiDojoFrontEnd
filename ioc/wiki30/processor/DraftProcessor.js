define([
    'dojo/_base/declare',
    'ioc/wiki30/processor/AbstractResponseProcessor',
    'ioc/gui/DiffDialog',

], function (declare, AbstractResponseProcessor, DiffDialog) {
    return declare([AbstractResponseProcessor],
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
                var data = this._extractData(value);

                var dialog = new DiffDialog({
                    title: "S'ha trobat un esborrany",
                    style: "width: 700px",
                    document: data.document,
                    draft: data.draft,
                    docId: value.id,
                    ns: value.ns,
                    rev: value.rev,
                    timeout: value.timeout,
                    dispatcher: dispatcher,
                    query: data.query,
                    base: DOKU_BASE + value.params.base
                });

                dialog.show();
            },

            _extractData: function (value) {

                return {
                    document: this._getDocument(value.params),
                    draft: this._getDraft(value.params),
                    query: this._buildQuery(value)
                };
            },

            // TODO[Xavi] En lloc de fer-ho així cercar una manera de passar directament el valor des de la wiki
            _getDocument: function (value) {

                switch (value.type) {
                    case 'full_document':
                        var currentContent = jQuery(value.content).find('textarea').val();
                        return {content: currentContent, date: value.lastmod};

                    case 'partial_document':
                        return {content: value.content.editing, date: value.lastmod};

                }

            },

            // TODO[Xavi] En lloc de fer-ho així cercar una manera de passar directament el valor des de la wiki
            _getDraft: function (value) {
                switch (value.type) {
                    case 'full_document': //falling-through intencionat
                    case 'partial_document':
                        return {content: value.draft.content, date: value.draft.date};
                }

            },

            _buildQuery: function (value) {
                var query = '';

                switch (value.params.type) {
                    case 'full_document':
                        query += 'id=' + value.ns + (value.rev ? '&rev=' + value.rev : '');
                        break;

                    case 'partial_document':
                        query += 'id=' + value.params.original_call.ns
                            + (value.params.original_call.rev ? '&rev=' + value.params.original_call.rev : '')
                            + '&section_id=' + value.params.original_call.section_id
                            + '&editing_chunks=' + value.params.original_call.editing_chunks
                            + '&range=' + value.params.original_call.range //TODO[Xavi] això sembla que no es necessari
                            + '&summary=' + value.params.original_call.summary
                            + '&target=' + value.params.original_call.target;
                }

                return query;
            }
        });
});

