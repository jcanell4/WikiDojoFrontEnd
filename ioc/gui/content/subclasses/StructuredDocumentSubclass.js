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
    'dojo/dom-class',
    'ioc/dokuwiki/dwPageUi',
    'dijit/registry',
    'dojo/dom',
    'dojo/dom-geometry',
    'dojo/dom-style',

], function (declare, ChangesManagerCentralSubclass, LocktimedDocumentSubclass, AceFacade, domClass, dwPageUi, registry,
             dom, geometry, style) {

    return declare([ChangesManagerCentralSubclass, LocktimedDocumentSubclass], {

        constructor: function (args) {

            this._generateEmptyChangedChunks(args.content.chunks);
            this.savedDrafts = {};
            this.editors = {}; // A aquest objecte es guardarà per cada header_id el seu editor
            this.currentSectionId = null;
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
            this.addSaveListener(this);
            this.addCancelListener(this);

            this.addEditionListener();
            this.addSelectionListener();

            // El post render es crida sempre després d'haver tornat o carregat una nova edició
            this.discardChanges = false;


            if (this.data.locked) {
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

        // Afegeix una toolbar a cada contenidor
        addToolbars: function () {
            for (var i = 0; i < this.content.chunks.length; i++) {
                var auxId = this.content.id + "_" + this.content.chunks[i].header_id;
                //console.log("Afegint la toolbar... a", aux_id);
                initToolbar('toolbar_' + auxId, 'textarea_' + auxId, window['toolbar']);
            }
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
                        context.dispatchEvent("edit_partial_" + context.id, {id: context.id, chunk: section_id});
                    } else {
                        console.log("Ja s'està editant ", section_id);
                    }

                });
            }
        },


        getQueryEdit: function (section_id) {
            return 'do=edit_partial'
                + '&section_id=' + section_id
                + '&editing_chunks=' + this.getEditingChunks().toString()
                + '&target=section'
                + '&id=' + this.ns
                + '&rev=' + (this.rev || '')
                + '&summary=[' + this.title + ']'
                + '&range=-';
        },

        addSaveListener: function (context) {
            jQuery('#' + context.content.id).find('input[data-call-type="save_partial"]').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                var section_id = jQuery(this).attr('data-section-id');

                context.dispatchEvent("save_partial_" + context.id, {id: context.id, chunk: section_id});

            });
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

            // IMPORTANT! S'ha de fer servir el this.data perquè el this.content no es actualitzat

            // TODO: Només fins al actual Fins al actual,
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
            text = this.editors[header_id].editor.getEditorValue();
            this.updateChunk(header_id, {'editing': text});


            // Afegim un salt per assegurar que no es perdi cap caràcter
            values.prefix = pre + "\n";
            values.suffix = suf;
            values.wikitext = text;

            console.log("Data to save:", values);

            return values;
        },

        addCancelListener: function (context) {
            jQuery('#' + context.content.id).find('input[data-call-type="cancel_partial"]').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                var section_id = jQuery(this).attr('data-section-id');
                context.dispatchEvent("cancel_partial_" + context.id, {id: context.id, chunk: section_id});

            });
        },

        getQueryCancel: function (section_id) {
            return 'do=cancel_partial&id=' + this.ns + '&section_id=' + section_id
                + '&editing_chunks=' + this.getEditingChunks().join(',');
        },

        getEditingChunks: function () {
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

            console.log("StructuredDocumentSubclass#postLoad");

            this.eventManager = this.dispatcher.getEventManager();

            this.eventManager.registerEventForBroadcasting(this, "edit_partial_" + this.id, this._doEditPartial.bind(this));
            this.eventManager.registerEventForBroadcasting(this, "save_partial_" + this.id, this._doSavePartial.bind(this));
            this.eventManager.registerEventForBroadcasting(this, "cancel_partial_" + this.id, this._doCancelPartial.bind(this));

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

            // * El editing dels chunks en edicio es diferent del $textarea corresponent
            var chunk,
                $textarea,
                result = false;

            if (this.discardChanges) {
                //this.discardChanges = false;
                return false;
            }


            for (var i = 0; i < this.data.chunks.length; i++) {
                chunk = this.data.chunks[i];

                if (chunk.text) {
                    $textarea = jQuery('#textarea_' + this.id + "_" + chunk.header_id);

                    if (this._getOriginalContent(chunk.header_id) != $textarea.val()) {
                        result = true;

                        this.changedChunks[chunk.header_id].changed = true;
                        this.onDocumentChanged();

                    } else {
                        this.changedChunks[chunk.header_id].changed = false;
                    }
                }
            }

            //console.log("#isContentChanged", result, this.changedChunks);
            return result;

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

                        console.log("ChangedChunks:", this.changedChunks, "header_id", header_id);
                        this.changedChunks[header_id].content = chunk.text.editing;
                        return chunk.text.editing;
                    }
                }
            }
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
            //console.log('StructuredDocumentSubclass#updateDocument', content);
            this._updateChunks(content);
            this._updateStructure(content);
            this.updateTitle(content);


            if (content.locked) {
                this.lockEditors();
            }

            this.setData(content);
            this.render();

            // Si existeix una secció seleccionada, la reseleccionem
            if (this._getCurrentSectionId()) {
                this._setCurrentSection(this._getCurrentSectionId());
            }

            //TODO:canvia la edició de view a edit
            if (Object.keys(this.editors).length == 0) {
                this._changeAction("view");
            } else {
                this._changeAction("sec_edit");
            }
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

        generateDraft: function () {
            var draft = {
                type: 'structured',
                id: this.id,
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

            //TODO[Xavi] crear el div editor amb jQuery

            var $textarea = jQuery('textarea_' + data.auxId);
            //$textarea.before('<div id=' + 'editor_' + data.auxId + '></div>');


            console.log("JSINFO:", JSINFO);

            var editor = new AceFacade({
                xmltags: JSINFO.plugin_aceeditor.xmltags,
                containerId: 'editor_' + data.auxId,
                textareaId: 'textarea_' + data.auxId,
                theme: JSINFO.plugin_aceeditor.colortheme,
                readOnly: $textarea.attr('readonly'),// TODO[Xavi] cercar altre manera més adient
                wraplimit: JSINFO.plugin_aceeditor.wraplimit,
                wrapMode: $textarea.attr('wrap') !== 'off',
                mdpage: JSINFO.plugin_aceeditor.mdpage,
                auxId: data.auxId
            });

            this.editors[header_id] = {
                editor: editor
            };

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
                    context._setCurrentSection(this.id);
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

        _setCurrentSection: function (section_id) {

            var isEditing = jQuery.inArray(section_id.replace('container_' + this.id + '_', ''), this.getEditingChunks()) > -1;

            this.dispatcher.getGlobalState().setCurrentElement(section_id, isEditing);
            this._setHighlight(section_id, 'section_selected');
            this.currentSectionId = section_id;
            this.dispatcher.updateFromState(); // TODO[Xavi] Això es cridarà des del globalState.setCurrentElement()
        },

        _getCurrentSectionId: function () {
            return this.currentSectionId;
        },

        _setHighlight: function (section_id, className) {
            var that = this;

            jQuery('.' + className).each(function () {
                //jQuery(this).removeClass('section_highlight');
                $this = jQuery(this);
                if ($this.attr('id').indexOf('container_' + that.id) > -1) {
                    jQuery(this).removeClass(className);
                }

            });

            //jQuery('#' + section_id).addClass('section_highlight');
            jQuery('#' + section_id).addClass(className);
        },


        _doEditPartial: function (event) {
            //console.log("StructuredDocumentSubclass#_doEditPartial", event.id, event);

            var dataToSend = this.getQueryEdit(event.chunk),
                containerId = "container_" + event.id + "_" + event.chunk;

            this.eventManager.dispatchEvent("edit_partial", {
                id: this.id,
                dataToSend: dataToSend,
                standbyId: containerId
            })

        },

        // TODO[Xavi] Canviar: Ha de fer servir post
        _doSavePartial: function (event) {
            //console.log("StructuredDocumentSubclass#_doSavePartial", this.id, event);

            var dataToSend = this.getQuerySave(event.chunk),
                containerId = "container_" + event.id + "_" + event.chunk;

            this.eventManager.dispatchEvent("save_partial", {
                id: this.id,
                dataToSend: dataToSend,
                standbyId: containerId
            })

        },

        _doCancelPartial: function (event) {
            //console.log("StructuredDocumentSubclass#_doCancelPartial", this.id, event);

            var dataToSend = this.getQueryCancel(event.chunk),
                containerId = "container_" + event.id + "_" + event.chunk;

            this.eventManager.dispatchEvent("cancel_partial", {
                id: this.id,
                dataToSend: dataToSend,
                standbyId: containerId
            })

        },

        //TODO[Xavi] Copiat de processAceEditor
        //TODO: no es tracta d'un editor, si no del array d'editors, tenim la llista?

        getEditors: function () {
            return this.editors;
        },

        fillEditorContainer: function () {
            var editorNode = dom.byId(this.id),
                h = geometry.getContentBox(editorNode).h,
                editors = this.getEditors();

            for (var header_id in editors) {

                console.log("header", header_id, "editors:", editors);
                //console.log("Canviant mida del texarea a: " + h); // TODO: Conservarem la opció de treballar amb el textarea?
                //style.set(params.textAreaId, "height", "" + h - 50 + "px");

                console.log("Canviant mida del editor a: " + h);
                // TODO[Xavi] Extreure la diferencia d'alçada a una 'constant'
                //style.set(editors[header_id].editor.iocAceEditor.containerId, "height", "" + h - 50 + "px"); // TODO [Xavi] això no pot queda així, afegir una mètode al editor per obternir la informació.
                editors[header_id].editor.setHeight(h-50); //

            }


        }

    })
});