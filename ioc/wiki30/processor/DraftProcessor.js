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
                console.log("tenim la data del document?", value);

                // TODO: Cada botó envia la petició ajaxcomand al client per editar la pàgina però passant un valor indicant pel cas que es trobi un draft
                // recoverDraft=true.

                // Aquest dialog ha de tenir un timer, amb el timeout+60s (el que arriba del server per les pàgines normals.

                //
                //      Acció 1 carregar el document actual
                //      Acció 2 carregar el draft

                var currentContent = jQuery(value.content).find('textarea').val(),
                //draft = value.draft.content,
                    $content = jQuery(value.content);

                var dialog = new DiffDialog({
                    title:    "S'ha trobat un esborrany",
                    style:    "width: 700px",
                    document: {content: currentContent, date: value.lastmod},
                    draft:    {content: value.draft.content, date: value.draft.date},
                    docId:    value.id,
                    rev:      value.rev,
                    //closable: false
                });


                dialog.show();


            }
        });
    return ret;
});


