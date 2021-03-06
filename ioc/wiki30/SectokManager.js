define([
    "dojo/_base/declare"
], function (declare) {
    var ret = declare(null,
        /**
         * @class SectokManager
         */
        {
            // TODO[Xavi] Això ha de ser un hash, no un array
            _hashSectok: [],

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
                id = this._getId(id);
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
                return id ? id : this.defaultId;
            }
        });
    return ret;
});





