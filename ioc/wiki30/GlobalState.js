define([
    "dojo/_base/lang",
    "ioc/dokuwiki/dwPageUi",
    'ioc/wiki30/manager/StorageManager',
], function (lang, dwPageUi, storageManager) {
    /**
     * @class GlobalState
     */

    /** @typedef {{ns:string, mode:string, action:string}} Page */


    var globalStateId = new Date().getTime();


    var ret = {
        /**
         * El index del hash es el mateix que el ns, que es el mateix que es mostra a la pestanya
         * @type {{string:Page?}}
         */

        pages: {},

        permissions: {},

        extratabs: {},

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

        getExtraTab: function (id) {
            return this.extratabs[id];
        },

        addExtraTab: function (id) {
            this.extratabs[id] = true;
        },

        removeExtraTab: function (id) {
            delete this.extratabs[id];
        },

        requiredPages: {},

        /**
         * Retorna cert si s'ha pogut reclamar la pàgina o fals en cas contrari
         * @param contentTool
         * @returns {boolean}
         */
        requirePage: function (contentTool) {
            console.log("GlobalState#requirePage", contentTool.id, globalStateId);

            // console.log("Es troba lliure el document??", this.requiredPages[contentTool.ns]);


            if (!this.isPageRequired(contentTool.ns) || this.requiredPages[contentTool.ns] === contentTool.id) {
                this.requiredPages[contentTool.ns] = {
                    id : contentTool.id,
                    globalStateId: globalStateId
                };
                this.updateRequiredPagesState();
                return true;
            } else {

                var id = this.requiredPages[contentTool.ns],
                    contentCache = contentTool.dispatcher.getContentCache(id),
                    owner;


                if (contentCache) {
                    owner = contentCache.getMainContentTool();
                    owner.registerObserverToEvent(contentTool, owner.eventName.FREE_DOCUMENT, contentTool.requirePageAgain.bind(contentTool));
                } else {
                    console.error("No s'ha trobat el content cache per", contentTool);
                }

                return false;
            }

        },

        freePage: function (id, ns) {

            if (this.requiredPages[ns]
                && this.requiredPages[ns]['id'] === id
                && this.requiredPages[ns]['globalStateId'] === globalStateId) {
                // console.log("Alliberat id:",id,"ns:", ns);
                delete this.requiredPages[ns];
                this.updateRequiredPagesState();
            }
        },

        freeAllPages: function () {
            var storedPages = storageManager.getObject('requiredPages', storageManager.type.LOCAL);
            if (storedPages && storedPages.userId === this.userId) {
                // console.log("Alliberant pàgines");

                for (var ns in storedPages.requiredPages) {
                    if (storedPages.requiredPages[ns]['globalStateId'] === globalStateId) {
                        // console.log("alliberant", ns);
                        delete(storedPages.requiredPages[ns]);
                    }
                }

                this.requiredPages = storedPages.requiredPages;


                this.updateRequiredPagesState();
            }
        },

        isPageRequired: function (ns) {
            var storedPages = storageManager.getObject('requiredPages', storageManager.type.LOCAL);


            if (storedPages && storedPages.userId === this.userId) {
                this.requiredPages = storedPages.requiredPages;

            } else {
                // Si les págines guardades no són de l'usuari actual s'actualitza el localstorage
                this.updateRequiredPagesState();
                return false;
            }



            return storedPages.requiredPages[ns] ? true : false;
            // return this.requiredPages[ns] ? true : false;
        },


        updateLoginState: function (userId, loginResult) {
            console.log("Cridat en fer logout?");
            this.userId = userId;
            this.login = loginResult;

            // Afegim les dades noves que han de persistir entre sessions

            storageManager.setObject('login', {
                    userId: this.userId,
                    login: this.login
                },
                storageManager.type.LOCAL);


        },

        updateRequiredPagesState: function () {
            storageManager.setObject('requiredPages', {
                userId: this.userId,
                requiredPages: this.requiredPages
            }, storageManager.type.LOCAL);

        },

        updateStorage: function () {
            console.log("_updateStorage");
            // Update del sessionStorage, això és el que es fa ara en recarregar la pàgina
            storageManager.setObject('globalState', this);


            // TODO: Documents en edició?  <--- Al ChangesManagerCentral

            // TODO: Documents amb canvis? <--- Al ChangesManagerCentral


        },

    };

    return ret;
});

