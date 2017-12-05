define([
    "dojo/_base/declare",
    "ioc/gui/content/contentToolFactory",
    "ioc/wiki30/processor/MetaInfoProcessor"
], function (declare, contentToolFactory, MetaInfoProcessor) {
    return declare([MetaInfoProcessor],
        /**
         * Aquesta classe s'encarrega de processar les metadadas rebudes al carregar un diff i generar el ContentTool
         * del tipus adequat i afegirlo al ContainerContentTool que li pertoca.
         *
         * @class MetaDiffProcessor
         * @extends MetaInfoProcessor
         * @author Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "metainfo",

            /**
             * Crea un ContentTool apropiat i el retorna.
             *
             * @param {Content} metaContent
             * @returns {ContentTool}
             * @protected
             */
            createContentTool: function (metaContent) {

                var args = {
                        id:         metaContent.id,
                        title:      metaContent.title,
                        data:       metaContent.content || ' ',
                        dispatcher: metaContent.dispatcher,
                        docId:      metaContent.docId,
                        type:       this.type
                    },

                    argsRequestForm = {
                        urlBase: "lib/exe/ioc_ajax.php?call=diff", // TODO[Xavi] aquest valor ha d'arribar des de el servidor?
                        form:    '#switch_mode_' + metaContent.docId
                    };

                return contentToolFactory.generate(contentToolFactory.generation.META, args)
                    .decorate(contentToolFactory.decoration.REQUEST_FORM, argsRequestForm);
            }

        });
});