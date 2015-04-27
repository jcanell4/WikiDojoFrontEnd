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
                //console.log("S'ha afegit " + contentTool.title);

                // Comprovem si ha de ser visible
                if (contentTool.docId) {
                    if (this.dispatcher.getGlobalState().getCurrentId() === contentTool.docId) {
                        contentTool.showContent();
                    } else {
                        contentTool.hideContent();
                    }
                }

                // TODO[Xavi] Comprovació necessaria temporalment per controlar la adició de elements que no son ContentTools
                if (contentTool.setContainer) {
                    contentTool.setContainer(this);
                }


                this.inherited(arguments);
                this.resize();
            },

            clearContainer: function (docId) {
                var children = this.getChildren();

                if (docId) {
                    this._clearDocChildren(docId, children);
                } else {
                    this._clearAllChildren(children);

                }
            },

            /**
             * @private
             */
            _clearAllChildren: function (children) {
                for (var child in children) {
                    children[child].removeContentTool();
                }
            },

            /**
             * @private
             */
            _clearDocChildren: function (docId, children) {
                for (var child in children) {
                    if (children[child].docId == docId) {
                        children[child].removeContentTool();
                    }
                }
            },


            /**
             * Retrona la posició dins del contenidor o -1 si no s'ha trobat.
             *
             * @param {string} id
             * @returns {int}
             */
            getChildIndex: function (id) {
                var children = this.getChildren();
                for (var i = 0; i < children.length; i++) {
                    if (children[i].id === id) {
                        return i;
                    }
                }
                return -1;
            }


        });
});