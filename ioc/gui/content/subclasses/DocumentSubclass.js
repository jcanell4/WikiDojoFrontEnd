define([
    "dojo/_base/declare",
    "ioc/wiki30/DokuwikiContent",
    "ioc/gui/content/subclasses/LocktimedDocumentSubclass",
    "dijit/registry"
], function (declare, DokuwikiContent, LocktimedDocumentSubclass, registry) {
    /**
     * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
     *
     * @class DocumentSubclass
     * @author Xavier García <xaviergaro.dev@gmail.com>
     * @private
     * @see contentToolFactory.generate()
     */
    return declare([LocktimedDocumentSubclass],
        {
        postAttach: function() {
            this.inherited(arguments);
            this.dispatcher.updateFromState();
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
            this.dispatcher.updateFromState();

            var infoManager = this.dispatcher.getInfoManager();
            infoManager.refreshInfo();
        },

        /**
         * Dispara l'esdeveniment de selecció del document.
         *
         * @override
         */
        onSelect: function () {
            // console.log("DocumentSubclass#onSelect", this.id);
            this.setCurrentDocument();
            this.dispatcher.getInfoManager().refreshInfo(this.id);
            this.dispatchEvent(this.eventName.DOCUMENT_SELECTED, {id: this.id});

            //ALERTA[Xavi] NS és una variable global utilitzada per la wiki per determinar l'espai de nom a utilitzar quan es puja un fitxer
            NS = this.getFileStorageNS();

            this.dispatcher.updateFromState();
        },

        getFileStorageNS: function () {
            var ns;
            var ignoreLastNSSections;

            // ALERTA[Xavi] Codi de proves, això s'ha d'afegir al constructor i ha de provenir del servidor
            //ALERTA[JOSEP] He fet aquesta modificació provisionalment . Resul
            if(this.ns){
                if (this.ignoreLastNSSections) {
                    ignoreLastNSSections = this.ignoreLastNSSections+1;
                } else {
                    ignoreLastNSSections = 1;
                }
                var tokens = this.ns.split(':');
                tokens = tokens.slice(0, tokens.length-ignoreLastNSSections);
                ns = tokens.join(':');
            }
            return ns;
        },

        /**
         * Dispara l'esdeveniment de des-selecció del document.
         *
         * @override
         */
        onUnselect: function () {
            //console.log("DocumentComponent#onUnselect");
            this.dispatchEvent(this.eventName.DOCUMENT_UNSELECTED, {id: this.id});
        },

        setCurrentDocument: function () {
            var id = this.id;
            this.dispatcher.getGlobalState().currentTabId = id;
            if (this.dispatcher.getContentCache(id)) {
                this.dispatcher.getContentCache(id).setMainContentTool(this);
                this.dispatcher.getInfoManager().refreshInfo(id);
            }
        },

        /**
         * @override
         */
        onAttach: function () {
            //console.log("DocumentComponent#onAttach");
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

        updateDocument: function (content) {
            this.setData(content);
            this.render();
            this.addDocument();
        },

        getDocumentId: function () {
            return this.id;
        }

    });
        
});
