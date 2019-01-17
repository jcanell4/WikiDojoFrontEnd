define([
    'dojo/_base/declare',
    'ioc/wiki30/processor/AbstractResponseProcessor',
], function (declare, AbstractResponseProcessor) {
    /**
     * @class DraftProcessor
     * @extends AbstractResponseProcessor
     */
    return declare([AbstractResponseProcessor], {
        type: "draft",
        DEFAULT_DRAFT: {content: "No s'ha trobat l'esborrany", date: ''}, // TODO[Xavi] Localitzar el missatge

        /**
         * Processa un missatge de tipus alert el que fa que es configuri un dialeg i es mostri.
         *
         * @param {string} value - atributs del missatge que es mostrarà
         * @param {Dispatcher} dispatcher
         * @override
         */
        process: function (value, dispatcher) {
            //console.log("UpdateLocalDraftsProcessor#process", value);
            if (value.projectType && value.metaDataSubSet) {
                dispatcher.getDraftManager().updateProjectLocalDrafts(value.ns, value.metaDataSubSet, value.drafts);   
            }else {
                dispatcher.getDraftManager().updateLocalDrafts(value.ns, value.drafts);
            }
        }

    });
});

