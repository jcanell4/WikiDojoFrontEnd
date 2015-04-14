define([
    "dojo/_base/declare",
    "dojo/_base/lang",
], function (declare, lang) {

    /**
     * Aquesta classe requereix que es faci un mixin amb un ContentTool per poder funcionar.
     *
     * @class MetaContentTool
     * @extends EventObserver
     */
    var MetaContentTool = declare(null, {


        /**
         * @override
         * @protected
         */
        postLoad: function () {
            //console.log("Postload");
            var observed = this.dispatcher.getContentCache(this.docId).getMainContentTool();
            //console.log("docid: ", this.docId);
            //console.log("observer: ", observed);


            this.registerToEvent(observed, "document_closed", lang.hitch(this, this._onDocumentClosed));
            this.registerToEvent(observed, "document_selected", lang.hitch(this, this._onDocumentSelected));
            this.registerToEvent(observed, "document_unselected", lang.hitch(this, this._onDocumentUnselected));
            //console.log("observer despres de registrar: ", observed);

            this.watch("selected", function (name, oldValue, newValue) {
                var contentCache = this.dispatcher.getContentCache(this.docId);
                if (contentCache) {
                    contentCache.setCurrentId("metadataPane", this.id)
                }
            })
        },

        /** @private */
        _onDocumentClosed: function (data) {
            if (data.id == this.docId) {
                this.removeContentTool();
            }
        },

        /** @private */
        _onDocumentSelected: function (data) {
            var selectedPane,
                parent;


            if (data.id == this.docId && this.domNode) {

                this.showContent();
                selectedPane = this.dispatcher.getContentCache(this.docId).getCurrentId('metadataPane');


                if (selectedPane == this.id) {
                    parent = this.getContainer();
                    parent.selectChild(this);
                }
            }
        },

        /** @private */
        _onDocumentUnselected: function (data) {
            console.log("Rebut unselected");
            if (data.id == this.docId && this.domNode) {
                this.hideContent();
            }
        }
    });

    return {
        decorate: function (contentTool) {
            //return declare.safeMixin(contentTool, new MetaContentTool);
        }
    }

});