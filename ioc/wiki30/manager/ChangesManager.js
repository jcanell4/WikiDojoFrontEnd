define([
        'dojo/_base/declare'
    ], function (declare) {
        return declare(null,
            /**
             * Gestiona el control de canvis als documents des de la última vegada que es van desar.
             *
             * @class ChangesManager
             * @author Xavier Garcia <xaviergaro.dev@gmail.com>
             */
            {
                documentsChanged: {},

                documentsOriginal: {},

                dispatcher: null,

                lastChecked: null,

                eventManager: null,

                constructor: function (dispatcher) {
                    this.documentsChanged = {};
                    this.dispatcher = dispatcher;
                    this.eventManager = dispatcher.getEventManager();
                },

                /**
                 * Retorna si hi han hagut canvis a cap dels documents carregats.
                 *
                 * @returns {boolean} - Cert si hi han hagut canvis o Fals en cas contrari
                 */
                thereAreChangedDocuments: function () {
                    return Object.keys(this.documentsChanged).length > 0;
                },

                /**
                 * Retorna si el document passat com argument o el document actual han sigut canviat.s
                 *
                 * @param {string?} id - id del document a comprovar
                 * @returns {boolean} - Cert si hi han hagut canvis o Fals en cas contrari
                 */
                isDocumentChanged: function (id) {
                    var content = this._getCurrentContent(),
                        result;

                    id = id || this._getCurrentId();

                    if (content == this.lastChecked) {
                        return this.isChanged(id);
                    } else {
                        result = !(this.documentsOriginal[id] == content);
                        this.lastChecked = content;
                    }

                    if (result) {
                        this.eventManager.dispatchEvent("document_changed", {id: id});
                        //this.dispatcher.dispatchEvent("document_changed", {id: id});
                    }

                    return result;
                },

                /**
                 * Retorna el text contingut al editor per la id passada com argument o la del id del document actual si
                 * no s'especifica.
                 *
                 * @param {string?} id - id del document del que volem recuperar el contingut
                 * @returns {string|null} - Text contingut al editor
                 * o null si no existeix
                 * @private
                 */
                _getCurrentContent: function (id) {
                    var contentCache;

                    id = id || this._getCurrentId();
                    contentCache = this.dispatcher.getContentCache(id);

                    try {
                        if (contentCache.isAceEditorOn()) {
                            return contentCache.getEditor().iocAceEditor.getText();

                        } else {
                            return contentCache.getEditor().$textArea.context.value;
                        }

                    } catch (error) {
                        // En cas de que sigui possible recuperar el text anterior retornem null
                        return null;
                        //console.log("Error detectat: ", error);
                    }

                },

                /**
                 * Retorna la id del document actual.
                 *
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


                    var result = this.isDocumentChanged(id); // Si existeix o hi han canvis retorna cert

                    if (result) {
                        this.documentsChanged[id] = true; // Si hi han canvis modifica la variable
                    } else {
                        this.resetDocumentChangeState(id); // Si no els hi ha fa un reset del document
                    }


                    return result;
                },

                /**
                 * Estableix el contingut com a contingut original pel document passat com argument. Si no s'especifica el contingut
                 * o el id es fan servir els continguts del editor i/o la id actuals respectivament.
                 *
                 * @param {string?} content - Contingut a establir com original pel document
                 * @param {string?} id - Id del document
                 */
                setDocument: function (content, id) {
                    id = id || this._getCurrentId();
                    content = content || this._getCurrentContent(id);

                    this.resetDocumentChangeState(id);
                    this.documentsOriginal[id] = content;


                },

                /**
                 * Reinicia l'estat del document passat com argument o del document actual si no s'especifica una id
                 *
                 * @param {string?} id - Id del document a reiniciatlizar
                 */
                resetDocumentChangeState: function (id) {
                    id = id || this._getCurrentId();

                    if (this.documentsChanged[id]) {
                        delete this.documentsChanged[id];
                    }


                    this.eventManager.dispatchEvent("document_changes_reset", {id: id});
                    //this.dispatcher.dispatchEvent("document_changes_reset", {id: id});
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
                    id = id || this._getCurrentId();
                    return this.documentsChanged[id] ? true : false;
                }

            }
        )
    }
);