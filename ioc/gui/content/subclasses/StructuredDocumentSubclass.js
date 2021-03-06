define([
    'dojo/_base/declare',
    'ioc/gui/content/subclasses/ChangesManagerCentralSubclass',
    'ioc/gui/content/subclasses/LocktimedDocumentSubclass',
    'ioc/dokuwiki/editors/AceManager/AceEditorPartialFacade',
    'dojo/dom',
    'dojo/dom-geometry',
    'dojo/cookie',
    'ioc/dokuwiki/editors/DojoManager/DojoEditorPartialFacade',
    'ioc/gui/content/subclasses/AbstractEditorSubclass',


], function (declare, ChangesManagerCentralSubclass, LocktimedDocumentSubclass, AceFacade, dom, geometry, cookie,
             DojoEditorPartialFacade, AbstractEditorSubclass) {
    /**
     * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
     *
     * S'ha deixat com un fitxer independent per facilitar la seva edició i no pot comptarse amb que sigui accesible
     * en el futur.
     *
     * Aquesta classe hereta del AbstractChangesManagerCentralSubclass de manera que afegeix automàticament les
     * funcionalitats comunes dels documents editables de la pestanya central que son:
     *
     *      - Canviar el color de la pestanya a vermell quan hi han canvis
     *      - Canviar el color de la pestanya a negre quan els canvis es restableixin
     *      - Disparar els esdeveniment document_changed i document_changes_reset quan calgui
     *      - Demanar confirmació abans de tancar si s'han realitzat canvis
     *
     * Les crides a aquests mètodes es faran desde la clase decorada.
     *
     * @class StructuredDocumentSubclass
     * @extends AbstractChangesManagerCentralSubclass
     * @author Xavier García <xaviergaro.dev@gmail.com>
     * @private
     * @abstract
     */
    return declare([ChangesManagerCentralSubclass, LocktimedDocumentSubclass, AbstractEditorSubclass], {

        // TOOLBAR_ID: 'partial-editor',
        // VERTICAL_MARGIN: 100, // TODO [Xavi]: Pendent de decidir on ha d'anar això definitivament. si aquí o al AceFacade
        // MIN_HEIGHT: 200, // TODO [Xavi]: Pendent de decidir on ha d'anar això definitivament. si aquí o al AceFacade

        DRAFT_TYPE: 'structured',

        constructor: function (args) {

            this._generateEmptyChangedChunks(args.content.chunks);
            this.savedDrafts = {};
            this.editors = {}; // A aquest objecte es guardarà per cada header_id el seu editor
            this.currentElementId = null;
            this.hasChanges = false;
            this.partialDisabled = args.partialDisabled;

            // toolbarManager.setDispatcher(args.dispatcher);
        },


        /**
         * Al post render s'afegeix la funcionalitat de reconstruir els prefix i suffix necessaris per la wiki al
         * fer click en el botó de desar i s'afegeix la toolbar a cada editor.
         *
         * @override
         */
        postRender: function () {

            this.inherited(arguments);

            if (!this.readonly) {
                this.requirePage();
            }

            this.addEditors();
            // this.addToolbars();

            this.addEditionListener();

            // Només es permet la selecció múltiple per l'editor ACE
            if (this.editorType === 'ACE') {
                this.addSelectionListener();
            }


            // El post render es crida sempre després d'haver tornat o carregat una nova edició
            this.discardChanges = false;

            if (this.data.locked || this.getReadOnly()) { // TODO[Xavi] es dins de editing per concordancia amb l'editor complet
                this.lockEditors();
            } else {
                this.unlockEditors();
                this.isLockNeeded();
            }

            this.fillEditorContainer();

        },

        // Afegeix un editorAce per cada editor actiu
        addEditors: function () {
            var auxId;

            for (var i = 0; i < this.data.chunks.length; i++) {
                auxId = this.data.id + "_" + this.data.chunks[i].header_id;
                if (this.data.chunks[i].text) {

                    // console.log(this.data.chunks[i].text);
                    var originalContent = this.data.chunks[i].text.originalContent /*|| this.data.chunks[i].text.editing*/;

                    // console.log("S'ha trobat original content?", this.data.chunks[i].text.originalContent !== undefined? this.data.chunks[i].text.originalContent.length : false)

                    var data = {
                        auxId: auxId,
                        content: this.data.chunks[i].text.editing,
                        originalContent: originalContent,
                        editorType: this.data.editorType
                    };

                    if (this.editors[this.data.chunks[i].header_id]) {

                        this.updateEditor(this.data.chunks[i].header_id, data);

                    } else {
                        this.addEditor(this.data.chunks[i].header_id, data);
                    }

                } else {
                    if (this.editors[this.data.chunks[i].header_id]) {
                        this.disableEditor(this.data.chunks[i].header_id);
                    }
                }
            }
        },

        _setOwnCurrenElement: function (id) {
            var currentSelection = this.dispatcher.getGlobalState().getCurrentElement();

            if (currentSelection.id === id && !currentSelection.state) {
                this._setCurrentElement(null);
            } else {
                this._setCurrentElement(id);
            }
        },

        addEditionListener: function () {
            if (this.partialDisabled) {
                return;
            }


            //console.log("StructuredDocumentSubclass#addEditionListener");
            if (this.rev !== null && this.rev !== undefined && this.rev !== '') {
                return;
            }

            if (this.editorType === 'ACE') {
                this.addPartialEditingHandlers(this.data.id, this.data.chunks)
            }

        },

        addPartialEditingHandlers: function (id, chunks) {

            var context = this;

            for (var i = 0; i < chunks.length; i++) {
                var auxId = id + "_" + chunks[i].header_id;

                jQuery('#container_' + auxId).on('dblclick', function () {

                    // DUPLICAT en el click!
                    context._setOwnCurrenElement(this.id);

                    var aux_id = this.id.replace('container_', ''),
                        header_id = aux_id.replace(context.id + "_", '');

                    if (jQuery.inArray(header_id, context.editingChunks) === -1) {

                        context.fireEvent(context.eventName.EDIT_PARTIAL, {
                            id: context.id,
                            chunk: header_id
                        });
                    }

                });
            }
        },

        getQueryEdit: function (chunkId) {
            //console.log("StructuredDocumentSubclass#getQueryEdit", chunkId);
            var query = 'do=edit_partial'
                + '&section_id=' + chunkId
                + '&editing_chunks=' + this.getEditingChunks().toString()
                + '&target=section'
                + '&id=' + this.ns
                + '&rev=' + (this.rev || '')
                + '&summary=[' + this.title + ']'
                + '&range=-';
            if (this.type == "requiring_partial") {
                query += "&to_require=true";
            }


            query += this._generateLastLocalDraftTimesParam(chunkId);

            query += "&editorType=" + this.dispatcher.getGlobalState().userState['editor'];

            return query;
        },

        _generateLastLocalDraftTimesParam: function (chunkId) {
            //return '&structured_last_loca_draft_time=42';
            return this.draftManager.generateLastLocalDraftTimesParam(this.id, this.ns, chunkId);

        },

        getQuerySave: function (header_id) {
            var $form = jQuery('#form_' + this.id + "_" + header_id),
                values = {},
                rebuildText;

            jQuery.each($form.serializeArray(), function (i, field) {
                values[field.name] = field.value;
            });


            // ALERTA[Xavi] s'actualitza el chunk amb el contingut de l'editor abans de reconstruir el text
            this.updateChunk(header_id, {'editing': this.getEditor(header_id).getValue()});

            rebuildText = this._rebuildText(header_id, false);
            // lang.mixin(values, rebuildText);
            this.mixin(values, rebuildText);

            //afegim el format de l'editor
            values["editorType"] = this.getEditor(header_id).getContentFormat();

            var contentCache = this.dispatcher.getGlobalState().getContent(this.id);

            if (contentCache.projectOwner && contentCache.projectOwner !== 'undefined') {
                values.projectOwner = contentCache.projectOwner;
                values.projectSourceType = contentCache.projectSourceType;
            }

            return values;
        },

        getEditedText: function (header_id) {
            return this._rebuildText(header_id, true);
        },

        /**
         *
         * @param {null|string} header_id: capçalera de la secció central, correspondrà al wikitext
         * @param {null|boolean} current:  sí es cert es reconstrueix el text amb el contingut dels editors, en cas contrari es reconstrueix amb el contingut desat al servidor
         * @return {{prefix: {string}, suffix:{string}, wikitext:{string}}}
         * @private
         */
        _rebuildText: function (header_id, current) {
            var text = {},
                chunks = this.data.chunks,
                pre = '',
                suf = '',
                i = 0;

            while (i < chunks.length && (chunks[i].header_id !== header_id || !header_id)) {
                if (chunks[i].text) {
                    pre += chunks[i].text.pre;

                    if (current) {
                        // TODO: Obtenir el contingut de l'editor
                        pre += this.getEditor(chunks[i].header_id).getValue();
                    } else {
                        pre += this.changedChunks[chunks[i].header_id].content;
                    }

                }
                i++;
            }

            // Si no s'ha arribat al final es que s'ha trobat el chunk central, s'afegeix el pre del chunk central.
            if (i < chunks.length) {
                pre += chunks[i].text.pre;
                // Ens saltem el processament del chunk actual perquè es tracta del chunk "central"
                i++;
            }

            while (i < chunks.length) {
                if (chunks[i].text) {
                    suf += chunks[i].text.pre;
                    if (current) {
                        suf += this.getEditor(chunks[i].header_id).getValue();
                    } else {
                        suf += this.changedChunks[chunks[i].header_id].content;
                    }
                }
                i++;
            }
            suf += this.data.suf || '';

            text.prefix = pre;
            // text.prefix = pre + "\n";
            text.suffix = suf;
            text.wikitext = '';

            if (header_id) {
                var index = this.data.dictionary[header_id];
                if (chunks[index].text) {
                    if (current) {
                        text.wikitext = this.getEditor(chunks[index].header_id).getValue();

                    } else {

                        text.wikitext = chunks[index].text.editing;
                    }
                }
            }

            return text;

        },

        getEditedChunk: function (header_id) {
            return this.getEditor(header_id).getValue();
        },

        getQueryCancel: function (header_id) {
            var ret = 'do=cancel_partial&id=' + this.ns + '&section_id=' + header_id
                + '&editing_chunks=' + this.getEditingChunks().join(',');

            if (this.type == "requiring_partial") {
                ret += "&to_require=true";
            }

            if (!this.required) {
                ret += "&unlock=false";
            }

            var contentCache = this.dispatcher.getGlobalState().getContent(this.id);


            if (contentCache.projectOwner && contentCache.projectOwner !== 'undefined') {

                ret += "&projectOwner=" + contentCache.projectOwner;
                ret += "&projectSourceType=" + contentCache.projectSourceType;
            }

            ret += "&editorType=" + this.dispatcher.getGlobalState().userState['editor'];

            return ret;
        },

        getEditingChunks: function () { // TODO[Xavi] Aquest recompte es practicament idèntic al del updateChunks(content)

            this.editingChunksCounter = 0;
            this.editingChunks = [];

            for (var i = 0; i < this.data.chunks.length; i++) {
                var chunk = this.data.chunks[i];

                if (chunk.text) {
                    this.editingChunks.push(chunk.header_id);
                    this.editingChunksCounter++; // TODO[Xavi] Afegir un mètode generic per tots els contentTools que retorni aquest nombre

                }
            }

            return this.editingChunks || [];
        },


        /**
         * Actualitza el chunk amb la capçalera passada com argument amb el text passat com argument.
         *
         * @param {string} header_id - Capçalera del chunk
         * @param {string} text - Text per substituir
         */
        updateChunk: function (header_id, text) {
            // console.log("StructuredDocumentSubclass#updateChunk", header_id);
            var chunk,
                i = 0,
                found = false;

            // Actualitzem també els canvis
            this.changedChunks[header_id].changed = false;
            this.changedChunks[header_id].content = text.editing;

            while (i < this.data.chunks.length && !found) {

                chunk = this.data.chunks[i];
                if (chunk.header_id === header_id) {
                    if (chunk.text) {
                        for (var item in text) {
                            chunk.text[item] = text[item];
                            found = true;
                            break;
                        }

                    } else {
                        found = true;
                    }
                }
                i++;
            }

        },

        /**
         * @override
         */
        preRender: function () {
            // Compte! es al data i no al content perquè en aquest punt el content encara no s'ha actualitzat
            for (var i = 0; i < this.data.chunks.length; i++) {
                var aux_id = this.id + "_" + this.data.chunks[i].header_id,
                    text = jQuery("#textarea_" + aux_id).val();

                //if (text && this.content.chunks[i].text && text.length>0) {
                if (text && text.length > 0 && this.data.chunks[i].text) {
                    this.data.chunks[i].text.editing = text;
                }
            }

            // Eliminem els editors ACE
            this.removeEditors();
        },

        /**
         * @override
         */
        postAttach: function () {
            this.registerToChangesManager();

            // jQuery(this.domNode).on('input paste cut keyup', this._checkChanges.bind(this));
            this.inherited(arguments);

            //console.log("StructuredDocumentSubclass#postLoad");

            this.eventManager = this.dispatcher.getEventManager();

//            this.eventManager.registerEventForBroadcasting(this, this.eventNameCompound.EDIT_PARTIAL + this.id, this._doEditPartial.bind(this));
//            this.eventManager.registerEventForBroadcasting(this, this.eventNameCompound.SAVE_PARTIAL + this.id, this._doSavePartial.bind(this));
//            this.eventManager.registerEventForBroadcasting(this, this.eventNameCompound.CANCEL_PARTIAL + this.id, this._doCancelPartial.bind(this));

            this.setFireEventHandler(this.eventName.EDIT_PARTIAL, this._doEditPartial.bind(this));
            this.setFireEventHandler(this.eventName.SAVE_PARTIAL, this._doSavePartial.bind(this));
            this.setFireEventHandler(this.eventName.SAVE_PARTIAL_ALL, this._doSavePartialAll.bind(this));
            this.setFireEventHandler(this.eventName.CANCEL_PARTIAL, this._doCancelPartial.bind(this));

//            // Impresncidible pel cas en que caduca el bloqueig
//            this.eventManager.registerEventForBroadcasting(this, this.eventNameCompound.CANCEL + this.id, this._doCancelDocument.bind(this));

            // Impresncidible pel cas en que caduca el bloqueig
            //[JOSEP]: Mirar si és un fireHandler o un ObservableCallback
            this.setFireEventHandler(this.eventName.CANCEL, this._doCancelDocument.bind(this));
            //this.eventManager.registerObserverToLocalEvent(this, this.eventNameCompound.CANCEL, this._doCancelDocument.bind(this));
            //this.registerObserverToEvent(this, this.eventNameCompound.CANCEL, this._doCancelDocument.bind(this));
        },


        // TODO[Xavi] Actualment no fa res especial
        _checkChanges: function () {

            // Si el document està bloquejat mai hi hauran canvis
            if (!this.locked && this.changesManager) {
                this.changesManager.updateContentChangeState(this.id);
            }
        },

        /**
         * Controla si s'han produït o no canvis en qualsevol dels chunks en edició
         *
         * @override
         * @returns {boolean} Cert si s'ha produït algun canvi
         */
        isContentChanged: function () {
            // console.log("StructuredDocumentSubclass#isContentChanged");

            // * El editing dels chunks en edicio es diferent del $textarea corresponent
            var chunk,
                $textarea,
                diffFromOriginal,
                diffFromLastCheck,
                content,
                documentChanged = false,
                documentRefreshed = false;

            if (this.discardChanges) {
                //this.discardChanges = false;
                return false;
            }


            for (var i = 0; i < this.data.chunks.length; i++) {
                chunk = this.data.chunks[i];

                if (chunk.text) {
                    $textarea = jQuery('#textarea_' + this.id + "_" + chunk.header_id);

                    content = $textarea.val();
                    // diffFromOriginal = this._getOriginalContent(chunk.header_id) != content;
                    var editor = this.getEditor(chunk.header_id);
                    if (editor) {
                        diffFromOriginal = editor.isChanged();
                    } else {
                        diffFromOriginal = false;
                    }
                    diffFromLastCheck = this.isLastCheckedContentChanged(chunk.header_id, content);


                    this.changedChunks[chunk.header_id].changed = diffFromOriginal;

                    // Només cal 1 modificat per que s'apliqui el canvi
                    documentChanged |= diffFromOriginal;
                    documentRefreshed |= diffFromLastCheck;

                }
            }

            if (documentChanged && !this.hasChanges) {
                this.hasChanges = true;
                this.onDocumentChanged();

            } else if (!documentChanged) {
                this.hasChanges = false;
            }

            if (documentRefreshed) {
                this.onDocumentRefreshed();
            }

            return documentChanged;
        },

        isContentChangedForChunk: function (chunkId) {
            // console.log("StructuredDocumentSubclass#isContentChangedForChunk", this.getEditor(chunkId).isChanged());
            // var index = this.data.dictionary[chunkId],
            //     chunk = this.data.chunks[index],
            //     $textarea,
            //     content;
            //
            //
            // if (chunk.text) {
            //     $textarea = jQuery('#textarea_' + this.id + "_" + chunk.header_id);
            //     content = $textarea.val();
            //     return this._getOriginalContent(chunk.header_id) != content
            // } else {
            //     return false;
            // }
            return this.getEditor(chunkId).isChanged();

        },

        isLastCheckedContentChanged: function (header_id, content) {
            //var result = !(this.changedChunks[header_id].lastChecked == content);
            var lastCheckedContent = this._getLastCheckedContent(header_id);
            var result = false;

            if (lastCheckedContent) {
                result = lastCheckedContent != content;
            } else {
                this._setLastCheckedContent(header_id, content);
            }

            if (result) {
                this._setLastCheckedContent(header_id, content);
            }

            return result;
        },

        _getLastCheckedContent: function (header_id) {
            return this.changedChunks[header_id].lastChecked;
        },

        _setLastCheckedContent: function (header_id, content) {
            this.changedChunks[header_id].lastChecked = content;
        },


        /**
         * Retorna el contingut original corresponent al chunk amb la caçalera passada com argument. La primera
         * vegada es cerca entre les dades del ContentTool i la caxeja per accedir més ràpidament la pròximament.
         *
         * @param header_id - Capçalera del chunk del que s'obtindrà el contingut original
         * @returns {string} El contingut original rebut del backend
         * @private
         */
        // _getOriginalContent: function (header_id) {
        //     // console.log("StructuredDocumentSubclass#_getOriginalContent");
        //
        //     if (this.changedChunks[header_id] && this.changedChunks[header_id].content) {
        //         // console.log("Trobat el changed chunk!", this.changedChunks[header_id].content)
        //         return this.changedChunks[header_id].content;
        //
        //     } else {
        //
        //         var chunk;
        //         for (var i = 0; i < this.data.chunks.length; i++) {
        //             chunk = this.data.chunks[i];
        //
        //             if (chunk.text && chunk.header_id == header_id) {
        //
        //                 // console.log("ChangedChunks:", this.changedChunks, "header_id", header_id);
        //                 this.changedChunks[header_id].content = chunk.text.editing;
        //                 return chunk.text.editing;
        //             }
        //         }
        //     }
        // },

        // _setOriginalContent: function (header_id, content) {
        //     // console.log("StructuredDocumentSubclass#_setOriginalContent", header_id, content);
        //     this.changedChunks[header_id] = {};
        //     this.changedChunks[header_id].content = content;
        //
        //
        // },

        /**
         * Reinicialitza l'estat del document, eliminant-lo de la llista de modificats
         * @override
         */
        resetContentChangeState: function () {
            // console.error("StructuredDocumentSubclass#resetContentChangeState");

            if (!this.discardChanges) {
                for (var header_id in this.changedChunks) {
                    if (this.changedChunks[header_id].changed) {
                        // Mentre hi hagi un chunk amb canvis no es fa el reset
                        return;
                    }
                }
            }

            //console.log("#resetContentChangeState");
            delete this.changesManager.contentsChanged[this.id];
            this.onDocumentChangesReset();
        },

        /**
         * Actualitza el document amb el nou contingut
         *
         * @param content
         */
        updateDocument: function (content) {
            var draft, index, keepOriginalContent = false;
            //console.log('StructuredDocumentSubclass#updateDocument', content);
            index = content.dictionary[content.selected];


            if (content.recover_local_draft === true) {
                // console.log("*** ESBORRANY LOCAL***");
                draft = this.getDraftChunk(content.selected);


                //console.log("Draft:", draft);
                // console.log("Content:", content.chunks[index]);


                // Això estableix el contingut anterior com a contingut original
                content.chunks[index].text.originalContent = content.chunks[index].text.editing;

                // this._setOriginalContent(content.selected, content.chunks[index].text.editing); // ALERTA[Xavi] Això no s'ha de fer servir

                content.chunks[index].text.editing = draft;
                keepOriginalContent = true;

            } else if (content.chunks[index] && content.chunks[index].text && content.chunks[index].text.originalContent) {
                // console.log("*** ESBORRANY REMOT ***");
                // this._setOriginalContent(content.selected, content.chunks[index].text.originalContent);
                keepOriginalContent = true;
            } else {
                // console.log("*** NO ES TRACTA D'UN ESBORRANY ***");
            }

            // TODO[Xavi] En cas del draft remot el content ja arriba modificat, s'ha d'extreure el contentOriginal (que ara no s'envia) d'un altre camp


            this._updateChunks(content, keepOriginalContent);
            this._updateStructure(content);

            if (content.locked) {
                this.lockEditors();
            }

            if (content.editing) {
                this.setReadOnly(content.editing.readonly);
            }

            this.setData(content);
            this.render();

            // Si existeix una secció seleccionada i no es tracta d'una revisió, la reseleccionem
//            console.log("És una revisió? ", this.rev);
            if (this._getCurrentElementId() && !this.rev) {
                this._setCurrentElement(this._getCurrentElementId());
            }

            //TODO:canvia la edició de view a edit
            if (this._getEditorsCount() == 0) {
                this._changeAction("view");
            } else {
                this._changeAction("sec_edit");
            }
        },

        hasEditors: function () {
            return (Object.keys(this.editors).length > 0);
        },

        /**
         * Actualitza la estructura anerior del document amb la nova.
         *
         * @param content contingut a partir del cual s'actualitza la estructura
         * @private
         */
        _updateStructure: function (content) {
            var i, j;

            for (i = 0; i < this.data.chunks.length; i++) {
                var cancelThis = content.cancel && content.cancel.indexOf(this.data.chunks[i].header_id) > -1;
                if (this.data.chunks[i].text && !cancelThis) {

                    // Cerquem el header_id a la nova estructura
                    for (j = 0; j < content.chunks.length; j++) {
                        if (content.chunks[j].header_id === this.data.chunks[i].header_id) {
                            if (content.chunks[j].text) {
                                content.chunks[j].text.editing = this.data.chunks[i].text.editing;
                                // console.log("Afegint l'original content a ", content.chunks[j].header_id, this.data.chunks[i].text.originalContent? this.data.chunks[i].text.originalContent.length : false);
                                content.chunks[j].text.originalContent = this.data.chunks[i].text.originalContent || this.data.chunks[i].text.editing;
                            }

                            break;
                        }
                    }
                }
            }
        },

        /**
         * Actualitza els chunks a partir del nou contingut
         *
         * @param content
         * @private
         */
        _updateChunks: function (content, keepOriginalContent) {
            // console.log("StructuredDocumentSubclass#_updateChunks", content, this.editingChunks)

            var i, chunk;

            this.editingChunksCounter = 0;
            this.editingChunks = [];

            for (i = 0; i < content.chunks.length; i++) {
                chunk = content.chunks[i];

                if (this.changedChunks[chunk.header_id]) {
                    if (chunk.text) {

                        if (!this.changedChunks[chunk.header_id]) {
                            this._generateEmptyChangedChunk(chunk.header_id);
                        }

                        if (!keepOriginalContent) {
                            this.changedChunks[chunk.header_id].content = chunk.text.editing;
                        }

                        this.editingChunks.push(chunk.header_id);
                        this.editingChunksCounter++; // TODO[Xavi] Afegir un mètode generic per tots els contentTools que retorni aquest nombre

                    }
                }
            }


        },

        /**
         * Genera un espai al gestor de canvis pel chunk amb l'id passada com argument
         * @param header_id
         * @private
         */
        _generateEmptyChangedChunk: function (header_id) {
            this.changedChunks[header_id] = {};
            this.changedChunks[header_id].changed = false;
        },

        /**
         * Crea el llistat pel control de canvis per chunks.
         *
         * @param {[]} chunks Array de chunks per generar el control de canvis
         * @private
         */
        _generateEmptyChangedChunks: function (chunks) {
            var chunk;

            this.changedChunks = {};

            for (var i = 0; i < chunks.length; i++) {
                chunk = chunks[i];
                this._generateEmptyChangedChunk(chunk.header_id);
                this.changedChunks[chunk.header_id].content = chunk.editing;
            }
        },

        /**
         * Reinicialitza els canvis als chunks passats com argument.
         *
         * @param {string[]} headers
         */
        resetChangesForChunks: function (headers) {
            // console.log("StructuredDcoument#resetChangesForChunks", headers);
            if (headers && !Array.isArray(headers)) {
                headers = [headers];
            } else if (!headers) {
                headers = [];
            }

            for (var i = 0; i < headers.length; i++) {
                if (this.changedChunks[headers[i]]) {
                    this.changedChunks[headers[i]].changed = false;
                    this.changedChunks[headers[i]].content = null;
                }

            }

            this.resetContentChangeState();
        },

        /**
         * Reinicialitza tots els chunks
         */
        resetAllChangesForChunks: function () {
            //console.log("StructuredDocument#resetAllChangesForChunks");
            var headers = [];
            for (var chunk in this.changedChunks) {
                headers.push(chunk);
            }
            this.resetChangesForChunks(headers);
        },

        /**
         * Comprova si algún dels chunks amb les capçaleras passades com arguments te canvis.
         *
         * @param {string[]}headers_id - Array amb les capçaleras a comprovar
         * @returns {boolean} - Cert si qualsevol dels chunks te canvis o fals si tots estan sense canvis
         */
        isAnyChunkChanged: function (headers_id) {
            for (var i = 0; i < headers_id.length; i++) {
                if (this.changedChunks[headers_id[i]] && this.changedChunks[headers_id[i]].changed) {
                    return true;
                } else {
                }
            }
            return false;
        },

        isLockNeeded: function () {

            if (this.getEditingChunks().length > 0) {
                //console.log("Cal activar el lock", this.getEditingChunks().length);
                this.lockDocument();


            } else {
                //console.log("No cal activar fer el lock");
                this.unlockDocument();
            }

        },

        lockEditors: function () {
            var header_id;

            for (header_id in this.editors) {
                this.editors[header_id].editor.lockEditor();
            }


            jQuery('textarea[name="wikitext"]').each(function () {
                jQuery(this).attr('readonly', 'readonly');
            });

            jQuery('input[data-call-type="save_partial"]').each(function () {
                jQuery(this).css('display', 'none');
            });

            for (var i = 0; i < this.data.chunks.length; i++) {
                header_id = this.data.chunks[i].header_id;
                jQuery('#toolbar_' + this.id + '_' + header_id).css('display', 'none')
            }

            this.freePage();
        },

        unlockEditors: function () {
            var header_id;

            for (header_id in this.editors) {
                this.editors[header_id].editor.unlockEditor();
            }


            jQuery('textarea[name="wikitext"]').each(function () {
                jQuery(this).removeAttr('readonly');
            });

            jQuery('input[data-call-type="save_partial"]').each(function () {
                jQuery(this).css('display', 'inherit');
            });


            for (var i = 0; i < this.data.chunks.length; i++) {
                header_id = this.data.chunks[i].header_id;
                jQuery('#toolbar_' + this.id + '_' + header_id).css('display', 'inherit')

            }

        },

        _generateDraftInMemory: function () {
            // console.log("StructuredDocumentSubclass#_generateDraftInMemory");
            var draft = {
                type: this.DRAFT_TYPE,
//                id: this.id,
                id: this.ns,
                content: {}
            };

            var editingChunks = this.getEditingChunks();


            // console.log("Saved drafts??", this.savedDrafts);

            for (var i = 0; i < editingChunks.length; i++) {
                // console.log("Chunk:", editingChunks[i]);

                if (this.getEditor(editingChunks[i])) {
                    content = this.getEditor(editingChunks[i]).getValue();
                } else {
                    // ALERTA[Xavi] Per comprovar, sembla que si un editor es tanca i s'obre l'indx anterior retorna null, en aquest cas no cal fer res amb el draft
                    continue;
                }

                // console.log("Content de l'editor:", content);


                if (this.savedDrafts[editingChunks[i]]) {
                    // console.warn("<<< S'ha trobat a savedDrafts el chunk: " + editingChunks[i]);
                }

                if (!this.savedDrafts[editingChunks[i]] != content) {
                    // console.warn("<<< El contingut del chunk es igual al contingut del textarea");
                }


                if (!this.savedDrafts[editingChunks[i]] || this.savedDrafts[editingChunks[i]] != content) {
                    // console.log("<<<< Afegint content al draft:", content);
                    draft.content[editingChunks[i]] = content;
                    this.savedDrafts[editingChunks[i]] = content;
                }
            }

            // console.log("**** DRAFT CREAT ****", draft);

            return draft;
        },

        // Nous mètodes per la gestió d'editors
        updateEditor: function (header_id, data) {
            //console.log("StructuredDocumentSubclass#updateEditor", header_id, data);
            // Com es per la referencia interna del ace al div del editor s'ha de refer, per axiò els eliminem al pre-render
            this.addEditor(header_id, data);

        },

        // addEditor: function (header_id, data) {
        //     var editor = this.createEditor(data.auxId);
        //
        //     this.editors[header_id] = {
        //         editor: editor
        //     };
        // },
        //
        // // TODO: Copiat a Editor subclass (per generalitzar)
        // createEditor: function (id) {
        //     var $textarea = jQuery('textarea_' + id);
        //
        //     var editor = new AceFacade({
        //         xmltags: JSINFO.
        // plugin_aceeditor.xmltags,
        //         containerId: 'editor_' + id,
        //         textareaId: 'textarea_' + id,
        //         theme: JSINFO.plugin_aceeditor.colortheme,
        //         readOnly: $textarea.attr('readonly'),// TODO[Xavi] cercar altre manera més adient
        //         wraplimit: JSINFO.plugin_aceeditor.wraplimit,
        //         wrapMode: $textarea.attr('wrap') !== 'off',
        //         mdpage: JSINFO.plugin_aceeditor.mdpage,
        //         auxId: id
        //     });
        //
        //     editor.on('change', this._checkChanges.bind(this));
        //
        //     return editor;
        // },


        addEditor: function (header_id, data) {
            // console.log("StructuredDocumentSubclass#addEditor", header_id, data);

            var editor = this.createEditor(
                {
                    id: data.auxId,
                    content: data.content,
                    originalContent: data.originalContent /*|| data.text*/
                }, data.editorType);

            this.editors[header_id] = {
                editor: editor
            };

            editor.on('change', this._checkChanges.bind(this));
        },

        // ALERTA[Xavi] Mateix codi que al BasicEditorSubclass
        createEditor: function (config, type) {
            // console.log("SructuredDocumentSubclass#createEditor", config, type);

            switch (type) {
                case "DOJO":
                    return this.createDojoEditor(config);

                case "ACE": // fall-through intencionat

                default:
                    return this.createAceEditor(config);
            }
        },

        // ALERTA[Xavi] Mateix codi que al BasicEditorSubclass
        createDojoEditor: function (config) {
            return new DojoEditorPartialFacade(
                {
                    id: this.id,
                    parentId: 'container_' + config.id,
                    viewId: 'view_' + config.id,
                    containerId: 'editor_' + config.id,
                    textareaId: 'textarea_' + config.id,
                    dispatcher: this.dispatcher,
                    content: config.content,
                    originalContent: config.originalContent,
                }
            );
        },

        // TODO: Copiat a BasicEditorSubclass (per generalitzar)
        createAceEditor: function (config) {
            var $textarea = jQuery('textarea_' + config.id);


            // console.log("config:", config);
            return new AceFacade({
                id: this.id,
                auxId: config.id,
                xmltags: JSINFO.plugin_aceeditor.xmltags,
                containerId: 'editor_' + config.id,
                textareaId: 'textarea_' + config.id,
                theme: JSINFO.plugin_aceeditor.colortheme,
                readOnly: $textarea.attr('readonly'),// TODO[Xavi] cercar altre manera més adient <-- només canvia això respecte al BasicEditorSubclass#createAceEditor
                wraplimit: JSINFO.plugin_aceeditor.wraplimit,
                wrapMode: $textarea.attr('wrap') !== 'off',
                mdpage: JSINFO.plugin_aceeditor.mdpage,
                dispatcher: this.dispatcher,
                content: config.content,
                originalContent: config.originalContent,
            });
        },

        disableEditor: function (header_id) { // TODO[Xavi] No es fa servir
            this.editors[header_id].editor.hide();
        },

        removeEditors: function () {
            if (!this.editors || Object.keys(this.editors).length === 0) {
                return;
            }

            for (var header_id in this.editors) {
                this.editors[header_id].editor.destroy();
            }

            this.editors = {};
        },

        // Aquesta es la gestió del ressaltat que es trobava a processContentPaje.js
        addSelectionListener: function () {
            if (this.partialDisabled) {
                return;
            }


            //console.log("StructuredDocumentSubclass#addSelectionListener");
            if (this.rev !== null && this.rev !== undefined && this.rev !== '') {
                return;
            }

            var auxId,
                context,
                $container;

            context = this;
            // Al fer click o passar el ratoli per sobre s'activa la selecció
            for (var i = 0; i < this.data.chunks.length; i++) {
                auxId = this.data.id + "_" + this.data.chunks[i].header_id;
                $container = jQuery('#container_' + auxId);

                $container.on('click', function () {
                    // Comprovar si es la secció seleccionada i si el seu state es false (no està en edició)
                    // var currentSelection = context.dispatcher.getGlobalState().getCurrentElement();
                    //
                    // console.log("this id??", this.id, currentSelection.id);
                    //
                    // if (currentSelection.id === this.id && !currentSelection.state) {
                    //     context._setCurrentElement(null);
                    // } else {
                    //     context._setCurrentElement(this.id);
                    // }

                    context._setOwnCurrenElement(this.id);

                    return true;
                });

                $container.on('mouseover mouseout', function () {
                    context._setHighlight(this.id, 'section_highlight');
                    return false;
                });

            }

        },

        _changeAction: function (action) {
            this.dispatcher.getGlobalState().getContent(this.id)["action"] = action;
        },

        getCurrentHeaderId: function () {
            var ret = this.currentElementId;
            ret = ret ? ret.replace(this.id + "_", "").replace("container_", "") : '';
            return ret;
        },

        setCurrentElement: function (sid) {
            var element_id;
            if (sid.startsWith("container_")) {
                element_id = sid;
            } else {
                element_id = "container_" + this.id + "_" + sid;
            }
            this._setCurrentElement(element_id);
        },

        _setCurrentElement: function (element_id) {
            // console.log("StructuredDocumentSubclass#_setCurrentElement", element_id)

            if (element_id) {
                var header_id = element_id.replace('container_' + this.id + '_', '');

                var isEditing = jQuery.inArray(header_id, this.getEditingChunks()) > -1;

                // console.log("element_id??", element_id);
                this.dispatcher.getGlobalState().setCurrentElement(element_id, isEditing);
                this._setHighlight(element_id, 'section_selected');
                this.currentElementId = element_id;

            } else {
                this._removeHighlight('section_selected');
                this.dispatcher.getGlobalState().setCurrentElement(null, false);
                this.currentElementId = null;
            }

            this.dispatcher.updateFromState();


        },

        _getCurrentElementId: function () {
            return this.currentElementId;
        },

        _removeHighlight: function (className) {
            jQuery('.' + className).removeClass(className);
        },

        _setHighlight: function (element_id, className) {
            this._removeHighlight(className);
            jQuery('#' + element_id).addClass(className);
        },


        _doEditPartial: function (event) {
            // console.log("StructuredDocumentSubclass#_doEditPartial", event.id, event);

            var dataToSend = this.getQueryEdit(event.chunk);


            if (event.discard_draft) {
                dataToSend += "&discard_draft=true";
            }

            // console.log("Data to send--->",
            // {
            //     id: this.id,
            //         ns: this.ns,
            //     dataToSend: dataToSend,
            //     standbyId: this.id
            // });

            return {
                id: this.id,
                ns: this.ns,
                dataToSend: dataToSend,
                standbyId: this.id
            };

            //this.eventManager.dispatchEvent(this.eventName.EDIT_PARTIAL, {
            //    id: this.id,
            //    dataToSend: dataToSend,
            //    standbyId: containerId
            //})

        },

        _doSavePartial: function (event) {
            var ret;
            // console.log("StructuredDocumentSubclass#_doSavePartial", this.id, event);

            event = this._mixCachedEvent(event);

            if (this.isContentChangedForChunk(event.chunk)) {

                var dataToSend = this.getQuerySave(event.chunk),
                    containerId = "container_" + event.id + "_" + event.chunk;

                if (event.dataToSend) {
                    dataToSend = this.mixData(dataToSend, event.dataToSend, 'object');
                }

                if (event.extraDataToSend) {
                    // dataToSend = lang.mixin(dataToSend, event.extraDataToSend);
                    dataToSend = this.mixData(dataToSend, event.extraDataToSend, 'object');
                }


                //this.eventManager.dispatchEvent(this.eventName.SAVE_PARTIAL, {
                //    id: this.id,
                //    dataToSend: dataToSend,
                //    standbyId: containerId
                //})


                this.getEditor(event.chunk).resetOriginalContentState();
                this.isContentChanged();

                ret = {
                    id: this.id,
                    dataToSend: dataToSend,
                    standbyId: containerId
                };
            } else {
                //console.log("*** NO HI HA CANVIS ***");
                ret = {
                    _cancel: true
                };
            }


            return ret;
        },

        _doSavePartialAll: function (event) {
            // console.log("StructuredDocumentSubclass#_doSavePartialAll", this.id, event);

            event = this._mixCachedEvent(event);

            var chunkParams = [],
                containerId = this.id;

            for (var header_id in this.editors) {
                chunkParams.push(this.getQuerySave(header_id));
            }

            //this.eventManager.dispatchEvent(this.eventName.SAVE_PARTIAL, {
            //    id: this.id,
            //    dataToSend: dataToSend,
            //    standbyId: containerId
            //})

            this.hasChanges = false;


//            console.log("Chunks per desar: ", {chunk_params: chunkParams});

            /*var section_id = this.dispatcher.getGlobalState().getCurrentElementId();
             section_id= section_id.replace(this.id + "_", "");
             section_id = section_id.replace("container_", "");*/


            var dataToSend = this.mixData(event.dataToSend, event.extraDataToSend, 'object');


            // if (event.extraDataToSend) {
            //     dataToSend = event.extraDataToSend;
            // } else {
            //     dataToSend = {};
            // }


            // if (this.cachedDataToSend) {
            //     if (typeof this.cachedDataToSend === "string") {
            //         dataToSend = lang.mixin(dataToSend, this._stringToObject(this.cachedDataToSend));
            //     } else {
            //         dataToSend = lang.mixin(dataToSend, this.cachedDataToSend);
            //     }
            //     this.cachedDataToSend = null;
            // }


            dataToSend.chunk_params = JSON.stringify(chunkParams);
            dataToSend.id = this.ns;


            return {
                dataToSend: dataToSend,
                standbyId: containerId
            };


        },

        _doCancelPartial: function (event) {
            // console.log("StructuredDocumentSubclass#_doCancelPartial", this.id, event);

            event = this._mixCachedEvent(event);

            var ret;
            var numberOfEditors = Object.keys(this.getEditors()).length;


            if (numberOfEditors <= 1) {
                //ALERTA[Xavi], cancel·lem aquest event i ho rellancem com 'cancel'. No cal desar l'event com cache perquè es passa directament
                // console.log("event.dataToSend?", event.dataToSend);
                if (!event.dataToSend) {
                    event.dataToSend = {};
                }
                event.dataToSend.unlock = true;

                this._fireCancelEvent(event);

                ret = {_cancel: true};

            } else {
                var data = this._getDataFromEvent(event);
                // Les dades que arriben son {id, chunk, name (del event)}

                if (data.discardChanges === undefined && this.isContentChangedForChunk(event.chunk)) {

                    var cancelDialog = this._generateDiscardDialog();
                    cancelDialog.extraData = {chunk: data.chunk};
                    this.cachedEvent = event;
                    cancelDialog.show();

                    ret = {_cancel: true};
                } else {

                    // console.log("--- data.discardChanges", data.discardChanges);

                    var dataToSend = this.getQueryCancel(event.chunk),
                        containerId = "container_" + event.id + "_" + event.chunk;


                    if (event.dataToSend) {
                        dataToSend = this.mixData(dataToSend, event.dataToSend, 'string');
                    }

                    if (event.extraDataToSend) {
                        // dataToSend = lang.mixin(dataToSend, event.extraDataToSend);
                        dataToSend = this.mixData(dataToSend, event.extraDataToSend, 'string');
                    }

                    if (this.required && this.getPropertyValueFromData(dataToSend, 'keep_draft') === false) {
                        this._removePartialDraft(event.chunk);
                    } else {
                        //console.log("No s'elimina l'esborrany parcial", this.getPropertyValueFromData(dataToSend, 'keep_draft'), this.required);
                    }

                    // ALERTA[Xavi] això s'hauria de canviar, el discardChanges i discard_changes són el mateix però es troben per tot arreu amb qualsevol dels dos noms!
                    if (this.getPropertyValueFromData(dataToSend, 'discardChanges')) {
                        dataToSend += "&discard_changes=" + this.getPropertyValueFromData(dataToSend, 'discardChanges');
                    }


                    // if (data.discardChanges) {
                    //     dataToSend += "&discard_changes=" + data.discardChanges;
                    // }
                    //
                    // if (data.keep_draft !== undefined || event.keep_draft !== undefined) {
                    //     dataToSend += "&keep_draft=" + data.keep_draft;
                    //
                    // } else {
                    //     this._removePartialDraft(event.chunk);
                    // }


                    ret = {
                        id: this.id,
                        dataToSend: dataToSend,
                        standbyId: containerId
                    };
                }


            }

            return ret;


            //this.eventManager.dispatchEvent(this.eventName.CANCEL_PARTIAL, {
            //    id: this.id,
            //    dataToSend: dataToSend,
            //    standbyId: containerId
            //})

        },

        _discardChanges: function () {
            // TODO[Xavi] Localitzar
            return confirm("S'han produït canvis al document. Vols tancar-lo?");
            // return confirm(this.messageChangesDetected);
        },


        getEditors: function () {
            return this.editors;
        },

        getEditor: function (header_id) {
            if (header_id && this.editors[header_id]) {
                return this.editors[header_id].editor;
            }
        },


        fillEditorContainer: function () {
            var editors = this.getEditors();

            for (var header_id in editors) {
                this.getEditor(header_id).fillEditorContainer();
            }

        },

        /**
         *
         * @param {Event} event: event per barrejar
         * @param {string} expectedDatatToSendType: tipus del dataToSend esperat: 'string' o 'object'
         * @returns {*}
         * @private
         */


        // TODO[Xavi] Copiat fil per randa de Editor Subclass
        _doCancelDocument: function (event) {
            // console.log("StructuredDocumentSubclass#_doCancelDocument", this.id, event, this.cachedEvent);

            var ret;

            event = this._mixCachedEvent(event);

            // console.log("event:", event);

            var dataToSend, containerId, data = this._getDataFromEvent(event);


            var isAuto = this.getPropertyValueFromData(data.extraDataToSend, 'auto');
            // var isAuto = (data.extraDataToSend && (data.extraDataToSend.indexOf('auto=true') > -1 || data.extraDataToSend.auto === true));

            //ALERTA|TODO[Xavi]: en aquest cas s'ha de fer servir un dialeg diferent, per que el botó ha de disparar SAVE_PARTIAL_ALL
            if (!data.discardChanges && this.isContentChanged() && !isAuto) {
                var cancelDialog = this._generateDiscardAllDialog();
                // this.cachedDataToSend = event.dataToSend; // Aquestes dades es recuperaran a la següent passada que no activi el dialeg

                this.cachedEvent = event;
                cancelDialog.show();

                ret = {_cancel: true};

            } else {


                // if (typeof this.cachedDataToSend === 'object') {
                //     lang.mixin(data, this.cachedDataToSend);
                // }

                if (event.discardChanges || data.discardChanges || data['discard_changes']) {
                    dataToSend = this.getQueryForceCancel(event.id); // el paràmetre no es fa servir
                } else {
                    dataToSend = this.getQueryCancel(event.id); // el paràmetre no es fa servir
                }

                if (event.dataToSend) {
                    dataToSend = this.mixData(dataToSend, event.dataToSend, 'string');
                }

                if (event.extraDataToSend) {
                    // dataToSend = lang.mixin(dataToSend, event.extraDataToSend);
                    dataToSend = this.mixData(dataToSend, event.extraDataToSend, 'string');
                }

                if (this.required && this.getPropertyValueFromData(dataToSend, 'keep_draft') === false) {
                    this._removeAllDrafts();
                } else {
                    //console.log("No s'eliminen els esborranys", this.getPropertyValueFromData(dataToSend, 'keep_draft'), this.required);
                }

                // if (event.dataToSend) {
                //     if (typeof event.dataToSend === 'string') {
                //         dataToSend += '&' + event.dataToSend;
                //     } else {
                //         dataToSend += '&' + jQuery.param(event.dataToSend);
                //     }
                // }


                // if (this.required && data.keep_draft !== undefined) {
                //     dataToSend += '&keep_draft=' + data.keep_draft;
                //
                //     if (!data.keep_draft) {
                //         console.log("## S'eliminan els drafts");
                //         this._removeAllDrafts();
                //     } else {
                //         console.log("## NO ##S'eliminan els drafts");
                //     }
                // }


                // if (event.extraDataToSend) {
                //     dataToSend += '&' + event.extraDataToSend;
                // }
                //
                // if (typeof event.dataToSend === "string") {
                //     dataToSend += "&" + event.dataToSend;
                // }

                if (!this.required) {
                    dataToSend += "&unlock=false";
                }

                // if (this.cachedDataToSend) {
                //     var cachedQuery;
                //     if (typeof this.cachedDataToSend === 'object') {
                //         cachedQuery = jQuery.param(this.cachedDataToSend);
                //     }
                //
                //     dataToSend += "&" + cachedQuery;
                //     this.cachedDataToSend = null;
                // }


                containerId = event.standbyId || event.id;

                //this.eventManager.fireEvent(this.eventName.CANCEL, {
                //    id: this.id,
                //    dataToSend: dataToSend,
                //    standbyId: containerId
                //}, this.id)
                //
                //

                this.freePage();


                if (event.dataToSend && event.dataToSend.close === true || dataToSend.indexOf('close=true') > -1) {
                    // this.removeContentTool();

                    // ALERTA[Xavi] Per forçar el tancament de la pestanya hem de descartar els canvis per actualizar
                    // El ChangesManager i forçar la crida de la pestanya com si s'hagues fet click a la pestanya
                    this.forceReset();
                    // this.discardChanges = true;
                    // this.resetContentChangeState();
                    this.editors = {}; // no pot haver cap editor obert
                    this.container.closeChild(this);


                    ret = {
                        id: this.id,
                        dataToSend: dataToSend
                    }
                } else {
                    ret = {
                        id: this.id,
                        dataToSend: dataToSend,
                        standbyId: containerId
                    }
                }
            }
            return ret;
        },

        _removeAllDrafts: function () {
            // console.log("StructuredDocumentSubclass#_removeAllDrafts", this.id);
            this.draftManager.clearDraft(this.id, this.ns, true);
        },

        _removePartialDraft: function (headerId) {
            // console.log("StructuredDocumentSubclass#_removePartialDraft", headerId);
            var index = this.data.dictionary[headerId],
                chunk = this.data.chunks[index];
            this.draftManager.clearDraftChunks(this.id, this.ns, [chunk.header_id]);
        },

        _getDataFromEvent: function (event) {
            // console.log("StructuredDocumentSubclass#_getDataFromEvent", event);
            if (event.dataToSend) {
                return event.dataToSend;
            } else {
                return event;
            }
        },

        // TODO[Xavi] Copiat fil per randa de Editor Subclass
        getQueryForceCancel: function () {
            var ret = 'do=cancel&discard_changes=true&id=' + this.ns;

            var contentCache = this.dispatcher.getGlobalState().getContent(this.id);

            if (contentCache.projectOwner && contentCache.projectOwner !== 'undefined') {

                ret += "&projectOwner=" + contentCache.projectOwner;
                ret += "&projectSourceType=" + contentCache.projectSourceType;
            }

            return ret;
        },

        setReadOnly: function (value) {
            this.set('readonly', value);
        },

        _getEditorsCount: function () {
            return Object.keys(this.editors).length;
        },

        onClose: function () {
            // ALERTA[Xavi] Es descarta el retorn
            this.inherited(arguments);

            // var ret = this.isContentChanged();
            // console.log("StructuredDocumentSubclass#onClose", ret);

            // ALERTA[Xavi] Si el nombre d'editors es major de 0 s'ha de fer cancel, independentment de si hi han canvis o no per desbloquejar el document!
            var ret = this._getEditorsCount() > 0;

            if (ret) {
                this._fireCancelEvent({
                    dataToSend: {close: true, no_response: true, keep_draft: false}
                });


                // var eventManager = this.dispatcher.getEventManager();
                // eventManager.fireEvent(eventManager.eventName.CANCEL, {
                //     id: this.ns,
                //     name: eventManager.eventName.CANCEL,
                //     dataToSend: {close: true, no_response: true},
                //     standbyId: this.getContainer().domNode.id
                // }, this.id);
            }

            return !ret;
        },

        _fireCancelEvent: function (event) {

            var eventManager = this.dispatcher.getEventManager();
            event.name = eventManager.eventName.CANCEL;
            event.standbyId = this.getContainer().domNode.id;
            event.id = this.ns;

            eventManager.fireEvent(eventManager.eventName.CANCEL, event, this.id);
        },

        requirePage: function () {
            // console.log("StructuredDocumentSubclass#requirePage");
            this.required = this.dispatcher.getGlobalState().requirePage(this);
            this.setReadOnly(!this.required);
        },

        requirePageAgain: function () {
            this.requirePage();

            if (!this.getReadOnly()) {
                this.unlockEditors();
                this.isLockNeeded();
            }
        },


        freePage: function () {
            // console.log("StructuredDocumentSubclass#freePage");
            this.required = false;
            this.dispatcher.getGlobalState().freePage(this.id, this.ns);
            this.fireEvent(this.eventName.FREE_DOCUMENT, {id: this.id})
        },


        onDestroy: function () {
            // console.log("StructuredDocumentSubclass#onDestroy");
//             this.dispatcher.getGlobalState().freePage(this.id, this.ns);
            this.freePage();
            this.inherited(arguments);
        },

        _generateDiscardAllDialog: function (extraDataToSend) {
            // console.log("StructuredDocumentSubclass#_generateDiscardAllDialog", extraDataToSend);
            this.cancelAllDialogConfig.extraDataToSend = extraDataToSend;
            // console.log("StructuredDocumentSubclass#_generateDiscardAllDialog", this.cancelAllDialogConfig);
            var dialog = this.dispatcher.getDialogManager().getDialog('default', 'save_or_cancel_partial_' + this.id, this.cancelAllDialogConfig);
            return dialog;
        },

        getCurrentContent: function () {
            var chunk = this._getCurrentChunk(),
                content = this.getEditor(chunk).getValue();

            return content;
        },

        _getCurrentChunk: function () {
            var dispatcher = this.dispatcher,
                id = this.id,
                chunk = dispatcher.getGlobalState().getCurrentElementId();

            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");

            return chunk;
        },


        getCurrentEditor: function () {
            var chunk = this._getCurrentChunk();
            return this.getEditor(chunk);
        }
    })
});
