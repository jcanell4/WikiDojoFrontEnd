define([
    "dojo/_base/declare",
    "ioc/wiki30/DokuwikiContent",
], function (declare, DokuwikiContent) {

    return declare(null,
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
            /**
             * Aquest mètode es cridat automàticament al descarregar-se el ContentTool, en aquest cas s'encarrega
             * de que es faci el tancament adequat.
             *
             * Per evitar que es cridi al obrir el document comprovem que el document es trobi al ContentCache.
             *
             * @override
             */
            onDestroy: function () {
                //console.log("DocumentComponent#onDestroy");
                this.removeState();
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
                        "id":  id,
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
                this.addDocument();
            },
            
            /*
             * 
             */
            
            getDocumentId: function(){
                return this.id;
            }
            
        });
});
