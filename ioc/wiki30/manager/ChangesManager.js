define([
        'dojo/_base/declare'
    ], function (declare) {
        return declare(null,
            /**
             * Gestiona el control de canvis als documents des de la última vegada que es van desar.
             *
             * @class NewChangesManager
             * @author Xavier Garcia <xaviergaro.dev@gmail.com>
             */
            {
                contentsChanged:  {},

                contentsToCheck: {},

                dispatcher: null,

                constructor: function (dispatcher) {
                    this.contentsChanged = {};
                    this.contentsToCheck = {};
                    this.dispatcher = dispatcher;
                },

                /**
                 * Retorna si hi han hagut canvis a cap dels documents carregats.
                 *
                 * @returns {boolean} - Cert si hi han hagut canvis o Fals en cas contrari
                 */
                thereAreChangedContents: function () {
                    return Object.keys(this.contentsChanged).length > 0;
                },

                /**
                 * Retorna si el document passat com argument o el document actual han sigut canviat.
                 *
                 * TODO[Xavi] la comprovació de si el document ha canviat es delega al ContentTool
                 * @param {string?} id - id del document a comprovar
                 * @returns {boolean} - Cert si hi han hagut canvis o Fals en cas contrari
                 */
                isContentChanged: function (id) {
                    return this._getContentTool(id).isContentChanged();
                },

                _getContentTool: function (id) {
                    return this.contentsToCheck[id];
                },

                setContentTool: function (contentTool) {
                    this.contentsToCheck[contentTool.id] = contentTool;
                },

                removeContentTool: function(id) {
                    delete this.contentsToCheck[id];
                },

                /**
                 * Retorna la id del document actual.
                 *
                 * TODO[Xavi] Deixar com a helper method? Afegir-lo a un decorador? <-- Es necessari, cridat per altres
                 * @returns {string} - Id del document actual
                 * @private
                 */
                _getCurrentId: function () {
                    return this.dispatcher.getGlobalState().getCurrentId();
                },

                /**
                 * Comprova si hi han canvis, i si es així afegeix el id al array de documents canviats i si no l'elimina
                 *
                 * @param {string?} id - Id del document a comprovar
                 * @return {boolean} - Cert si el document ha canviat o Fals en cas contrari
                 */
                updateDocumentChangeState: function (id) {

                    id = id || this._getCurrentId();

                    var result = this.isContentChanged(id); // Si existeix o hi han canvis retorna cert

                    if (result) {
                        this.contentsChanged[id] = true; // Si hi han canvis modifica la variable
                    } else {
                        this.resetContentChangeState(id); // Si no els hi ha fa un reset del document
                    }

                    return result;
                },

                /**
                 * Reinicia l'estat del contingut passat com argument o del document actual si no s'especifica una id
                 *
                 * @param {string?} id - Id del contingut a reiniciatlizar
                 */
                resetContentChangeState: function (id) {
                    var contentTool;

                    id = id || this._getCurrentId();

                    if (this.contentsChanged[id]) {
                        delete this.contentsChanged[id];
                    }

                    contentTool = this._getContentTool(id);

                    if (contentTool) {
                        contentTool.resetContentChangeState();
                    }
                },

                /**
                 * Retorna si el document amb la id especificada ha canviat, si no s'especifica es comprova el document
                 * actual. Aquest mètode es diferencia d'altres perquè no realitza la comprovació del canvi en si, només
                 * retorna si es troba a la llista de canviats o no.
                 *
                 * @param {string?} id - Id del document a comprovar
                 * @returns {boolean} - Cert si el document es troba a la llista de documents canviats
                 */
                isChanged: function (id) {
                    return this.contentsChanged[id] ? true : false;
                }

            }
        )
    }
);
