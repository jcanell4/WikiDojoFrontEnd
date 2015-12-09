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
                console.log("value:", value);
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
                var foo = this._getBar(value);

                var dialog = new DiffDialog({
                    title: "S'ha trobat un esborrany",
                    style: "width: 700px",
                    //document: {content: currentContent, date: value.lastmod},
                    //draft:    {content: value.draft.content, date: value.draft.date},
                    document: foo.document,
                    draft: foo.draft,
                    docId: value.id,
                    ns: value.ns,
                    rev: value.rev,
                    timeout: value.timeout,
                    dispatcher: dispatcher,
                    //query: 'id=' + value.ns + (value.rev ? '&rev=' + value.rev : ''),
                    query: foo.query,
                    base: DOKU_BASE + value.params.base
                    //base: DOKU_BASE + 'lib/plugins/ajaxcommand/ajax.php?call=edit'
                });


                console.log("**** BASE: ", value.params.base, value);
                dialog.show();


            },

            _getBar: function (value) {
                return {
                    document: this._getDocument(value.params),
                    draft: this._getDraft(value.params),
                    query: this._buildQuery(value)
                }
            },

            // TODO[Xavi] En lloc de fer-ho així cercar una manera de passar directament el valor des de la wiki
            _getDocument: function (value) {
                console.log(value);
                switch (value.type) {
                    case 'full_document':
                        var currentContent = jQuery(value.content).find('textarea').val();
                        return {content: currentContent, date: value.lastmod};

                    case 'partial_document':

                        console.log("***** CONTENT **** ", value.content);
                        return {content: value.content.editing, date: value.lastmod};

                }

            },

            // TODO[Xavi] En lloc de fer-ho així cercar una manera de passar directament el valor des de la wiki
            _getDraft: function (value) {
                switch (value.type) {
                    case 'full_document':
                        return {content: value.draft.content, date: value.draft.date};

                    case 'partial_document':
                        return {content: value.draft.content, date: value.draft.date};

                }

            },

            _buildQuery: function (value) {
                var query = '';

                console.log("VALUE: ", value);
                switch (value.params.type) {
                    case 'full_document':
                        query += 'id=' + value.ns + (value.rev ? '&rev=' + value.rev : '');
                        console.log("Query: ", query);
                        return query;

                    case 'partial_document':
                        query += 'id=' + value.params.original_call.ns
                            + (value.params.original_call.rev ? '&rev=' + value.params.original_call.rev : '')
                            + '&section_id=' + value.params.original_call.section_id
                            + '&editing_chunks=' + value.params.original_call.editing_chunks
                            + '&range=' + value.params.original_call.range //TODO[Xavi] això sembla que no es necessari
                            + '&summary=' + value.params.original_call.summary
                            + '&target=' + value.params.original_call.target;

                        //$response['original_call']['section_id'] = $selected;
                        //$response['original_call']['editing_chunks'] = implode(',', $editing_chunks); // TODO[Xavi] s'ha de convertir en string
                        //$response['original_call']['rev'] = $prev;
                        //$response['original_call']['range'] = '-'; // TODO[Xavi] Això sembla que no es necessari
                        //$response['original_call']['target'] = 'section';
                        //$response['original_call']['id'] = $this - > cleanIDForFiles($pid);
                        //$response['original_call']['ns'] = $pid;
                        //$response['original_call']['summary'] = $psum; // TODO[Xavi] Comprovar si es correcte, ha de ser un array

                        console.log("Query: ", query);
                        return query;
                }
            }
        });
});

