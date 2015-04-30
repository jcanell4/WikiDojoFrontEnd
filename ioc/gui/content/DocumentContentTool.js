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

                //this.dispatcher.getChangesManager().resetDocumentChangeState(this.id); //TODO[xavi] Aquests documents no poden canviar, el onclose dels que canvian ha de sobrescriure aquest
                this.dispatcher.removeDocument(this.id);
                this.triggerEvent('document_closed', {id: this.id});
            },

            /**
             * Dispara l'esdeveniment de selecció del document.
             *
             * @override
             */
            onSelect: function () {
                this.dispatchEvent("document_selected", {id: this.id});
            },

            /**
             * Dispara l'esdeveniment de des-selecció del document.
             *
             * @override
             */
            onUnselect: function () {
                this.dispatchEvent("document_unselected", {id: this.id});
            },

            /**
             * Aquest métode s'encarrega d'establir aquest ContentTool com document actiu
             */
            setCurrentDocument: function (id) {
                this.dispatcher.getGlobalState().currentTabId = id;
                this.dispatcher.getContentCache(id).setMainContentTool(this);
                this.dispatchEvent("document_selected", {id: id});
            }
        });
});