define([
    "dojo/_base/lang",
    "ioc/dokuwiki/dwPageUi"
], function (lang, dwPageUi) {
    /**
     * @class GlobalState
     */

    /** @typedef {{ns:string, mode:string, action:string}} Page */

    var ret = {
        /**
         * El index del hash es el mateix que el ns, que es el mateix que es mostra a la pestanya
         * @type {{string:Page?}}
         */
        pages: {},

        permissions: {},

        extratabs:{},
        
        login: false,

        info: "",

        currentTabId: null,

        /** @type {string} id de l'element seleccionat */
        currentElementId: null,

        /** @type {string} id de la pestanya del panell de navegacio seleccionat */
        currentNavigationId: null,

        sectok: null,

        title: "",

        /** @type {InfoStorage} */
        infoStorage: {
            timer: {
                global: null,
                document: {}
            },
            currentInfo: {
                global: null,
                document: {}
            },
            storedInfo: {
                global: null,
                document: {}
            }
        },

        /**
         *
         * @param {bool} state
         * @private
         */
        setCurrentElementState: function (state) {
            if (state) {
                this.getCurrentContent().currentElementState = state;
            } else {
                this.getCurrentContent().currentElementState = null;
            }
        },


        setCurrentElement: function (elementId, state) {
            // console.log("GlobalState#setCurrentElement", elementId, state);
            this.setCurrentElementId(elementId);
            this.setCurrentElementState(state);
        },

        /**
         *
         * @private
         * @returns {bool|null}
         */
        getCurrentElementState: function () {
            return this.getCurrentContent().currentElementState;
        },

        getCurrentElement: function () {
            return {
                id: this.getCurrentElementId(),
                state: this.getCurrentElementState()
            };
        },


        /**
         * Node es un node del DOM o una cadena amb el nom de l'element
         *
         * @param {string|DOMNode} node on es troba la nova selecció, o nom de l'element
         * @param {string} typeId
         */
        setCurrentElementId: function (node, typeId) {
            var id = this.getCurrentId();

            if (typeof node === "string") {//recibe directamente el id
                this.pages[id].currentElementId = node;
            } else if (node) {
                this.pages[id].currentElementId = dwPageUi.getElementWhithNodeId(node, typeId);
            } else {
                // S'ha deseleccionat l'element
                this.pages[id].currentElementId = null;
            }
        },

        /**
         *
         * Return dwPageUi
         */

        getDwPageUi: function () {
            return dwPageUi;
        },

        /**
         * Aquest mètode es cridat quan es clica un element i quan es carrega la página.
         *
         * @returns {null|string} nom de l'element seleccionat
         */
        getCurrentElementId: function () {
            var id = this.getCurrentId();

            if (this.pages[id]) {
                return this.pages[id].currentElementId;
            } else {
                return null;
            }
        },

        /**
         * Retorna el nombre de pàgines emmagatzemades a la propietat pages, que es correspon amb el nombre de pestanyes
         * obertes.
         *
         * @returns {Number} nombre de pàgines
         */
        pagesLength: function () {
            return this.contentLength();
        },

        /**
         * Es cridat desde scriptsRef.tpl i retorna una instancia d'aquest objecte afegint les dades del objete passat
         * com argument. Les dades son obtingudes del sessionStorage si existeix.
         *
         * @param {Object.<*>} p dades a afegir a aquesta instancia.
         */
        newInstance: function (p) {
            var instance = Object.create(this);
            lang.mixin(instance, p);
            return instance;
        },

        contentLength: function () {
            return Object.keys(this.pages).length;
        },

        getContentMode: function (id) {
            return this.getContent(id)["mode"];
        },

        getContentNs: function (id) {
            return this.getContent(id)["ns"];
        },

        getContentAction: function (id) {
            return this.getContent(id)["action"];
        },

        getContent: function (id) {
            var ret = undefined;

            if (this.pages[id]) {
                ret = this.pages[id];
            } else {
                ret = this.pages[id] = {};
                //console.error("Creada nova pàgina buida per: ", id);
            }
            return ret;
        },

        getCurrentContent: function () {
            return this.getContent(this.currentTabId);
        },

        getCurrentId: function () {
            return this.currentTabId;
        },


        /**
         * Retorna el magatzem de informació.
         *
         * @returns {InfoStorage}
         */
        getInfoStorage: function () {
            return this.infoStorage;
        },

        /**
         * Estableix el magatzem de informació passat com argument com l'actual.
         *
         * @param {InfoStorage} infoStorage
         */
        setInfoStorage: function (infoStorage) {
            this.infoStorage = infoStorage;
        },


        /**
         * Retorna la id de la pestanya del panell de navegació actual
         * @returns {string}
         */
        getCurrentNavigationId: function () {
            return this.currentNavigationId;
        },

        /**
         * Estableix el id de la pestanya del panell de navegació activa
         * @param {string} navigationId
         */
        setCurrentNavigationId: function (navigationId) {
            this.currentNavigationId = navigationId;
        },

        deleteContent: function (id) {
            if (this.pages[id]) {
                delete this.pages[id];
            }
        },
        
        getExtraTab:function(id){
            return this.extratabs[id];
        },
        
        addExtraTab:function(id){
            this.extratabs[id]=true;
        },
        
        removeExtraTab:function(id){
            delete this.extratabs[id];
        },

        requiredPages: {},

        /**
         * Retorna cert si s'ha pogut reclamar la pàgina o fals en cas contrari
         * @param contentTool
         * @returns {boolean}
         */
        requirePage: function (contentTool) {
            console.log("GlobalState#requirePage", contentTool.id);

            if (!this.requiredPages[contentTool.ns] || this.requiredPages[contentTool.ns] == contentTool.id){
                this.requiredPages[contentTool.ns] = contentTool.id;
                return true;
            }  else {

                var id = this.requiredPages[contentTool.ns],
                    owner = contentTool.dispatcher.getContentCache(id).getMainContentTool();

                owner.registerObserverToEvent(contentTool, owner.eventName.FREE_DOCUMENT, contentTool.requirePageAgain.bind(contentTool));

                return false;
            }

        },

        freePage: function (id, ns) {
            console.log("Alliberat id:",id,"ns:", ns);
            if (this.requiredPages[ns] && this.requiredPages[ns] === id) {
                delete this.requiredPages[ns];

                // TODO[Xavi] disparar l'event "freePage" indicant el "ns" del document
            }
        }
    };

    return ret;
});

