define([
        'dojo/_base/declare'
    ], function (declare) {
        return declare(null,
            /**
             * Gestiona el control de canvis als continguts dels ContentTools.
             *
             * @class ChangesManager
             * @author Xavier Garcia <xaviergaro.dev@gmail.com>
             */
            {
                contentsChanged: {},

                contentsToCheck: {},

                dispatcher: null,

                constructor: function (dispatcher) {
                    this.contentsChanged = {};
                    this.contentsToCheck = {};
                    this.dispatcher = dispatcher;
                },

                /**
                 * Retorna si hi han hagut canvis a cap dels continguts enregistrats.
                 *
                 * @returns {boolean} - Cert si hi han hagut canvis o Fals en cas contrari
                 */
                thereAreChangedContents: function () {
                    return Object.keys(this.contentsChanged).length > 0;
                },

                /**
                 * Retorna si el ContenTool amb la id passad com argument te els continguts canviats o no.
                 *
                 * @param {string} id - id del ContentTool a comprovar
                 * @returns {boolean} - Cert si hi han hagut canvis o Fals en cas contrari
                 */
                isContentChanged: function (id) {
                    return this._getContentTool(id).isContentChanged();
                },

                /**
                 * Retorna el ContentTool amb la id passada com argument
                 *
                 * @param {string} id - id del ContentTool a retornar
                 * @returns {AbstractChangesManagerDecoration} - ContentTool amb la id demanada
                 * @private
                 */
                _getContentTool: function (id) {
                    return this.contentsToCheck[id];
                },

                /**
                 * Afegeix el ContentTool passat com argument
                 * @param {AbstractChangesManagerDecoration} contentTool
                 */
                setContentTool: function (contentTool) {
                    //console.log("ChangesManager#setContentTool", contentTool.id);
                    this.contentsToCheck[contentTool.id] = contentTool;
                },

                /**
                 * Elimina de la gestió de canvis el ContentTool amb la id passada com argument
                 *
                 * @param {string} id - id del ContentTool a eliminar
                 */
                removeContentTool: function (id) {
                    // console.log("ChangesManager#removeContentTool", id);
                    delete this.contentsToCheck[id];
                    delete this.contentsChanged[id];
                },

                /**
                 * Comprova si hi han canvis, i si es així afegeix el id al array de continguts canviats i si no l'elimina
                 *
                 * @param {string} id - Id del ContentTool a comprovar
                 * @return {boolean} - Cert si el contingut ha canviat o Fals en cas contrari
                 */
                updateContentChangeState: function (id) {
                    //console.log("ChangesManager#updateContentChangeState", id);

                    var result = this.isContentChanged(id); // Si existeix o hi han canvis retorna cert

                    if (result) {
                        this.contentsChanged[id] = true; // Si hi han canvis modifica la variable
                    } else {
                        this.resetContentChangeState(id); // Si no els hi ha fa un reset del document
                    }

                    return result;
                },

                /**
                 * Reinicia l'estat del contingut passat com argument
                 *
                 * @param {string} id - Id del contingut a reiniciatlizar
                 */
                resetContentChangeState: function (id) {
                    // console.log("ChangesManager#resetContentChangeState", id);
                    var contentTool;

                    delete this.contentsChanged[id];

                    contentTool = this._getContentTool(id);

                    if (contentTool) {
                        contentTool.resetContentChangeState();
                    }
                },

                /**
                 * Comprova si el ContentTool amb la id passada per argument es a la llista de continguts canviats i si
                 * es així retorna cert i si no es troba retorna false.
                 *
                 * @param {string} id - Id del ContentTool a comprovar
                 * @returns {boolean} - Cert si el ContentTool es troba a la llista de continguts canviats
                 */
                isChanged: function (id) {
                    return this.contentsChanged[id] ? true : false;
                }
            }
        )
    }
);