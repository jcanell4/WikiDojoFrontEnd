define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver'
], function (declare, EventObserver) {

    return declare([EventObserver],

        /**
         * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del containerContentToolFactory.
         *
         * S'ha deixat com un fitxer independent per facilitar la seva edició i no pot comptarse amb que sigui accesible
         * en el futur.
         *
         * @class ContainerContentTool
         * @extends EventObserver
         * @author Xavier García <xaviergaro.dev@gmail.com>
         * @privada
         * @see containerContentToolFactory.generate()
         */
        {
            dispatcher: null,

            decorator: null,

            /**
             * Al constructor s'ha de passar com argument un contenidor d'accordio, de pestanyes o de qualsevol altre
             * classe que sigui compatible, per ser mesclat amb aquesta classe.
             *
             * @param {*} args
             */
            constructor: function (args) {
                this.dispatcher = null;
                this.decorator = null;
                declare.safeMixin(this, args);
            },

            /**
             * Decora aquest ContainerContentTool amb les característiques del decorador demanat com argument.
             *
             * @param {string} type - tipus de decorador
             * @returns {ContainerContentTool} - aquest mateix ContainerContentTool decorat
             */
            decorate: function (type) {
                return this.decorator.decorate(type, this);
            },

            /**
             * Afegeix un ContentTool a aquest contenidor i comprova si en el moment d'afegir-lo ha de ser visible o no
             * segons si el document al que està enlaçat es el seleccionat actualment.
             *
             * @param {ContentTool} contentTool - ContentTool per afegir
             */
            addChild: function (contentTool) {
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

            /**
             * Elimina els elements d'aquest contenidor lligats al document amb la id especificada o tots si no
             * s'especifica cap o el valor es null.
             *
             * @param {string?} docId - id del document del que volem eliminar els continguts, o null si volem
             * eliminar-los tots
             */
            clearContainer: function (docId) {
                var children = this.getChildren();

                if (docId) {
                    this._clearDocChildren(docId, children);
                } else {
                    this._clearAllChildren(children);

                }
            },

            /**
             * Elimina tots els elements del contenidor un per un.
             *
             * @param {ContentTool[]} children - Elements per eliminar
             * @private
             */
            _clearAllChildren: function (children) {
                for (var child in children) {
                    children[child].removeContentTool();
                }
            },

            /**
             * Elimina tots els elements del array de ContentTools lligats al document passat com argument.
             *
             * @param {string} docId - id del document que volem eliminar els elements
             * @param {ContentTool[]} children - Array de ContentTools que volem filtrar per eliminar
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
             * Retorna la posició del ContentTool dins del contenidor o -1 si no s'ha trobat.
             *
             * @param {string} id - id del ContentTool
             * @returns {int} - posició en la que es troba  o -1 si no s'ha trobat
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