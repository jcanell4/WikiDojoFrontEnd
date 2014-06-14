define([
    /*"dojo/_base/declare"
     ,*/
    "dojo/_base/lang",
    "ioc/dokuwiki/dwPageUi"
], function (/*declare,*/ lang, dwPageUi) {
    //    var ret = declare("ioc.wiki30.GlobalState", [], {
    var ret = {
        /**
         * El index del hash es el mateix que el ns, que es el mateix que es mostra a la pestanya
         * @type {Object.<{ns: string, node: string, action: string}>}
         */
        pages:            {},        //{[pageId]: {ns, mode, action}}
        login:            false,
        info:             "",
        currentTabId:     null,
        /** @type {string} id de la secció seleccionada */
        currentSectionId: null,
        sectok:           null,
        title:            "",

        /**
         * Node es un node del DOM o una cadena amb el nom de la secció.
         * TODO[Xavi] lang.isxxx seran @deprecated a la 2.0 substituir per typeof node == "string"
         * http://dojotoolkit.org/reference-guide/1.9/releasenotes/migration-2.0.html#releasenotes-migration-2-0-testing-object-types
         *
         * TODO[Xavi] Sembla que mai es cridat com a string, en tots els casos que he vist es passa un node
         *
         * @param {string|*} node on es troba la nova selecció, o nom de la secció
         */
        setCurrentSectionId: function (node) {
            if (lang.isString(node)) {//recibe directamente el id
                alert("setCurrentSection");
                this.currentSectionId = node;
            } else {
                this.currentSectionId = dwPageUi.getIdSectionNode(node);
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
            return this.currentSectionId;
        },

        /**
         * Retorna el nombre de pàgines emmagatzemades a la propietat pages, que es correspon amb el nombre de pestanyes
         * obertes.
         *
         * @returns {Number} nombre de pàgines
         */
        pagesLength: function () {
            return Object.keys(this.pages).length
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

        /**
         * TODO[Xavi] No trobo que això sigui cridat ni instanciat en lloc.
         *
         * @param o
         * @param nom
         * @constructor
         */
        ImprimirObjeto: function (o, nom) {
            var salida = nom + '\n\n';
            for (var p in o) {
                salida += '• ' + p + ': ' + o[p] + '\n\n';
            }
            alert(salida);
        }
    };
    //    });
    return ret;
});
