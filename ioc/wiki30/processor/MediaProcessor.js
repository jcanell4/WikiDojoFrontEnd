define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory"
], function (declare, ContentProcessor, contentToolFactory) {

    var ret = declare([ContentProcessor],
        /**
         * @class MediaProcessor
         * @extends ContentProcessor
         */
        {

            type: "media",

            /**
             * @param {*} value
             * @param {ioc.wiki30.Dispatcher} dispatcher
             *
             * @override
             */
            process: function (value, dispatcher) {
                //if(value.preserveMetaData){
                    
                //}else{
                    this.inherited(arguments);
                //}
                
            },

            /**
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument, i afegeix
             * el valor de la acció a "view".
             *
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @param {{id: string, ns: string, title: string, content: string}} value
             *
             * @override
             */
            updateState: function (dispatcher, value) {
                this.inherited(arguments);
                dispatcher.getGlobalState().pages[value.id]["action"] = "media";
                dispatcher.getGlobalState().pages[value.id]["ns"] = value.ns;
            },
        
            createContentTool: function (content, dispatcher) {
                var args = {
                    id:         content.id,
                    title:      content.title,
                    content:    content.content,
                    closable:   true,
                    dispatcher: dispatcher,
                    type:       this.type
                };

                return contentToolFactory.generate(contentToolFactory.generation.DOCUMENT, args);
                    // NO és necessita pq classe Document .decorate(contentToolFactory.decoration.DOCUMENT, args);
            },
            
             /**
              * REDEFINIT PER NO RETORNAR NULL
             * Retorna la llista de tipus permesos. Aquest mètode s'ha de sobrescriure amb la lògica necessaria pels
             * diferents processors.
             *
             * @params {*} content - objecte d'on es poden extreure les dades necessaries per generar la llista de tipus
             * permesos
             * @returns {string|string[]}
             * @protected
             */
            getAllowedTypes: function (content) {
                return this.type;
            }
            
            
        });
    return ret;
});

