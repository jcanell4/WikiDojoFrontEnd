define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory",
    "ioc/gui/content/subclasses/StructuredDocumentSubclass",
], function (declare, ContentProcessor, contentToolFactory, StructuredDocumentSubclass) {

    return declare([ContentProcessor],
        /**
         * Aquesta classe s'encarrega de processar els continguts per documents de tipus Html, generar els ContentTool
         * apropiat i afegir-lo al contenidor adequat.
         *
         * @class HtmlContentProcessor
         * @extends ContentProcessor
         * @author Josep Cañellas <jcanell4@ioc.cat>, Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "edit_partial",

            /**
             * Processa el valor rebut com argument com a contingut Html per mostrar un document en mode Html
             *
             * @param {Content} value - Valor per processar
             * @param {Dispatcher} dispatcher - Dispatcher al que està lligat aquest document.
             * @override
             */
            process: function (value, dispatcher) {
                //console.log('HtmlPartialContentProcessor#process', value);
                return this.inherited(arguments);
            },

            /**
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument, i afegeix
             * el valor de la acció a "view".
             *
             * @param {Dispatcher} dispatcher - Dispatcher al que està lligat aquest process
             * @param {Content} value - Valor per processar
             * @override
             */
            updateState: function (dispatcher, value) {
                this.inherited(arguments);
                dispatcher.getGlobalState().getContent(value.id)["action"] = "view";
                dispatcher.getGlobalState().getContent(value.id)["rev"] = value.rev;
            },

            /**
             * Genera un ContentTool decorat adecuadament per funcionar com document de només lectura.
             *
             * @param {Content} content - Contingut a partir del qual es generarà el ContentTool
             * @param {Dispatcher} dispatcher - Dispatcher al que estarà lligat el ContentTool
             * @returns {ContentTool} ContentTool decorat com a tipus document.
             * @protected
             * @override
             */
            createContentTool: function (content, dispatcher) {
                var args = {
                    ns:         content.ns,
                    id:         content.id,
                    title:      content.title,
                    content:    content.structure,
                    closable:   true,
                    dispatcher: dispatcher,
                    rev:        content.rev,
                    type:       this.type,

                };
                    //argsRequestForm = {
                    //    urlBase: "lib/plugins/ajaxcommand/ajax.php?call=edit_partial&do=edit_partial",
                    //    form: '.btn_secedit',
                    //    continue: true
                    //};
                    //
                    //

                return contentToolFactory.generate(contentToolFactory.generation.STRUCTURED_DOCUMENT, args);


                //return contentToolFactory.generate(contentToolFactory.generation.DOCUMENT, args);
            }

        });
});
