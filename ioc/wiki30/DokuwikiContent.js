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


            editor: null,

            aceEditorOn: false,

            wrapperOn: true,

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
                constructor: function(params) {

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

            setEditor: function (editor) {
                this.editor = editor;
            },

            getEditor:       function () {
                return this.editor;
            },


            // TODO[Xavi] No es crida enlloc?
            setDocumentHTML: function (content) {
                alert("setDocumentHTML");
                this.documentHTML = content.content;
            },

            // TODO[Xavi] No es crida enlloc?
            setDocumentWiki: function (content) {
                alert("setDocumentWiki");
                this.documentWiki = content.content;
            },

            /**
             *
             * @returns {boolean}
             */
            isAceEditorOn: function () {
                return this.aceEditorOn;
            },

            /**
             *
             * @param {boolean} on
             */
            setAceEditorOn: function (on) {
                this.aceEditorOn = on;
            },

            /**
             *
             * @returns {boolean}
             */
            isWrapperOn: function () {
                return this.wrapperOn;
            },

            /**
             *
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
            mainContentTool : null,

            setMainContentTool:  function (observer) {
                this.mainContentTool = observer;
            },

            getMainContentTool: function () {
                return this.mainContentTool;
            }
        });

    return DokuwikiContent;
});
