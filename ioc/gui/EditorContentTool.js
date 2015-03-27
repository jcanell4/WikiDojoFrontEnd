define([
    "dojo/_base/declare",
    "dijit/registry",
    "ioc/gui/ContentTool",
    "dojo/_base/lang",

], function (declare, registry, ContentTool, lang) {

    return declare([ContentTool], {

        postLoad: function () {
            this.registerToEvent("document_changed", lang.hitch(this, this._onDocumentChanged));
            this.registerToEvent("document_changes_reset", lang.hitch(this, this._onDocumentChangesReset));
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
            // TODO[Xavi] tota la lógica del changes manager s'ha modificar i afegir-la a aquesta classe
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

                this.dispatcher.removeDocument(this.id);
                this.triggerEvent('document_closed', {id: this.id});
            }

            return confirmation;
        },

        onSelect: function () { // onShow()
            this.triggerEvent("document_selected", {id: this.id});
        },

        onUnselect: function () { // onHide()
            this.triggerEvent("document_unselected", {id: this.id});
        }


    });

});

