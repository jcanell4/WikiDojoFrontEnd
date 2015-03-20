define([
    "dojo/_base/declare"
], function (declare) {
    var DokuwikiContent = declare("ioc.wiki30.DokuwikiContent", [],
        /**
         * @class DokuwikiContent
         * @author Josep Cañellas <jcanell4@ioc.cat>
         */
        {
            /** @type {string} */
            id: null,

            //		,title: null
            //		,documentHTML: null
            //		,documentWiki: null

            /**
             * Emmagatzema un hash amb les metadates de la pàgina seleccionada.
             * El content es una cadena amb el codi html per mostrar.
             * El id es una cadena amb la id que es fa servir com a index del hash.
             * El title es el títol que es mostra com a capçalera del widget que mostra les metadates
             *
             * @type {ContentTool}
             */
            metaData: null,

            editor: null,

            aceEditorOn: false,

            wrapperOn: true,

            /** @type  {Object.<string, string>} Hash de ids organitzadas per {tipus : valor} */
            currentIds: {},

            revisions: null,

            //info: [],

            /**
             * Es construeix un objecte d'aquest tipus per cada pestanya que es carrega.
             *
             * TODO[Xavi] Sembla que hi ha un error, o s'està passant un objecte i hauria de ser un string, o s'està
             * assignant l'objecte en lloc del string que porta com id. DE VEGADES ARRIBA D
             *
             * @param {{id: string}|string} id - objecte anonim amb una cadena
             * @constructor
             */
            constructor: function (id) {
                this.inherited(arguments); // TODO[Xavi] te cap efecte? el constructor de la superclasse es crida automàticament

                if (typeof id === "string") {
                    this.id = id
                } else if (typeof id.id === "string") {
                    this.id = id.id
                } else {
                    throw new Error("no es reconeix el tipus de id");
                }

                this.metaData = {};
                this.currentIds = {};
                //this.info = [];
                this.revisions = {};
            },

            /**
             *
             * @returns {string}
             */
            getId: function () {
                return this.id;
            },

            /**
             * Afegeix les metadades passades com argument i es fa servir el id com a index al hash on es guarda.
             * Es cridat cada vegada que es carrega una pestanya, per exemple al carregar la pàgina o al obrir una nova
             * pàgina.
             *
             * @param {ContentTool} content objecte amb les metadades a afegir.
             */
            putMetaData: function (content) {
                if (content.getParent()) {
                    console.log("Error, s'ha de guardar la metadata abans d'afegir-la el ContentTool al contenidor");
                    throw new Error("Error, s'ha de guardar la metadata abans d'afegir-la el ContentTool al contenidor");
                }

                this.metaData[content.id] = jQuery.extend(true, {}, content);
            },

            /**
             * Es crida al canviar de pestanya. Si es pasa la id retorna només l'element corresponent a la id, en cas
             * contrari es retorna tot el hash de metaData.
             *
             * @param {string?} id corresponent a la metadata
             *
             * @returns {Object.<{content: string, id: string, tittle: string}>|{content: string, id: string, tittle: string}}
             * la metadada corresponent al id o el hash complet de metadades
             */
            getMetaData: function (id) {
                //return lang.clone(id ? this.metaData[id] : this.metaData);

                return jQuery.extend(true, {}, id ? this.metaData[id] : this.metaData);

                //return id ? jQuery.extend(true, {}, this.metaData[id]) : this._getAllMetaData();
            },

            /**
             * Retornem les metadates però clonant cadascuna
             *
             * @private
             */
            _getAllMetaData: function () {
                var allMeta = {};

                for (var m in this.metaData) {
                    allMeta[m] = jQuery.extend(true, {}, this.metaData[m]);
                }

                return allMeta;
            },

            setEditor: function (editor) {
                this.editor = editor;
            },

            getEditor: function () {
                return this.editor;
            },

            /**
             * Elimina totes les metadadtes del objecte actual.
             */
            removeAllMetaData: function () {
                this.metaData = {};
            },

            // TODO[Xavi] No es crida enlloc?
            setDocumentHTML:   function (content) {
                alert("setDocumentHTML");
                this.documentHTML = content.content;
            },

            // TODO[Xavi] No es crida enlloc?
            setDocumentWiki:   function (content) {
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
                this.metaData[id]["content"] = content;
            },

            /**
             * Guarda la id del panell del tipus passat com argumetn com l'actual per aquest tipus.
             *
             * @param {string} type - tipus del panell que volem guardar com actual
             * @param {string} value - id del panell que volem guardar com actual
             */
            setCurrentId: function (type, value) {
                this.currentIds[type] = value;

            },

            /**
             * Retorna la id del panell actual corresponent al tipus passat per argument.
             *
             * @param {string} type - tipus de pannel del que volem recuperar la id
             * @returns {string} - id del panell actual
             */
            getCurrentId: function (type) {
                return this.currentIds[type]
            }
        });

    return DokuwikiContent;
});
