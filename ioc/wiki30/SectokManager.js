define([
    "dojo/_base/declare", // declare
    "require" // TODO[Xavi] No es fa servir
], function (declare, require) {
    var ret = declare("ioc.wiki30.SectokManager", [],
        /**
         * @class ioc.wiki30.SectokManager
         */
        {

        // TODO[Xavi] Això ha de ser un hash, no un array
        _hashSectok: new Array(),

        // TODO[Xavi] S'hauria d'etiquetar com a constant?
        defaultId:   "ajax",

        /**
         * Guarda el token de seguretat al hash amb la ide passada com argument
         *
         * @param {string} id id del token de seguretat
         * @param {string} sectok token de seguretat
         */
        putSectok: function (id, sectok) {
            if (sectok) {
                this._hashSectok[this._getId(id)] = sectok;
            }
        },

        /**
         * TODO[Xavi] aixo no es cridat enlloc?
         *
         * @param {string} id
         */
        removeSectok: function (id) {
            id = this.this._getId(id); // TODO[Xavi] this.this es correcte?
            if (id in this._hashSectok) {
                delete this._hashSectok[id];
            }
        },

        /**
         * Retorna el token de seguretat corresponent al ide passat com argument
         *
         * @param {string} id del token
         *
         * @returns {string} token de seguretat
         */
        getSectok: function (id) {
            return this._hashSectok[this._getId(id)];
        },

        /**
         * Retorna el mateix id passat com argument o si no es valid el id per defecte
         *
         * @param {string} id per obtenir
         *
         * @returns {String} id passat o el id per defecte
         *
         * @private
         */
        _getId: function (id) {
            // TODO[Xavi] Canviar per operació ternaria
            // return id ? id : this.defaultId;

            if (!id) {
                id = this.defaultId;
            }
            return id;
        }
    });
    return ret;
});





