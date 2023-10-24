define([
    "dojo/_base/declare",
    "dojo/_base/lang"
], function (declare, lang) {

    return declare(null,
        /**
         * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
         *
         * @class MetaInfoSubclass
         * @extends ContentTool
         * @author Xavier García <xaviergaro.dev@gmail.com>
         * @private
         * @see contentToolFactory.generate()
         */
        {
            /**
             * Dispara l'esdeveniment que indica que el contingut ha estat seleccionat.
             */
            onSelect: function () {
                //console.log("MetaInfoComponent#onSelect");
                var contentCache = this.dispatcher.getContentCache(this.docId);
                if (contentCache) {
                    contentCache.setCurrentId("metadataPane", this.id)
                }
                this.inherited(arguments);
            },

            /**
             * Accions a realitza desprès de carregar.
             *
             * S'enregistra al document a observar.
             * @override
             * @protected
             */
            postAttach: function () {

                var observed = this.dispatcher.getContentCache(this.docId).getMainContentTool();

                this.registerMeToEventFromObservable(observed, "destroy", lang.hitch(this, this._onContentDestroyed));
                this.registerMeToEventFromObservable(observed, "document_selected", lang.hitch(this, this._onDocumentSelected));
                this.registerMeToEventFromObservable(observed, "document_unselected", lang.hitch(this, this._onDocumentUnselected));

                this.inherited(arguments);
            },

            /**
             * Aquest ContentTool s'elimina
             *
             * @private
             */
            _onContentDestroyed: function (data) {

                if (data.id == this.docId) {
                    this.removeContentTool();
                }
            },

            /**
             * Aquest ContentTool es fa visible.
             *
             * @private
             */
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

            /**
             * Aquest ContentTool s'amaga.
             *
             * @private
             */
            _onDocumentUnselected: function (data) {
                if (data.id == this.docId && this.domNode) {
                    this.hideContent();
                }
            }
        });
});