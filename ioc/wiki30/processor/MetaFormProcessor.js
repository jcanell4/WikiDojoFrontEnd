define([
    "dojo/_base/declare",
    "dijit/registry",
    "ioc/wiki30/processor/MetaInfoProcessor",
    "ioc/gui/content/contentToolFactory"
], function (declare, registry, MetaInfoProcessor, contentToolFactory) {

    return declare([MetaInfoProcessor],
        /**
         * Aquesta classe s'encarrega de processar la informació de tipus revisió, generar el ContentTool del tipus
         * adequat per gestionar metadades de revisions i afegirlo al ContainerContentTool que li pertoca.
         *
         * @class MetaFormProcessor
         * @extends MetaInfoProcessor
         * @author Josep Cañellas <jcanell4@ioc.cat>
         */
        {
            type: "metaForm",

            /**
             * Genera un ContentTool per gestionar les revisions amb les dades rebudes.
             *
             * @param {Revisions} content - Objecte amb tota la informació necessaria per generar el ContentTool
             * @returns {ContentTool} - ContentTool generat amb les dades passades com argument
             * @protected
             */
            createContentTool: function (content) {
                var count = Object.keys(content.revisions).length - 2,
                    argsRequestForm = {
                        urlBase: content.requestFormArgs.urlBase,
                        form:    '#'+content.requestFormArgs.formId
                    },

                    contentTool;
                
                contentTool = this.inherited(content);

                return contentTool.decorate(contentToolFactory.decoration.REQUEST_FORM, argsRequestForm);
            }
        });
});