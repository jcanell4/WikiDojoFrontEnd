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
                this._processDialog(value, dispatcher);
            },

            /**
             * Configura el dialge amb el text passat com argument i el mostra.
             *
             * @private
             */
            _processDialog: function (value, dispatcher) {
                //console.log("DraftProcessor#_processDialog", value);

                var currentContent = jQuery(value.content).find('textarea').val();

                var dialog = new DiffDialog({
                    title:    "S'ha trobat un esborrany",
                    style:    "width: 700px",
                    document: {content: currentContent, date: value.lastmod},
                    draft:    {content: value.draft.content, date: value.draft.date},
                    docId:    value.id,
                    ns: value.ns,
                    rev:      value.rev,
                    timeout: value.timeout,
                    dispatcher: dispatcher
                });


                dialog.show();


            }
        });
    return ret;
});


