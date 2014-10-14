define([
    "dojo/_base/declare"
], function (declare) {
    // TODO[Xavi] perqué fem servir com a classe base un array buit en lloc de la classe definida aquí i pasem
    // l'objecte com a prop?
    var DokuwikiContent = declare("ioc.wiki30.DokuwikiContent", [],
        /**
         * @class DokuwikiContent
         */
        {
            id: null,
            //		,title: null
            //		,documentHTML: null
            //		,documentWiki: null

            /**
             * Emmagatzema un hash amb les metadates de la pàgina seleccionada.
             * El content es una cadena amb el codi html per mostrar.
             * El id es una cadena amb la id que es fa servir com a index del hash.
             * TODO[Xavi] El title es el títol que es mostra com a capçalera del widget que mostra les metadates?
             *
             * @type {Object.<{content: string, id: string, tittle: string}>}
             */
            metaData: null,

            /**
             * Es construeix un objecte d'aquest tipus per cada pestanya que es carrega.
             *
             * TODO[Xavi] Sembla que hi ha un error, o s'està passant un objecte i hauria de ser un string, o s'està
             * assignant l'objecte en lloc del string que porta com id.
             *
             * @param {{id: string}} id objecte anonim amb una cadena
             * @constructor
             */
            constructor: function (id) {
                this.inherited(arguments); // TODO[Xavi] te cap efecte? el constructor de la superclasse es crida automàticament
                this.id = id; // TODO[Xavi] Hauria de pasarse el id.id?
                this.metaData = new Array(); //TODO[Xavi] es un hash no un array
            },

            /**
             * TODO[Xavi] es fa servir enlloc?
             *
             * @returns {null}
             */
            getId: function () {
                return this.id;
            },

            /**
             * Afegeix les metadades passades com argument i es fa servir el id com a index al hash on es guarda.
             * Es cridat cada vegada que es carrega una pestanya, per exemple al carregar la pàgina o al obrir una nova
             * pàgina.
             *
             * @param {{content: string, id: string, tittle: string}} content objecte amb les metadades a afegir.
             */
            putMetaData: function (content) {
                this.metaData[content.id] = content;
            },

            /**
             * Es crida al canviar de pestanya. Si es pasa la id retorna només l'element corresponent a la id, en cas
             * contrari es retorna tot el hash de metaData.
             * TODO[Xavi] Es crida alguna vegada amb argument?
             *
             * @param {string} id corresponent a la metadata
             *
             * @returns {Object.<{content: string, id: string, tittle: string}>|{content: string, id: string, tittle: string}}
             * la metadada corresponent al id o el hash complet de metadades
             */
            getMetaData:       function (id) {
                // TODO[Xavi] es pot canviar per operació ternaria
                if (id) {
                    return this.metaData[id];
                } else {
                    return this.metaData;
                }
            },

            // TODO[Xavi] No es crida enlloc?
            removeAllMetaData: function () {
                alert("removeAllMetaData");
                this.metaData = new Array();
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
            }
        });

    return DokuwikiContent;
});
