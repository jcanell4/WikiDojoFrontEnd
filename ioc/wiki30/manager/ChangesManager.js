define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dijit/registry',
        'dojo/on'
    ], function (declare, lang, registry, on) {
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

                constructor: function (dispatcher) {
                    this.documentsChanged = {};
                    this.dispatcher = dispatcher;
                },

                thereAreChangedDocuments: function () {
                    return Object.keys(this.documentsChanged).length > 0;
                },

                checkDocument: function (id) {
                    var content = this.getCurrentContent(),
                        result;

                    id = id || this._getCurrentId();

                    result = !(this.documentsOriginal[id] == content);
                    return result;
                },

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

                _getCurrentId: function () {
                    return this.dispatcher.getGlobalState()._getCurrentId();
                },

                /**
                 * Comprova si hi han canvis, i si es així afegeix el id al array de documents canviats i si no l'elimina
                 *
                 * @param {string} id del document a comprovar
                 * @return {bool} Cert si el document ha canviat o fals en cas contrari
                 *
                 */
                updateDocument: function (id) {
                    id = id || this._getCurrentId();

                    var result = this.checkDocument(id); // Si existeix o hi han canvis retorna cert

                    if (result) {
                        this.documentsChanged[id] = true; // Si hi han canvis modifica la variable
                    } else {
                        this.resetDocument(id); // Si no els hi ha fa un reset del document
                    }

                    this.updateTabFormat(id, result);

                    return result;
                },

                setDocument: function (content, id) {
                    id = id || this._getCurrentId();

                    this.resetDocument(id);
                    this.documentsOriginal[id] = content;

                },

                resetDocument: function (id) {
                    id = id || this._getCurrentId();

                    if (this.documentsChanged[id]) {
                        delete this.documentsChanged[id];
                    }

                    this.documentsOriginal[id] = this._getCurrentContent(id);

                    this.updateTabFormat(id, false)
                },

                // TODO[Xavi] el ChangesManager ha d'ignorar els components de la pàgina
                updateTabFormat: function (id, changed) {
                    var tabNode = registry.byId("bodyContent_tablist_" + id);

                    if (tabNode) {
                        if (changed) {
                            tabNode.domNode.style.color = 'red';
                        } else {
                            tabNode.domNode.style.color = 'black';
                        }
                    }
                },

                isChanged: function (id) {
                    return this.documentsChanged[id] ? true : false;
                }

            }
        )
    }
);