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
                var i, j,
                    mainContentTool = dispatcher.getContentCache(content.id).getMainContentTool(),
                    oldStructure = mainContentTool.data,
                    newStructure = content;

                for (i = 0; i < oldStructure.chunks.length; i++) {
                    var cancelThis = newStructure.cancel && newStructure.cancel.indexOf(oldStructure.chunks[i].header_id) > -1;
                    if (oldStructure.chunks[i].text && !cancelThis) {
                        // Cerquem el header_id a la nova estructura
                        for (j = 0; j < newStructure.chunks.length; j++) {
                            if (newStructure.chunks[j].header_id === oldStructure.chunks[i].header_id) {
                                newStructure.chunks[j].text = oldStructure.chunks[i].text;
                                break;
                            }
                        }
                        // Si no es troba es que aquesta secció ha sigut eliminada

                    }
                }

                mainContentTool.setData(newStructure);
                mainContentTool.render();
                return 0;
            }

        });
});