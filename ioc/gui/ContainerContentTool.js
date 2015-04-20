define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver'

], function (declare, EventObserver) {

    return declare([EventObserver],

        /**
         * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del containerContentToolFactory.
         *
         * @class ContainerContentTool
         * @extends EventObserver
         * @author Xavier García <xaviergaro.dev@gmail.com>
         * @protected
         * @see containerContentToolFactory
         */
        {

            dispatcher: null,

            decorator: null,

            /**
             * Al constructor s'ha de passar com argument un contenidor d'accordio o de pestanyes
             * @param args
             */
            constructor: function (args) {
                this.dispatcher = null;
                this.decorator = null;
                declare.safeMixin(this, args);
            },


            decorate: function (type) {
                return this.decorator.decorate(type, this);
            },

            addChild: function (contentTool) {
                // TODO[Xavi] Controlar si la pestanya afegida a de ser visible o no
                //console.log("S'ha afegit " + contentTool.title);

                // Comprovem si ha de ser visible

                if (contentTool.docId) {
                    if (this.dispatcher.getGlobalState().getCurrentId() === contentTool.docId) {
                        contentTool.showContent();
                    } else {
                        contentTool.hideContent();
                    }
                }


                this.inherited(arguments);
                this.resize();
            },

            clearContainer: function (docId) {
                // TODO[Xavi] Elimina tots els ContentTools referents associats al docId
                var children = this.getChildren();

                for (var child in children) {
                    if (children[child].docId == docId) {
                        children[child].removeContentTool();
                    }
                }

            }


        });
});

