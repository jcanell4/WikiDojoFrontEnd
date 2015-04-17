define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver'

], function (declare, EventObserver) {

    return declare([EventObserver],
        {

            dispatcher: null,


            /**
             * Al constructor s'ha de passar com argument un contenidor d'accordio o de pestanyes
             * @param args
             */
            constructor: function (args) {
                this.dispatcher = null;
                declare.safeMixin(this, args);

                console.log("mesclat amb args");

            },


            decorate: function (type) {
                // TODO[Xavi] Codi que crida al containerContentToolDecorator, decora amb el type i el retorna
            },

            addChild: function (contentTool) {

                // TODO[Xavi] Controlar si la pestanya afegida a de ser visible o no
                console.log("S'ha afegit " + contentTool.title);

                this.inherited(arguments);

                this.resize();
            },


            /** @deprecated això es fa directament al addChild, només feia un this.resize()*/
            addContentToolToContainer: function (contentTool) {
                // TODO[Xavi] Actualment al MetaInfoProcessor i RevisionsProcessor
            },

            clearContainer: function (docId) {
                // TODO[Xavi] Elimina tots els ContentTools referents associats al docId
            }


        });
});

