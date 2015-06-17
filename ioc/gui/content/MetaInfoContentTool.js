define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "ioc/gui/content/ContentTool"
], function (declare, lang, ContentTool) {

    return declare([ContentTool],
        /**
         * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
         *
         * S'ha deixat com un fitxer independent per facilitar la seva edició i no pot comptarse amb que sigui accesible
         * en el futur.
         *
         * Aquesta classe extend el ContentTool per realitzar la gestió correcta dels documents disparant els
         * esdeveniments adequats quan hi ha canvis, es reinicien els canvis o es tanca el document a més de exposar
         * el mètode setCurrentMètode() que estableix aquest document com actiu per a la aplicació.
         *
         * @class DocumentContentTool
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
                   //console.log("MetaInfoContentTool#onSelect");
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

                    this.registerToEvent(observed, "destroy", lang.hitch(this, this._onContentDestroyed));
                    this.registerToEvent(observed, "document_selected", lang.hitch(this, this._onDocumentSelected));
                    this.registerToEvent(observed, "document_unselected", lang.hitch(this, this._onDocumentUnselected));

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