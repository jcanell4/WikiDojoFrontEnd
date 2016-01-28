define([
    "dojo/_base/declare",
    "ioc/wiki30/DokuwikiContent",
    "ioc/gui/content/subclasses/LocktimedDocumentSubclass",
    "dijit/registry",

], function (declare, DokuwikiContent, LocktimedDocumentSubclass,registry) {

    return declare([LocktimedDocumentSubclass],
        /**
         * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
         *
         *
         * @class DocumentSubclass
         * @author Xavier García <xaviergaro.dev@gmail.com>
         * @private
         * @see contentToolFactory.generate()
         */
        {

            postAttach: function() {
                // TODO[Xavi] Això no funciona, el content no te dades si no html
                this.inherited(arguments);
                this.updateTitle(this);
            },

            /**
             * Aquest mètode es cridat automàticament al descarregar-se el ContentTool, en aquest cas s'encarrega
             * de que es faci el tancament adequat.
             *
             * Per evitar que es cridi al obrir el document comprovem que el document es trobi al ContentCache.
             *
             * @override
             */
            onDestroy: function () {
                //console.log("DocumentSubclass#onDestroy");
                this.removeState();
                this.inherited(arguments);
            },

            /**
             * Realitza les accions de neteja abans de tancar el document i dispara l'esdeveniment de tancament
             * del document.
             *
             * @override
             */
            removeState: function () {
                var currentTabId = this.dispatcher.getGlobalState().currentTabId;

                if (currentTabId === this.id) {
                    this.dispatcher.getGlobalState().currentTabId = null;
                }

                this.dispatcher.removeDocumentState(this.id);
                //this.dispatchEvent('document_closed', {id: this.id});
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
                //                console.log("DocumentComponent#onUnselect");
                this.dispatchEvent("document_unselected", {id: this.id});
            },

            setCurrentDocument: function () {
                var id = this.id;
                this.dispatcher.getGlobalState().currentTabId = id;
                if (this.dispatcher.getContentCache(id)) {
                    this.dispatcher.getContentCache(id).setMainContentTool(this);
                }
            },

            /**
             *
             * @protected
             * @override
             */
            onAttach: function () {
                //                console.log("DocumentComponent#onAttach");
                this.addDocument();
            },

            /**
             * @protected
             */
            addDocument: function () {

                var id = this.id,
                    ns = this.ns,
                    rev = this.rev,
                    contentCache = this.dispatcher.contentCache,
                    globalState = this.dispatcher.getGlobalState();

                if (!contentCache[id]) {
                    contentCache[id] = new DokuwikiContent({
                        "id": id,
                        "rev": rev
                    });
                }

                globalState.getContent(id).ns = ns;

                this.getContainer().selectChild(this);
                this.setCurrentDocument();
            },

            /**
             *
             * @param content
             */
            updateDocument: function (content) {
                this.setData(content.content);
                this.updateTitle(content.content);
                this.render();
                this.addDocument();
            },

            getDocumentId: function () {
                return this.id;
            },

            /**
             * TODO[Xavi] Generalitzar, compartit per tots els editors de documents que suportin control de versions (duplicat a StructuredDocumentSubclass)
             *
             * @param content
             */
            updateTitle: function (content) {
                var title = content.title;

                if (content.rev) {
                    title += " - Revisió (" + content.rev + ")";
                }

                this.controlButton.set("label", title); // controlButton es una propietat heretada de Dijit.ContentPane
            },


        });
});
