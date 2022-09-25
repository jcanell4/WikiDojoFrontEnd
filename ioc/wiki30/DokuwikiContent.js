define([
    "dojo/_base/declare"
], function (declare) {
    var DokuwikiContent = declare(null,
        /**
         * @class DokuwikiContent
         * @author Josep Cañellas <jcanell4@ioc.cat>, Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            /** @type {string} */
            id: null,

            //		,title: null
            //		,documentHTML: null
            //		,documentWiki: null


            editor: null, // TODO[Xavi] eliminar, ja no s'ha de controlar aqui

            aceEditorOn: false, // TODO[Xavi] eliminar, ja no s'ha de controlar aqui

            wrapperOn: true, // TODO[Xavi] eliminar, ja no s'ha de controlar aqui

            /** @type  {Object.<string, string>} Hash de ids organitzadas per {tipus : valor} */
            currentIds: null,

            /** @type {Revisions} */
            revisions: null,

            /**
             * Crea un objecte que guarda la informació lligada a un document. Es pot crear passant només la id del
             * document o un objecte amb un hash de configuració per exemple:
             *      {
             *          id: 'id del document,
             *          rev: 'revisió del document'
             *      }
             *
             * @param {Object.<string, string>|string} params - id o objecte de configuració
             * @constructor
             */
            constructor: function (params) {

                if (typeof params === "string") {
                    this.id = params;
                } else {
                    declare.safeMixin(this, params);
                }


                this.currentIds = {};

                this.revisions = {};
            },

            /**
             *
             * @returns {string}
             */
            getId: function () {
                return this.id;
            },

            // TODO[Xavi] eliminar, ja no s'ha de controlar aqui
            setEditor: function (editor) {
                this.editor = editor;
            },

            // TODO[Xavi] eliminar, ja no s'ha de controlar aqui
            getEditor: function () {
                return this.editor;
            },


            // TODO[Xavi] No es crida enlloc? no ho he vist funcionar en més de 9 anys!
            setDocumentHTML: function (content) {
                alert("setDocumentHTML");
                this.documentHTML = content.content;
            },

            // TODO[Xavi] No es crida enlloc? no ho he vist funcionar en més de 9 anys!
            setDocumentWiki: function (content) {
                alert("setDocumentWiki");
                this.documentWiki = content.content;
            },

            /**
             * TODO[Xavi] eliminar, ja no s'ha de controlar aqui
             * @returns {boolean}
             */
            isAceEditorOn: function () {
                return this.aceEditorOn;
            },

            /**
             * TODO[Xavi] eliminar, ja no s'ha de controlar aqui
             * @param {boolean} on
             */
            setAceEditorOn: function (on) {
                this.aceEditorOn = on;
            },

            /**
             * TODO[Xavi] eliminar, ja no s'ha de controlar aqui
             * @returns {boolean}
             */
            isWrapperOn: function () {
                return this.wrapperOn;
            },

            /**
             * TODO[Xavi] eliminar, ja no s'ha de controlar aqui
             * @param {boolean} on
             */
            setWrapperOn: function (on) {
                this.wrapperOn = on;
            },


            /**
             * Reemplaça el contingut de la metadata amb el id i els  continguts passats com argument.
             *
             * @param {string} id - id de la metadada a reemplaçar
             * @param {string} content - contingut amb el que es reemplaçarà la metadata actual
             */
            replaceMetaDataContent: function (id, content) {
                this.metaData[id].set('data', content);
            },

            /**
             * Guarda la id del panell del tipus passat com argumetn com l'actual per aquest tipus.
             *
             * @param {string} type - tipus del panell que volem guardar com actual
             * @param {string} value - id del panell que volem guardar com actual
             */
            setCurrentId: function (type, value) {
                //alert("setted: " + value+ " for document: " +this.id);
                this.currentIds[type] = value;

            },

            /**
             * Retorna la id del panell actual corresponent al tipus passat per argument.
             *
             * @param {string} type - tipus de pannel del que volem recuperar la id
             * @returns {string} - id del panell actual
             */
            getCurrentId: function (type) {
                //alert("getted: " + this.currentIds[type]);
                return this.currentIds[type]
            },


            /** @type EventObserver */
            mainContentTool: null,

            setMainContentTool: function (observer) {
                this.mainContentTool = observer;
            },

            getMainContentTool: function () {
                return this.mainContentTool;
            },

            getCurrentEditor: function () {
                this.mainContentTool.getEditor()
            }
        });

    return DokuwikiContent;
});
