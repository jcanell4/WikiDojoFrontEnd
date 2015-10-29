define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/AbstractResponseProcessor"
], function (declare, AbstractResponseProcessor) {

    return declare([AbstractResponseProcessor],
        /**
         * Aquesta classe s'encarrega de processar la informació de tipus revisió, generar el ContentTool del tipus
         * adequat per gestionar metadades de revisions i afegirlo al ContainerContentTool que li pertoca.
         *
         * @class EditPartialProcessor
         * @extends AbstractResponseProcessor
         * @author Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "edit_partial",

            process: function (value, dispatcher) {
                this._processPartialEdition(value, dispatcher);
            },

            _processPartialEdition: function (content, dispatcher) {
                var i;

                console.log("*** PARTIAL EDITION ***");
                console.log(content);


                var mainContentTool = dispatcher.getContentCache(content.id).getMainContentTool(),
                    oldStructure = mainContentTool.data,
                    newStructure = content.structure,
                    chunk;


                // Fem la cancelació.

                console.log("Recorrent chunks per cancelar: ", oldStructure.chunks.length);
                console.log("Llista de cancels: ", newStructure.cancel);
                for (i = 0; i < oldStructure.chunks.length; i++) {
                    var cancelThis = newStructure.cancel && newStructure.cancel.indexOf(oldStructure.chunks[i].header_id) > -1;
                    console.log("Cancel this:", cancelThis);
                    if (cancelThis) {
                        oldStructure.chunks[i].text = null;

                    }


                }

                // Actualitzem el HTML
                //console.log("Hi ha nou html?", newStructure.html);
                oldStructure.html = newStructure.html;


                oldStructure.date = newStructure.date;

                for (i = 0; i < newStructure.chunks.length; i++) {
                    chunk = newStructure.chunks[i];


                    if (chunk.header_id === newStructure.selected) {
                        oldStructure.chunks[i].text = chunk.text;
                        console.log("Afegit text:", oldStructure);
                        break;
                    }
                }

                mainContentTool.setData(oldStructure);
                mainContentTool.render();

                return 0;
            }

        });
});