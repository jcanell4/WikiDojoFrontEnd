define([
    "dojo/_base/lang",
    "ioc/dokuwiki/dwPageUi",
    'ioc/wiki30/manager/StorageManager',
    'dojo/cookie'
], function (lang, dwPageUi, storageManager, cookie) {
    /**
     * @class GlobalState
     */

    /** @typedef {{ns:string, mode:string, action:string}} Page */

    var globalStateId = new Date().getTime();

    // ALERTA[Xavi] En cas de que no existeixi la cookie es que s'han tancat totes les finestres o s'ha tancat el
    // navegador, en aquest cas cal fer neteja dels storage temporals com 'requiredPages' i 'changedPages'.
    var isGlobalCookieSet = cookie('globalSessionStorage'),
        globalSessionStorageItems = ['requiredPages', 'changedPages', 'login'];

    if (!isGlobalCookieSet) {
        // console.log("No s'ha trobat la cookie global");
        cookie('globalSessionStorage', true);

        for (var i = 0; i < globalSessionStorageItems.length; i++) {
            storageManager.removeItem(globalSessionStorageItems[i], storageManager.type.LOCAL);
        }
    }

    var ret = {
        /**
         * El index del hash es el mateix que el ns, que es el mateix que es mostra a la pestanya
         * @type {{string:Page?}}
         */
        pages: {},

        permissions: {},

        extratabs:{},

        login: false,
        moodleToken: null,
        
        info: "",

        currentTabId: null,

        /** @type {string} id de l'element seleccionat */
        currentElementId: null,

        /** @type {string} id de la pestanya del panell de navegacio seleccionat */
        currentNavigationId: null,

        sectok: null,

        title: "",

        userState: null,
        
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
            // console.log("GlobalState#setCurrentElementState", state);
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

        getIsProjectManager: function() {
            return this.permissions.isadmin || this.permissions.ismanager || this.permissions.isprojectmanager;
        },
        
        getIsManager: function() {
            return this.permissions.isadmin || this.permissions.ismanager;
        },
        
        /**
         * Node es un node del DOM o una cadena amb el nom de l'element
         *
         * @param {string|DOMNode} node on es troba la nova selecció, o nom de l'element
         * @param {string} typeId
         */
        setCurrentElementId: function (node, typeId) {
            var id = this.getCurrentId();

            if (!this.pages[id]) {
                // No es tracta d'un document
                return;
            }

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


            // Aquest cas es dona quan no hi ha cap document
            if (id === null) {
                ret = {};
            } else if (this.pages[id]) {
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

        getCurrentNs: function () {
            return this.pages[this.currentTabId].ns
            // return this.currentTabId.split('_').join(':');
        },

        // ALERTA[Xavi] en molts punts s'assigna aquest valor directament
        setCurrentId: function(id) {
            this.currentTabId = id;
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
         * Retorna el magatzem del userSate.
         *
         * @param {key} key del userSate
         * 
         * @returns {userState[key]} o {userState} si {key} és undefined
         */
        getUserState: function (key) {
            var ret;
            if(key===undefined){
                ret = this.userState;
            }else if(this.userState){
                ret = this.userState[key];
            }
            return ret;
        },

        /**
         * Modifica el valor del magatzem del userState passat com argument com l'actual.
         * @param key key del userSate
         * @param value valor a modificar per la key passada
         */
        setUserState: function (key, value) {
            if(this.userState==null){
                this.userState={};
            }
            this.userState[key] = value;
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

        // requiredPages: {},

        /**
         * Retorna cert si s'ha pogut reclamar la pàgina o fals en cas contrari
         * @param contentTool
         * @returns {boolean}
         */
        requirePage: function (contentTool) {
            // console.log("GlobalState#requirePage", contentTool.id, globalStateId);


            if (!this.isPageRequired(contentTool.ns, contentTool.id)) {

                this.addRequirePageToStore(contentTool.ns, contentTool.id, globalStateId);

                return true;

            } else {


                // var id = this.getIdForRequiredPageOwned(contentTool.ns),
                //     contentCache = contentTool.dispatcher.getContentCache(id),
                //     owner;
                //
                //
                // if (contentCache) {
                //     // Només ens enregistrem si s'ha trobat el content tool
                //     owner = contentCache.getMainContentTool();
                //     console.log("enregistrant el requirePageAgain");
                //     owner.registerObserverToEvent(contentTool, owner.eventName.FREE_DOCUMENT, contentTool.requirePageAgain.bind(contentTool));
                // }

                return false;
            }

        },

        // ALERTA[Xavi] només es retorna l'id si el document està requerit per aquesta finestra
        // getIdForRequiredPageOwned: function (ns) {
        //     var storedPages = storageManager.getObject('requiredPages', storageManager.type.LOCAL);
        //
        //     if (storedPages
        //         && storedPages.requiredPages
        //         && storedPages.requiredPages[ns]
        //         && storedPages.requiredPages[ns].globalStateId === globalStateId) {
        //         return this.getIdForRequiredPage(ns);
        //     }
        // },


        getIdForRequiredPage: function (ns) {
            var storedPages = storageManager.getObject('requiredPages', storageManager.type.LOCAL);

            if (storedPages && storedPages.requiredPages && storedPages.requiredPages[ns]) {
                return storedPages.requiredPages[ns]['id']
            } else {
                return null;
            }
        },

        addRequirePageToStore: function (ns, id, globalStateId) {
            // console.log("GlobalState#addRequirePageToStore", ns, id, globalStateId);
            var storedPages = storageManager.getObject('requiredPages', storageManager.type.LOCAL);

            if (!storedPages) {
                storedPages = {
                    userId: this.userId,
                    requiredPages: {}
                };
            }

            storedPages.requiredPages[ns] = {
                id: id,
                globalStateId: globalStateId
            };

            this.updateRequiredPagesState(storedPages);

        },


        freePage: function (id, ns) {
            // console.log("GlobalState#freePage", id, ns, globalStateId);

            var storedPages = storageManager.getObject('requiredPages', storageManager.type.LOCAL);

            if (this.getIdForRequiredPage(ns) === id
                && storedPages.requiredPages[ns]['globalStateId'] === globalStateId) {

                delete storedPages.requiredPages[ns];
                this.updateRequiredPagesState(storedPages);
            } else {
                // console.log("** no s'ha alliberat id:", id, storedPages);
            }
        },

        freeAllPages: function (ignoreGlobalStateId) {
            var storedPages = storageManager.getObject('requiredPages', storageManager.type.LOCAL);
            if (storedPages && storedPages.userId === this.userId) {

                for (var ns in storedPages.requiredPages) {
                    if (storedPages.requiredPages[ns]['globalStateId'] === globalStateId || ignoreGlobalStateId) {
                        // console.log("alliberant", ns);
                        delete(storedPages.requiredPages[ns]);
                    }
                }

                this.requiredPages = storedPages.requiredPages;
                this.updateRequiredPagesState(storedPages);
            }
        },

        getAllRequiredPagesNS: function() {
            //console.log("GlobalState#getAllRequiredPagesNS");
            var storedPages = storageManager.getObject('requiredPages', storageManager.type.LOCAL);
            var requiredPagesNS = [];

            if (storedPages && storedPages.userId === this.userId) {


                for (var ns in storedPages.requiredPages) {
                    requiredPagesNS.push(ns);
                }

            }

            return requiredPagesNS;
        },



        updateRequiredPagesState: function (storedPages) {
            // console.log("GlobalState#updateRequiredPagesState", storedPages);
            storageManager.setObject('requiredPages', storedPages, storageManager.type.LOCAL);
        },

        /**
         * ALERTA[Xavi] Actualment el id no es necessari perquè sempre serà el mateix (abans podia ser el id del document o la revisió perqué eran editables)
         */
        isPageRequired: function (ns, id) {
            var storedPages = storageManager.getObject('requiredPages', storageManager.type.LOCAL),
                isRequired;
            // console.log("GlobalState#isPageRequired", ns, id, storedPages.requiredPages[ns]);

            if (!this.userId) {
                // L'usuari no es troba loginat, no pot modificar. ALERTA[Xavi] Això passa per algunes pestanyes sense cap efecte, per exemple la pestanya de dreceres
                return true;

            } else if (storedPages && storedPages.userId === this.userId) {
                // L'estore correspon a l'usuari actual
                // console.log("TROBAT: Trobat storage per l'usuari actual");
            } else {
                // console.log("REEMPLAÇ: L'storage no és de l'usuari o no existeix, el reemplacem");
                // Si les págines guardades no són de l'usuari actual s'inicialitza l'storage
                storageManager.setObject('requiredPages', {
                    userId: this.userId,
                    requiredPages: {}
                }, storageManager.type.LOCAL);
            }

            if (id) {
                isRequired = (storedPages && storedPages.requiredPages[ns] && storedPages.requiredPages[ns]['id'] === id) ? true : false;
            } else {
                isRequired = (storedPages && storedPages.requiredPages[ns]) ? true : false;
            }

            // En cas que la pàgina estiguir requerida per la mateixa aplicació es considerarà lliure (per exemple, per les edicions parcials)
            var isPageRequiredByCurrentApp = storedPages && storedPages.requiredPages[ns] && storedPages.requiredPages[ns]['globalStateId'] === globalStateId;

            // console.log("Pàgina requerida?", !isPageRequiredByCurrentApp);
            return isRequired && !isPageRequiredByCurrentApp;
        },

        getLoginState: function(key) {
            var ret = null;
            if (localStorage.login) {
                var login = JSON.parse(localStorage.login);
                ret = (key) ? login[key] : login;
            }
            return ret;
        },

        updateLoginState: function (userId, loginResult, moodleToken) {
            this.userId = userId;
            this.login = loginResult;
            this.moodleToken = moodleToken;

            // Afegim les dades noves que han de persistir entre sessions
            storageManager.setObject('login',
                                     {userId: this.userId,
                                      login: this.login,
                                      moodleToken: this.moodleToken
                                     },
                                     storageManager.type.LOCAL);
        },

        updateSessionStorage: function () {
            // Update del sessionStorage, això és el que es fa ara en recarregar la pàgina
            if (this.pages && this.pages[""]) {
                console.warn("S'ha trobat un pàgina amb id buit");
                delete (this.pages[""]);
            }
            storageManager.setObject('globalState', this);
        },

        isAnyPageChanged: function () {
            var storedChangedPages = storageManager.getObject('changedPages', storageManager.type.LOCAL);

            if (this.userId && storedChangedPages && storedChangedPages.userId === this.userId) {
                //console.log("GlobalState#isAnyPageChanged", Object.keys(storedChangedPages.pages).length > 0);
                return Object.keys(storedChangedPages.pages).length > 0;
            } else {
                //console.log("GlobalState#isAnyPageChanged", false);
                return false;
            }
        }

    };


    window.testAnyPageChanged = ret.isAnyPageChanged.bind(ret);

    return ret;
});

