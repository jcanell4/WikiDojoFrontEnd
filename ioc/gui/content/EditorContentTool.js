define([
    "dojo/_base/declare",
    "ioc/gui/content/ContentTool",
    "dojo/_base/lang",
], function (declare, ContentTool, lang) {

    return declare([ContentTool],
        /**
         * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
         *
         * S'ha deixat com un fitxer independent per facilitar la seva edició i no pot comptarse amb que sigui accesible
         * en el futur.
         *
         * Aquesta classe requereix que es decori amb una decoració de tipus EDITOR o que afegeixi un métode closeDocument()
         * per realitzar les accions de nateja i disparar l'esdeveniment de tancament.
         *
         * @class EditorContentTool
         * @extends ContentTool
         * @author Xavier García <xaviergaro.dev@gmail.com>
         * @private
         * @see contentToolFactory.generate()
         */
        {
            /**
             * Es registra com observador de si mateix per modificar el estat quan es produeixen canvis.
             *
             * @override
             */
            postLoad: function () {
                // TODO[Xavi] Reactivar quan es mogui el ChangesManager
                this.registerToEvent(this, "document_changed", lang.hitch(this, this.onDocumentChanged));
                this.registerToEvent(this, "document_changes_reset", lang.hitch(this, this.onDocumentChangesReset));
            },

            /**
             * Accio a realitzar quan hi han canvis al document.
             *
             * @param {object} data - Dades amb informació sobre l'esdeveniment
             * @protected
             */
            onDocumentChanged: function (data) {
                if (data.id == this.id) {
                    if (this.controlButton) {
                        this.controlButton.containerNode.style.color = 'red';
                    }
                }
            },

            /**
             * Acció a realitzar quan es reinicialitza el document.
             *
             * @param {object} data - Dades amb informació sobre l'esdeveniment
             * @protected
             */
            onDocumentChangesReset: function (data) {
                if (data.id == this.id) {
                    if (this.controlButton) {
                        this.controlButton.containerNode.style.color = 'black';
                    }
                }
            },

            /**
             * Acció a realitzar quan es tanca el document. Si detecta canvis demana confirmació i en cas de que no hi hagin
             * o es descartin el canvis retorna cert i es procedeix al tancament del document.
             *
             * @returns {boolean}
             */
            onClose: function () {
                var changesManager = this.dispatcher.getChangesManager(),
                    confirmation = true;

                if (changesManager.isChanged(this.id)) {
                    confirmation = this.dispatcher.discardChanges();
                }

                if (confirmation) {
                    this.closeDocument();
                }

                return confirmation;
            }
        });
});