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

define([
    'dojo/_base/declare',
    'ioc/gui/content/subclasses/ChangesManagerCentralSubclass',
    'ioc/gui/content/subclasses/LocktimedDocumentSubclass',
    'ioc/dokuwiki/AceManager/AceFacade',
    'dojo/dom',
    'dojo/dom-geometry',
    'ioc/dokuwiki/AceManager/toolbarManager'
], function (declare, ChangesManagerCentralSubclass, LocktimedDocumentSubclass, AceFacade, dom, geometry, toolbarManager) {

    return declare([ChangesManagerCentralSubclass, LocktimedDocumentSubclass], {

        TOOLBAR_ID: 'partial_edit',
        VERTICAL_MARGIN: 100, // TODO [Xavi]: Pendent de decidir on ha d'anar això definitivament. si aquí o al AceFacade
        MIN_HEIGHT: 200, // TODO [Xavi]: Pendent de decidir on ha d'anar això definitivament. si aquí o al AceFacade

        DRAFT_TYPE: 'structured',

        constructor: function (args) {

            this._generateEmptyChangedChunks(args.content.chunks);
            this.savedDrafts = {};
            this.editors = {}; // A aquest objecte es guardarà per cada header_id el seu editor
            this.currentSectionId = null;
            this.hasChanges = false;

            toolbarManager.setDispatcher(args.dispatcher);
        },


        /**
         * Al post render s'afegeix la funcionalitat de reconstruir els prefix i suffix necessaris per la wiki al
         * fer click en el botó de desar i s'afegeix la toolbar a cada editor.
         *
         * @override
         */
        postRender: function () {

            this.inherited(arguments);

            this.addToolbars();
            this.addEditors();

            this.addEditionListener();
            this.addSelectionListener();

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

                    if (this.editors[this.data.chunks[i].header_id]) {
                        this.updateEditor(this.data.chunks[i].header_id, {auxId: auxId});

                    } else {
                        this.addEditor(this.data.chunks[i].header_id, {auxId: auxId});
                    }

                } else {
                    if (this.editors[this.data.chunks[i].header_id]) {
                        this.disableEditor(this.data.chunks[i].header_id);
                    }
                }
            }
        },

        addToolbars: function () {
            //console.log("StructuredDocumentSubclass#addToolbars");
            var auxId;

            this.addButtons();

            for (var i = 0; i < this.data.chunks.length; i++) {

                if (this.data.chunks[i].text) {
                    auxId = this.data.id + "_" + this.data.chunks[i].header_id;
                    toolbarManager.initToolbar('toolbar_' + auxId, 'textarea_' + auxId, this.TOOLBAR_ID);
                }
            }
        },

        addButtons: function () {
            var argSave = {
                    type: "SaveButton",
                    title: "Desar",
                    icon: "/iocjslib/ioc/gui/img/save.png"
                },

                argCancel = {
                    type: "BackButton",
                    title: "Tornar",
                    icon: "/iocjslib/ioc/gui/img/back.png"
                },

                confEnableAce = {
                    type: "EnableAce",
                    title: "Activar/Desactivar ACE",
                    icon: "/iocjslib/ioc/gui/img/toggle_on.png"
                },

                confEnableWrapper = {
                    type: "EnableWrapper", // we havea new type that links to the function
                    title: "Activar/Desactivar embolcall",
                    icon: "/iocjslib/ioc/gui/img/wrap.png"
                };

            toolbarManager.addButton(confEnableWrapper, this._funcEnableWrapper.bind(this.dispatcher), this.TOOLBAR_ID);
            toolbarManager.addButton(confEnableAce, this._funcEnableAce.bind(this.dispatcher), this.TOOLBAR_ID);
            toolbarManager.addButton(argSave, this._funcSave.bind(this.dispatcher), this.TOOLBAR_ID);
            toolbarManager.addButton(argCancel, this._funcCancel.bind(this.dispatcher), this.TOOLBAR_ID);
        },

        // ALERTA[Xavi] this fa referencia al dispatcher
        _funcSave: function () {
            console.log("StructuredDocumentSubclass#_funcSave");

            var chunk = this.getGlobalState().getCurrentElementId(),
                id = this.getGlobalState().getCurrentId(),
                eventManager = this.getEventManager();

            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");


            //console.log("StructuredDocumentSubclass#_funcSave", id, chunk);

            eventManager.fireEvent(eventManager.eventName.SAVE_PARTIAL, {
                id: id,
                chunk: chunk
            }, id);
        },

        /**
         * Activa o desactiva l'editor ACE segons l'estat actual
         *
         * @returns {boolean} - Sempre retorna fals.
         */
        _funcEnableAce: function () {
            var chunk = this.getGlobalState().getCurrentElementId(),
                id = this.getGlobalState().getCurrentId();
            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");
            var editor = this.getContentCache(id).getMainContentTool().getEditor(chunk);

            editor.toggleEditor();

        },

        _funcCancel: function () {
            var chunk = this.getGlobalState().getCurrentElementId(),
                id = this.getGlobalState().getCurrentId(),
                eventManager = this.getEventManager();

            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");

            //this.getEventManager().dispatchEvent(eventManager.eventNameCompound.CANCEL_PARTIAL + id, {
            //    id: id,
            //    chunk: chunk
            //});
            eventManager.fireEvent(eventManager.eventName.CANCEL_PARTIAL, {
                id: id,
                chunk: chunk
            }, id);
        },

        /**
         * Activa o desactiva l'embolcall del text.
         * @returns {boolean} - Sempre retorna fals
         */
        _funcEnableWrapper: function () {
            var chunk = this.getGlobalState().getCurrentElementId(),
                id = this.getGlobalState().getCurrentId(),
                editor;
            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");

            editor = this.getContentCache(id).getMainContentTool().getEditor(chunk);
            editor.toggleWrap();
        },

        addEditionListener: function () {
            //console.log("StructuredDocumentSubclass#addEditionListener");
            if (this.rev !== null && this.rev !== undefined && this.rev !== '') {
                return;
            }


            var auxId,
                context = this;

            // Al fer doble click s'activa la edició
            for (var i = 0; i < this.data.chunks.length; i++) {
                auxId = this.data.id + "_" + this.data.chunks[i].header_id;

                jQuery('#container_' + auxId).on('dblclick', function () {


                    var aux_id = this.id.replace('container_', ''),
                        section_id = aux_id.replace(context.id + "_", '');

                    if (jQuery.inArray(section_id, context.editingChunks) === -1) {

                        //console.log("contex id: ", context.id, "chunk:", section_id);

                        context.fireEvent(context.eventName.EDIT_PARTIAL, {
                            id: context.id,
                            chunk: section_id
                        });
                        //context.dispatchEvent(context.eventNameCompound.EDIT_PARTIAL + context.id, {
                        //    id: context.id,
                        //    chunk: section_id
                        //});
                    } else {
                        console.log("Ja s'està editant ", section_id);
                    }

                });
            }
        },


        getQueryEdit: function (chunkId) {
            console.log("StructuredDocumentSubclass#getQueryEdit", chunkId);
            var query = 'do=edit_partial'
                + '&section_id=' + chunkId
                + '&editing_chunks=' + this.getEditingChunks().toString()
                + '&target=section'
                + '&id=' + this.ns
                + '&rev=' + (this.rev || '')
                + '&summary=[' + this.title + ']'
                + '&range=-';
            if(this.type == "requiring_partial"){
                query += "&to_require=true"
            }


            query += this._generateLastLocalDraftTimesParam(chunkId);


            return query;
        },

        _generateLastLocalDraftTimesParam: function (chunkId) {
            //return '&structured_last_loca_draft_time=42';
            return this.draftManager.generateLastLocalDraftTimesParam(this.id, chunkId);

        },

        getQuerySave: function (section_id) {
            var $form = jQuery('#form_' + this.id + "_" + section_id),
                values = {},
                header_id,
                pre = '',
                suf = '',
                text,
                chunks = this.data.chunks,
                editingIndex = -1;


            jQuery.each($form.serializeArray(), function (i, field) {
                values[field.name] = field.value;
            });

            header_id = values['section_id'];

            // ALERTA[Xavi]! S'ha de fer servir el this.data perquè el this.content no es actualitzat
            for (var i = 0; i < chunks.length; i++) {

                if (chunks[i].header_id === header_id) {
                    editingIndex = i;
                    pre += chunks[i].text.pre;
                    break;
                }

                if (chunks[i].text) {
                    pre += chunks[i].text.pre;
                    //pre += chunks[i].text.editing;
                    pre += this.changedChunks[chunks[i].header_id].content;
                }
            }


            for (i = editingIndex + 1; i < chunks.length; i++) {
                if (chunks[i].text) {
                    suf += chunks[i].text.pre;
                    suf += chunks[i].text.editing;
                }
            }
            suf += this.data.suf || '';

            // Actualitzem les dades d'edició

            text = this.editors[header_id].editor.getValue();
            this.updateChunk(header_id, {'editing': text});


            // Afegim un salt per assegurar que no es perdi cap caràcter
            values.prefix = pre + "\n";
            values.suffix = suf;
            values.wikitext = text;

            return values;
        },

        getQueryCancel: function (section_id) {
            var ret = 'do=cancel_partial&id=' + this.ns + '&section_id=' + section_id
                + '&editing_chunks=' + this.getEditingChunks().join(',');
            if(this.type == "requiring_partial"){
                ret += "&to_require=true"
            }
            return ret;
        },

        getEditingChunks: function () { // TODO[Xavi] Aquest recompte es practicament idèntic al del updateChunks(content)

            this.editingChunksCounter = 0;
            this.editingChunks = [];

            for (var i = 0; i < this.data.chunks.length; i++) {
                chunk = this.data.chunks[i];

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

            jQuery(this.domNode).on('input paste cut keyup', this._checkChanges.bind(this));
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

            this.updateTitle(this.data);
        },


        // TODO[Xavi] Actualment no fa res especial
        _checkChanges: function () {

            // Si el document està bloquejat mai hi hauran canvis
            if (!this.locked) {
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

            //console.log("StructuredDocumentSubclass#isContentChanged");

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
                    diffFromOriginal = this._getOriginalContent(chunk.header_id) != content;
                    diffFromLastCheck = this.isLastCheckedContentChanged(chunk.header_id, content);


                    this.changedChunks[chunk.header_id].changed = diffFromOriginal;

                    // Només cal 1 modificat per que s'apliqui el canvi
                    documentChanged |= diffFromOriginal;
                    documentRefreshed |= diffFromLastCheck;

                }
            }

            if (documentChanged && !this.hasChanges) {
                this.onDocumentChanged();
                this.hasChanges = true;
            } else if (!documentChanged) {
                this.hasChanges = false;
            }

            if (documentRefreshed) {
                this.onDocumentRefreshed();
            }

            return documentChanged;
        },

        isContentChangedForChunk: function (chunkId) {
            console.log("StructuredDocumentSubclass#isContentChangedForChunk", chunkId, this.data);
            var index = this.data.dictionary[chunkId],
                chunk = this.data.chunks[index],
                $textarea,
                content;


                if (chunk.text) {
                    $textarea = jQuery('#textarea_' + this.id + "_" + chunk.header_id);
                    content = $textarea.val();
                    return this._getOriginalContent(chunk.header_id) != content
                } else {
                    return false;
                }

        },

        isLastCheckedContentChanged: function (header_id, content) {
            //var result = !(this.changedChunks[header_id].lastChecked == content);
            var lastCheckedContent = this._getLastCheckedContent(header_id);
            var result = false;
            
            if(lastCheckedContent){
                result = lastCheckedContent != content;
            }else{
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
        _getOriginalContent: function (header_id) {
            if (this.changedChunks[header_id] && this.changedChunks[header_id].content) {

                return this.changedChunks[header_id].content;

            } else {

                var chunk;
                for (var i = 0; i < this.data.chunks.length; i++) {
                    chunk = this.data.chunks[i];

                    if (chunk.text && chunk.header_id == header_id) {

                        //console.log("ChangedChunks:", this.changedChunks, "header_id", header_id);
                        this.changedChunks[header_id].content = chunk.text.editing;
                        return chunk.text.editing;
                    }
                }
            }
        },

        _setOriginalContent: function (header_id, content) {
//            console.log("StructuredDocumentSubclass#_setOriginalContent", header_id, content);


            var index = this.data.dictionary[header_id],
                chunk = this.data.chunks[index];

//            console.log("Contingut anterior:", chunk.text.editing );

            chunk.text.editing = content;

//            console.log("Contingut actual:", chunk.text.editing );




        },

        /**
         * Reinicialitza l'estat del document, eliminant-lo de la llista de modificats
         * @override
         */
        resetContentChangeState: function () {

            for (var header_id in this.changedChunks) {
                if (this.changedChunks[header_id].changed) {
                    // Mentre hi hagi un chunk amb canvis no es fa el reset
                    return;
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
            var draft, index;
            //console.log('StructuredDocumentSubclass#updateDocument', content);

            if (content.recover_local === true) {
                draft = this.getDraftChunk(content.selected);
                index = content.dictionary[content.selected];

                //console.log("Draft:", draft);
                //console.log("Content:", content.chunks[index].text.editing);

                content.chunks[index].text.editing = draft;
            }

            this._updateChunks(content);
            this._updateStructure(content);
            this.updateTitle(content);


            if (content.locked) {
                this.lockEditors();
            }

            if (content.editing) {
                this.setReadOnly(content.editing.readonly);
            }

            this.setData(content);
            this.render();

            // Si existeix una secció seleccionada i no es tracta d'una revisió, la reseleccionem
            console.log("És una revisió? ", this.rev);
            if (this._getCurrentSectionId() && !this.rev) {
                this._setCurrentSection(this._getCurrentSectionId());
            }

            //TODO:canvia la edició de view a edit
            if (Object.keys(this.editors).length == 0) {
                this._changeAction("view");
            } else {
                this._changeAction("sec_edit");
            }
        },
        
        hasEditors: function(){
          return (Object.keys(this.editors).length > 0);  
        },

        /**
         * TODO[Xavi] Generalitzar, compartit per tots els editors de documents que suportin control de versions (duplicat a DocumentSubclass)
         *
         * @param content
         */
        updateTitle: function (content) {
            var title = content.title;

            if (content.rev) {
                title += " - Revisió (" + content.rev + ")";
            }

            this.controlButton.set("label", title); // controlButton es una propietat heretada de Dijit.ContentPane
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
        _updateChunks: function (content) {
            console.log("StructuredDocumentSubclass#_updateChunks", content);
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

                        this.changedChunks[chunk.header_id].content = chunk.text.editing;
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
            //console.log("StructuredDcoument#resetChangesForChunks", headers);
            if (headers && !Array.isArray(headers)) {
                headers = [headers];
            } else if (!headers) {
                headers = [];
            }

            for (var i = 0; i < headers.length; i++) {
                this.changedChunks[headers[i]].changed = false;
                this.changedChunks[headers[i]].content = null;
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
                jQuery(this).css('display', 'visible');
            });


            for (var i = 0; i < this.data.chunks.length; i++) {
                header_id = this.data.chunks[i].header_id;
                jQuery('#toolbar_' + this.id + '_' + header_id).css('display', 'visible')
            }
        },

        _generateDraft: function () {
            var draft = {
                type: this.DRAFT_TYPE,
//                id: this.id,
                id: this.ns,
                content: {}
            };

            var editingChunks = this.getEditingChunks();

            for (var i = 0; i < editingChunks.length; i++) {

                var content = jQuery('#textarea_' + this.id + '_' + editingChunks[i]).val();

                if (!this.savedDrafts[editingChunks[i]] || this.savedDrafts[editingChunks[i]] != content) {
                    draft.content[editingChunks[i]] = content;
                    this.savedDrafts[editingChunks[i]] = draft.content[editingChunks[i]];
                }
            }

            return draft;
        },

        // Nous mètodes per la gestió d'editors
        updateEditor: function (header_id, data) {
            // Com es per la referencia interna del ace al div del editor s'ha de refer, per axiò els eliminem al pre-render
            this.addEditor(header_id, data);

        },

        addEditor: function (header_id, data) {
            var editor = this.createEditor(data.auxId);

            this.editors[header_id] = {
                editor: editor
            };
        },

        // TODO: Copiat a Editor subclass (per generalitzar)
        createEditor: function (id) {
            var $textarea = jQuery('textarea_' + id);

            return new AceFacade({
                xmltags: JSINFO.plugin_aceeditor.xmltags,
                containerId: 'editor_' + id,
                textareaId: 'textarea_' + id,
                theme: JSINFO.plugin_aceeditor.colortheme,
                readOnly: $textarea.attr('readonly'),// TODO[Xavi] cercar altre manera més adient
                wraplimit: JSINFO.plugin_aceeditor.wraplimit,
                wrapMode: $textarea.attr('wrap') !== 'off',
                mdpage: JSINFO.plugin_aceeditor.mdpage,
                auxId: id
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
                    var currentSelection = context.dispatcher.getGlobalState().getCurrentElement();

                    if (currentSelection.id === this.id && !currentSelection.state) {
                        context._setCurrentSection(null);
                    } else {
                        context._setCurrentSection(this.id);
                    }

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

        setCurrentSection: function (sid) {
            var section_id;
            if(sid.startsWith("container_")){
                section_id = sid;
            }else{
                section_id = "container_" + this.id + "_" + sid;
            }
            this._setCurrentSection(section_id);
        },
        
        _setCurrentSection: function (section_id) {

            if (section_id) {
                var isEditing = jQuery.inArray(section_id.replace('container_' + this.id + '_', ''), this.getEditingChunks()) > -1;

                this.dispatcher.getGlobalState().setCurrentElement(section_id, isEditing);
                this._setHighlight(section_id, 'section_selected');
                this.currentSectionId = section_id;

            } else {
                this._removeHighlight('section_selected');
                this.dispatcher.getGlobalState().setCurrentElement(null, false);
                this.currentSectionId = null;
            }

            this.dispatcher.updateFromState();


        },

        _getCurrentSectionId: function () {
            return this.currentSectionId;
        },

        _removeHighlight: function(className) {
            jQuery('.' + className).removeClass(className);
        },

        _setHighlight: function (section_id, className) {
            this._removeHighlight(className);
            jQuery('#' + section_id).addClass(className);
        },


        _doEditPartial: function (event) {
            console.log("StructuredDocumentSubclass#_doEditPartial", event.id, event);

            var dataToSend = this.getQueryEdit(event.chunk),
                containerId = "container_" + event.id + "_" + event.chunk;

            return {
                id: this.id,
                dataToSend: dataToSend,
                standbyId: containerId
            };

            //this.eventManager.dispatchEvent(this.eventName.EDIT_PARTIAL, {
            //    id: this.id,
            //    dataToSend: dataToSend,
            //    standbyId: containerId
            //})

        },

        _doSavePartial: function (event) {
            console.log("StructuredDocumentSubclass#_doSavePartial", this.id, event);




            if (this.isContentChangedForChunk(event.chunk)) {
                var dataToSend = this.getQuerySave(event.chunk),
                    containerId = "container_" + event.id + "_" + event.chunk;

                //this.eventManager.dispatchEvent(this.eventName.SAVE_PARTIAL, {
                //    id: this.id,
                //    dataToSend: dataToSend,
                //    standbyId: containerId
                //})

                this.hasChanges = false;

                return {
                    id: this.id,
                    dataToSend: dataToSend,
                    standbyId: containerId
                };
            } else {
                console.log("*** NO HI HAN CANVIS ***");
                return {
                    _cancel: true
                };
            }

        },

        _doSavePartialAll: function (event) {
            console.log("StructuredDocumentSubclass#_doSavePartialAll", this.id, event);


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


            console.log("Chunks per desar: ", {chunk_params: chunkParams});

            var section_id = this.dispatcher.getGlobalState().getCurrentElementId();
            section_id= section_id.replace(this.id + "_", "");
            section_id = section_id.replace("container_", "");


            return {
                dataToSend: {chunk_params: JSON.stringify(chunkParams), id: event.id, section_id: section_id},
                standbyId: containerId
            };


        },


        _doCancelPartial: function (event) {
            console.log("StructuredDocumentSubclass#_doCancelPartial", this.id, event);

            var dataToSend = this.getQueryCancel(event.chunk),
                containerId = "container_" + event.id + "_" + event.chunk;

            return {

                id: this.id,
                dataToSend: dataToSend,
                standbyId: containerId
            };

            //this.eventManager.dispatchEvent(this.eventName.CANCEL_PARTIAL, {
            //    id: this.id,
            //    dataToSend: dataToSend,
            //    standbyId: containerId
            //})

        },

        //TODO[Xavi] Copiat de processAceEditor
        //TODO: no es tracta d'un editor, si no del array d'editors, tenim la llista?

        getEditors: function () {
            return this.editors;
        },

        getEditor: function (header_id) {
            return this.editors[header_id].editor;
        },

        fillEditorContainer: function () {

//            var editorNode = dom.byId(this.id),
//                viewNode, p,
//                h = geometry.getContentBox(editorNode).h, //bodyContent
//                editors = this.getEditors();
            var editorNode = dom.byId(this.dispatcher.containerNodeId),
                viewNode, p,
                h = geometry.getContentBox(editorNode).h, //bodyContent
                editors = this.getEditors();


            for (var header_id in editors) {
                jQuery('#view_' + this.id + '_' + header_id).css('display', 'block'); // TODO[Xavi] Solució temporal, el block ha de ser visible per calcular l'alçada

                viewNode = dom.byId('view_' + this.id + '_' + header_id);
                p = geometry.getContentBox(viewNode).h;

                jQuery('#view_' + this.id + '_' + header_id).css('display', 'none');  // TODO[Xavi] Solució temporal, el block ha de ser visible per calcular l'alçada

                var min = this.MIN_HEIGHT,
                    max = h - this.VERTICAL_MARGIN;

                editors[header_id].editor.setHeight(Math.max(min, Math.min(p, max))); //

            }


        },

        // TODO[Xavi] Copiat fil per randa de Editor Subclass
        _doCancelDocument: function (event) {
            console.log("EditorSubclass#_doCancel", this.id, event);
            var dataToSend, containerId, data = this._getDataFromEvent(event);


            if (data.discardChanges || data['discard_changes']) {
                dataToSend = this.getQueryForceCancel(event.id); // el paràmetre no es fa servir
            } else {
                dataToSend = this.getQueryCancel(event.id); // el paràmetre no es fa servir
            }

            if (data.keep_draft) {
                dataToSend += '&keep_draft=' + data.keep_draft;
            }

            if (event.extraDataToSend) {
                dataToSend += '&' + event.extraDataToSend;
            }

            if (typeof event.dataToSend === "string") {
                dataToSend += "&" + event.dataToSend;
            }

            containerId = event.id;

            //this.eventManager.fireEvent(this.eventName.CANCEL, {
            //    id: this.id,
            //    dataToSend: dataToSend,
            //    standbyId: containerId
            //}, this.id)
            //
            //

            return {
                id: this.id,
                dataToSend: dataToSend,
                standbyId: containerId
            }

        },

        _getDataFromEvent: function (event) {
            if (event.dataToSend) {
                return event.dataToSend;
            } else {
                return event;
            }
        },

        // TODO[Xavi] Copiat fil per randa de Editor Subclass
        getQueryForceCancel: function () {
            return 'do=cancel&discard_changes=true&id=' + this.ns;
        },

        setReadOnly: function (value) {
            this.set('readonly', value);
        },

        getReadOnly: function () {
            return this.get('readonly');
        },

        onClose: function() {
            var eventManager = this.dispatcher.getEventManager();
            eventManager.fireEvent(eventManager.eventName.CANCEL, {id: this.id, dataToSend: "no_response=true"}, this.id);
            return this.inherited(arguments);
        }
    })
});
