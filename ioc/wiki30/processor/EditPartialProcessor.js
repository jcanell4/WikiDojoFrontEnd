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
                console.log("*** PARTIAL EDITION ***");
                console.log(content);


                var mainContentTool = dispatcher.getContentCache(content.id).getMainContentTool(),
                    oldStructure = mainContentTool.data,
                    newStructure = content.structure,
                    chunk;


                for (var i=0; i<newStructure.chunks.length; i++) {
                    chunk = newStructure.chunks[i];
                    if (chunk.header_id === newStructure.selected) {
                        oldStructure.chunks[i].text = chunk.text;
                        console.log("Afegit text:", oldStructure);
                        break;
                    }
                }

                mainContentTool.setData(oldStructure);
                mainContentTool.render();


                //  1 - Trobar el content tool amb el mateix id
                //  2 - Adaptar la estructura amb la nova informació
                //      Que pot haver canviat?
                //      No res, els canvis a la estructura es reben a la resposta del save_partial
                //      Afegir el nou text que es troba identificat pel selected a la estructura
                //      Llegir las dades, afegir el text, i fer setData de nou




                return 0;
            }

        });
});