define([
    "dojo/_base/declare",
    "ioc/gui/content/ContentTool",
    "dojo/_base/lang",

], function (declare, ContentTool, lang) {

    /**
     * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
     *
     * @class EditorContentTool
     * @extends ContentTool, EventObserver
     * @author Xavier García <xaviergaro.dev@gmail.com>
     * @protected
     * @see contentToolFactory
     */
    return declare([ContentTool], {

        postLoad: function () {
            // TODO[Xavi] Reactivar quan es mogui el ChangesManager
            this.registerToEvent(this, "document_changed", lang.hitch(this, this.onDocumentChanged));
            this.registerToEvent(this, "document_changes_reset", lang.hitch(this, this.onDocumentChangesReset));
        },

        /**
         * Accio a realitzar quan hi han canvis al document
         *
         * @param {object} data - dades amb informació sobre l'esdeveniment
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
         *
         * @param {object} data - dades amb informació sobre l'esdeveniment
         * @protected
         */
        onDocumentChangesReset: function (data) {
            if (data.id == this.id) {
                if (this.controlButton) {
                    this.controlButton.containerNode.style.color = 'black';
                }
            }
        },

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

