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

        login: false,

        info: "",

        currentTabId: null,

        /** @type {string} id de la secció seleccionada */
        /**currentSectionId: null,**/

        /** @type {string} id de l'element seleccionat */
        currentElementId: null,

        /** @type {string} id de la pestanya del panell de navegacio seleccionat */
        currentNavigationId: null,

        sectok: null,

        title: "",

        /** @type {InfoStorage} */
        infoStorage: {
            timer:       {
                global:   null,
                document: {}
            },
            currentInfo: {
                global:   null,
                document: {}
            },
            storedInfo:  {
                global:   null,
                document: {}
            }
        },

        /**
         * Node es un node del DOM o una cadena amb el nom de la secció.
         *
         * @param {string|*} node on es troba la nova selecció, o nom de la secció
         */
        setCurrentSectionId: function (node) {
            if (typeof node === "string") {//recibe directamente el id
                this.getCurrentContent().currentSectionId = node;
            } else {
                this.getCurrentContent().currentSectionId = dwPageUi.getIdSectionNode(node);
            }
        },

        /**
         * Aquest mètode es cridat quan es clica una secció i quan es carrega la página.
         *
         * TODO[Xavi] Es cridat dues vegades, abans de fer el canvi i després de fer el canvi a la secció
         * seleccionada. Comprovar que es correcte fer aquestes crides.
         *
         * @returns {null|string} nom de la secció seleccionada
         */
        getCurrentSectionId: function () {
//            var ret = null;
//            if(this.getCurrentContent().currentSectionId){
//                ret = this.getCurrentContent().currentSectionId;
//            }
//            return  ret;
            return this.getCurrentContent().currentSectionId;
        },

        /**
         * Node es un node del DOM o una cadena amb el nom de l'element
         *
         * @param {string|*} node on es troba la nova selecció, o nom de l'element
         */
        setCurrentElementId: function (node, typeId) {
            if (typeof node === "string") {//recibe directamente el id
                this.currentElementId = node;
            } else {
                this.currentElementId = dwPageUi.getElementWhithNodeId(node, typeId);
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
         *
         * @returns {null|string} nom de l'element seleccionat
         */
        getCurrentElementId: function () {
            return this.currentElementId;
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
            return this.currentTabId
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
        }
    };

    return ret;
});

