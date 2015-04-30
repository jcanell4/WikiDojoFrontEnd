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

                // Aquest es un hash amb el id del contingut a comprovar i una propietat amb la informació necessaria
                // per executar la comprovació al isDocumentChanged
                //TODO[Xavi] seria més adequat canviar els noms per Content ja que no només es controlarà els documents

                contentsToCheck: {},

                dispatcher: null,

                lastChecked: null,

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

                    var contentTool = this._getContentTool(id);

                    //console.log("id: ", id);
                    //console.log("Encontrado algo?", contentTool);

                    return contentTool.isContentChanged();
                    //
                    //
                    //var content = this._getCurrentContent(),
                    //    contentCache,
                    //    observer,
                    //    result;
                    //
                    //
                    //console.log("Hi han canvis?");
                    //
                    //id = id || this._getCurrentId();
                    //
                    //if (content == this.lastChecked) {
                    //    return this.isChanged(id);
                    //} else {
                    //    result = !(this.documentsOriginal[id] == content);
                    //    this.lastChecked = content;
                    //}
                    //
                    //if (result) {
                    //    // TODO[Xavi] l'avís s'ha de passar al content tool <-- Com que la comprovació la farà el propi contenttool aquest codi anirà allà
                    //    contentCache = this.dispatcher.getContentCache(id);
                    //
                    //    if (contentCache) {
                    //        observer = contentCache.getMainContentTool();
                    //        observer.dispatchEvent("document_changed", {id: id});
                    //    }
                    //
                    //
                    //    //this.eventManager.dispatchEvent("document_changed", {id: id});
                    //}
                    //
                    //return result;
                },

                _getContentTool: function (id) {
                    return this.contentsToCheck[id];
                },

                setContentTool: function (contentTool) {
                    this.contentsToCheck[contentTool.id] = contentTool;
                },
                //
                ///**
                // * Retorna el text contingut al editor per la id passada com argument o la del id del document actual si
                // * no s'especifica.
                // *
                // * TODO[Xavi] Això es propi només del EditorContentTool, no es global
                // *
                // * @param {string?} id - id del document del que volem recuperar el contingut
                // * @returns {string|null} - Text contingut al editor
                // * o null si no existeix
                // * @private
                // */
                //_getCurrentContent: function (id) {
                //    var contentCache;
                //
                //    id = id || this._getCurrentId();
                //    contentCache = this.dispatcher.getContentCache(id);
                //
                //    try {
                //        if (contentCache.isAceEditorOn()) {
                //            return contentCache.getEditor().iocAceEditor.getText();
                //
                //        } else {
                //            return contentCache.getEditor().$textArea.context.value;
                //        }
                //
                //    } catch (error) {
                //        // En cas de que sigui possible recuperar el text anterior retornem null
                //        return null;
                //        //console.log("Error detectat: ", error);
                //    }
                //},

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
                 * Estableix el contingut com a contingut original pel document passat com argument. Si no s'especifica el contingut
                 * o el id es fan servir els continguts del editor i/o la id actuals respectivament.
                 *
                 * @param {string?} content - Contingut a establir com original pel document
                 * @param {string?} id - Id del document
                 */
                //setDocument: function (content, id) {
                //
                //    console.error("Se ha pasado content?", content);
                //    console.log("Se ha pasado id?", id);
                //
                //    alert("Set, cridat fent que?");
                //
                //    id = id || this._getCurrentId();
                //    //content = content || this._getCurrentContent(id);
                //
                //    this.resetContentChangeState(id);
                //    //this.documentsOriginal[id] = content;
                //
                //
                //},

                /**
                 * Reinicia l'estat del contingut passat com argument o del document actual si no s'especifica una id
                 *
                 * @param {string?} id - Id del contingut a reiniciatlizar
                 */
                resetContentChangeState: function (id) {

                    //var contentCache, observer;

                    id = id || this._getCurrentId();

                    if (this.contentsChanged[id]) {
                        delete this.contentsChanged[id];
                    }

                    //console.log("Reset", id);

                    var contentTool = this._getContentTool(id);

                    //console.log("contentool", contentTool);
                    if (contentTool) {
                        contentTool.resetContentChangeState();
                    }

                    //
                    ////console.log(this.eventManager);
                    //
                    //// Recuperem el mainContentTool
                    //contentCache = this.dispatcher.getContentCache(id);
                    //
                    //if (contentCache) {
                    //    observer = contentCache.getMainContentTool();
                    //    observer.dispatchEvent("document_changes_reset", {id: id});
                    //}
                    //
                    ////this.eventManager.dispatchEvent("document_changes_reset", {id: id});


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
                    if (!id) {
                        alert("ERROR, no s'a passat la id al isChanged");
                    }
                    //id = id || this._getCurrentId();
                    return this.contentsChanged[id] ? true : false;
                },

                removeContentTool: function(id) {
                    delete this.contentsToCheck[id];
                }
            }
        )
    }
);
