define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory"
], function (declare, ContentProcessor, contentToolFactory) {

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
            type: "html",

            /**
             * Processa el valor rebut com argument com a contingut Html per mostrar un document en mode Html
             *
             * @param {Content} value - Valor per processar
             * @param {Dispatcher} dispatcher - Dispatcher al que està lligat aquest document.
             * @override
             */
            process: function (value, dispatcher) {
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
                dispatcher.getGlobalState().pages[value.id]["action"] = "view";
                dispatcher.getGlobalState().pages[value.id]["rev"] = value.rev;
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
                        id:         content.id,
                        title:      content.title,
                        content:    content.content,
                        closable:   true,
                        dispatcher: dispatcher
                    },

                    contentTool = contentToolFactory.generate(contentToolFactory.generation.DOCUMENT, args);

                contentTool.setType('HTML'); //TODO[Xavi] Això podria obtenir-se de this.type;

                return contentTool;
            },

            // TODO[Xavi] això provoca un error de duplicació dels nombres de secció, ho posem només per les proves
            getAllowedTypes:   function (content) {
                return 'HTML';
            }
        });
});

