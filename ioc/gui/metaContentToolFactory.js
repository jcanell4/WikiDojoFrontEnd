define([
    "dojo/_base/declare",
    "dojo/_base/lang",

], function (declare, lang) {

    /**
     * Aquesta classe requereix que es faci un mixin amb un ContentTool per poder funcionar.
     *
     * @class MetaContentTool
     */
    var MetaContentTool = declare(null, {

        /** @override */
        postLoad: function () {

            this.registerToEvent("document_closed", lang.hitch(this, this._onDocumentClosed));
            this.registerToEvent("document_selected", lang.hitch(this, this._onDocumentSelected));
            this.registerToEvent("document_unselected", lang.hitch(this, this._onDocumentUnselected));


            this.watch("selected", function (name, oldValue, newValue) {
                var contentCache = this.dispatcher.getContentCache(this.docId);

                if (newValue) {
                    console.log("selected POSTLOAD:", this.id);

                    if (contentCache) {
                        contentCache.setCurrentId("metadataPane", this.id)
                    }

                }
            })


        },

        /** @private */
        _onDocumentClosed: function (data) {
            var parent;

            if (data.id == this.docId) {

                parent = this._getContainer();
                parent.removeChild(this);
                this.destroyRecursive();
                console.log(this);

            }
        },

        /** @private */
        _onDocumentSelected: function (data) {
            var selectedPane,
                parent;


            if (data.id == this.docId && this.domNode) {

                if (this.action == data.action) {
                    this.showContent();
                    selectedPane = this.dispatcher.getContentCache(this.docId).getCurrentId('metadataPane');

                    if (selectedPane == this.id) {
                        parent = this._getContainer();
                        parent.selectChild(this);
                        console.log("Selected child: ", parent.get('selectedChildWidget'));
                    }


                } else {
                    //this.hideContent(); // TODO[Xavi] Per determinar exactament com cal mostrar-los
                }

            }
        },

        /** @private */
        _onDocumentUnselected: function (data) {
            if (data.id == this.docId && this.domNode) {
                this.hideContent();
            }
        }


    });


    return {
        buildMetaContentTool: function (contentTool) {
            return declare.safeMixin(contentTool, new MetaContentTool);
        }
    }


});