define([
    "dojo/_base/declare",
    "ioc/gui/ContentTool",
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
            this.registerToEvent(this, "document_changed", lang.hitch(this, this._onDocumentChanged));
            this.registerToEvent(this, "document_changes_reset", lang.hitch(this, this._onDocumentChangesReset));
        },

        /**
         * Accio a realitzar quan hi han canvis al document
         *
         * @param {object} data - dades amb informació sobre l'esdeveniment
         * @private
         */
        _onDocumentChanged: function (data) {
            if (data.id == this.id) {
                this.controlButton.containerNode.style.color = 'red';
            }
        },

        /**
         *
         * @param {object} data - dades amb informació sobre l'esdeveniment
         * @private
         */
        _onDocumentChangesReset: function (data) {
            if (data.id == this.id) {
                this.controlButton.containerNode.style.color = 'black';
            }
        },

        onClose: function () {
            var changesManager = this.dispatcher.getChangesManager(),
                confirmation = true;

            if (changesManager.isChanged(this.id)) {
                confirmation = this.dispatcher.discardChanges();
            }

            if (confirmation) {
                var currentTabId = this.dispatcher.getGlobalState().currentTabId;

                if (currentTabId === this.id) {
                    this.dispatcher.getGlobalState().currentTabId = null;
                }

                this.dispatcher.getChangesManager().resetDocumentChangeState(this.id);

                // TODO[Xavi] S'hauria de restaurar la visibilitat dels botons i els panells d'informació <-- Enregistrat als events?
                this.closeDocument();            }

            return confirmation;
        },

        onUnload: function() {
            this.inherited(arguments);
            this.closeDocument();
        },

        closeDocument: function() {
            this.dispatcher.removeDocument(this.id);
            this.triggerEvent('document_closed', {id: this.id});
        },


        onSelect: function () { // onShow()
            this.dispatchEvent("document_selected", {id: this.id});

        },

        onUnselect: function () { // onHide()
            this.dispatchEvent("document_unselected", {id: this.id});
        },

        setCurrentDocument: function (id) {
            this.dispatcher.getGlobalState().currentTabId = id;
            this.dispatcher.getContentCache(id).setMainContentTool(this);
            this.dispatchEvent("document_selected", {id: id});
        },

        /** @override */
        getContainer: function () {
            return this.getParent();
        }
    });

});

