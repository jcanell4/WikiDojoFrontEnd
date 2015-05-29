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
         * @class DiffContentProcessor
         * @extends ContentProcessor
         * @author Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "diff",

            /**
             * Processa el valor rebut com argument com a contingut Html per mostrar un document en mode Html
             *
             * @param {Content} value - Valor per processar
             * @param {Dispatcher} dispatcher - Dispatcher al que està lligat aquest document.
             * @override
             */
            process: function (value, dispatcher) {
                //console.log(value.content);
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
                dispatcher.getGlobalState().getContent(value.id)["action"] = "diff";
                //dispatcher.getGlobalState().getContent(value.id)["rev"] = value.rev;
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
                        content:    content.content,
                        closable:   true,
                        dispatcher: dispatcher,
                        rev:        content.rev
                    },


                    contentTool = contentToolFactory.generate(contentToolFactory.generation.DOCUMENT, args);

                contentTool.setType(content.type); //TODO[Xavi] Canviar per establir-lo a partir del que arriba del server


                return contentTool;
            },

            getAllowedTypes: function (content) {
                return content.type; // TODO[Xavi] Amb aquesta implementació es permet sobrescriure sempre que es tracti del mateix tipus

                //return 'HTML';
            },

            isTypeAllowed: function () {

            }
        });
});
