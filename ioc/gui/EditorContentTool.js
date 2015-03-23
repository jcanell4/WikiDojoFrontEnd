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
            this.registerToEvent("test", function () {
                alert("triggered test");
            });
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

                // TODO[Xavi] fer que els widgets s'eliminin a si mateixos al detectar el document_closed!!





                //elimina els widgets corresponents a les metaInfo de la pestanya
                if (currentTabId === this.id) {
                    var nodeMetaInfo = registry.byId(this.dispatcher.metaInfoNodeId);
                    this.dispatcher.getGlobalState().currentTabId = null;

                    //nodeMetaInfo.removeAllWidgets(this.id);

                }

                this.dispatcher.getChangesManager().resetDocumentChangeState(this.id);


                //this.unregisterFromEvents();

                // TODO[Xavi] S'hauria de restaurar la visibilitat dels botons i els panells d'informació <-- Enregistrat als events?



                ////actualitzar globalState
                //delete this.dispatcher.getGlobalState().pages[this.id];
                ////actualitzar contentCache
                //delete this.dispatcher.contentCache[this.id];

                this.dispatcher.removeDocument(this.id);

                this.triggerEvent('document_closed', {id: this.id});
            }

            console.log("onClose finalitzat");
            return confirmation;

        }

        ,

        onUnload: function () {
            this.unregisterFromEvents();
            console.log("onUnload del EditorContentTool");
        },

        onSelect: function () { // onShow()
            this.triggerEvent("document_selected", {id: this.id, extra: "EditorContentTool"});
        },

        onUnselect: function () { // onHide()
            this.triggerEvent("document_unselected", {id: this.id, extra: "EditorContentTool"});
        }


    });

});

