define([
    "dojo/_base/declare",
    "ioc/gui/content/ContentTool",
], function (declare, ContentTool) {

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
             * Aquest mètode es cridat automàticament al descarregar-se el ContentTool, en aquest cas s'encarrega
             * de que es faci el tancament adequat.
             *
             * @override
             */
            onUnload: function () {
                this.closeDocument();
            },

            /**
             * Realitza les accions de neteja abans de tancar el document i dispara l'esdeveniment de tancament
             * del document.
             *
             * @override
             */
            closeDocument: function () {
                var currentTabId = this.dispatcher.getGlobalState().currentTabId;

                if (currentTabId === this.id) {
                    this.dispatcher.getGlobalState().currentTabId = null;
                }

                this.dispatcher.removeDocument(this.id);
                this.dispatchEvent('document_closed', {id: this.id});
                this.dispatcher.updateFromState();
            },

            /**
             * Dispara l'esdeveniment de selecció del document.
             *
             * @override
             */
            onSelect: function () {
                this.setCurrentDocument();
                this.dispatcher.getInfoManager().refreshInfo(this.id);
                this.dispatchEvent("document_selected", {id: this.id});
                this.dispatcher.updateFromState();
            },

            /**
             * Dispara l'esdeveniment de des-selecció del document.
             *
             * @override
             */
            onUnselect: function () {
                this.dispatchEvent("document_unselected", {id: this.id});
            },

            setCurrentDocument: function () {
                var id = this.id;
                this.dispatcher.getGlobalState().currentTabId = id;
                if(this.dispatcher.getContentCache(id)){
                    this.dispatcher.getContentCache(id).setMainContentTool(this);
                }
                this.dispatchEvent("document_selected", {id: id}); //[JOSEP] Perquè document_selected es llança a dos llocs diferents?
            }
        });
});