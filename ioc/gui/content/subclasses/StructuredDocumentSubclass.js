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
    "dojo/_base/declare",
    "ioc/gui/content/subclasses/ChangesManagerCentralSubclass",
    "ioc/gui/content/subclasses/LocktimedDocumentSubclass",
    "dojo/_base/lang"
], function (declare, ChangesManagerCentralSubclass, LocktimedDocumentSubclass, lang) {

    return declare([ChangesManagerCentralSubclass, LocktimedDocumentSubclass], {

        constructor: function (args) {

            this._generateEmptyChangedChunks(args.content.chunks);
            //this._createRequest();
            this.savedDrafts = {}
        },


        /**
         * Al post render s'afegeix la funcionalitat de reconstruir els prefix i suffix necessaris per la wiki al
         * fer click en el botó de desar i s'afegeix la toolbar a cada editor.
         *
         * @override
         */
        postRender: function () {


            this.inherited(arguments);

            // Afegeix una toolbar a cada contenidor
            for (var i = 0; i < this.content.chunks.length; i++) {
                var aux_id = this.content.id + "_" + this.content.chunks[i].header_id;
                //console.log("Afegint la toolbar... a", aux_id);
                initToolbar('toolbar_' + aux_id, 'textarea_' + aux_id, window['toolbar']);
            }

            // Afegeix un handler pel submit. TODO[Xavi] hi ha interferencies amb el submit així que fem servir el clik
            var that = this;

            jQuery('input[data-call-type="save_partial"]').on('click', function () {


                var $form = jQuery(this).closest('form');

                var values = {};
                jQuery.each($form.serializeArray(), function (i, field) {
                    values[field.name] = field.value;
                });

                var header_id = values['section_id'];
                var pre = '';

                // IMPORTANT! S'ha de fer servir el this.data perquè el this.content no es actualitzat
                var chunks = that.data.chunks;

                var editingIndex = -1;

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
                        pre += that.changedChunks[chunks[i].header_id].content;
                    }
                }

                var suf = '';

                for (i = editingIndex + 1; i < chunks.length; i++) {
                    if (chunks[i].text) {

                        suf += chunks[i].text.pre;
                        suf += chunks[i].text.editing;
                    }
                }
                suf += that.data.suf || '';

                // Actualitzem el formulari
                // Afegim un salt per assegurar que no es perdi cap caràcter
                jQuery('#' + $form.attr('id') + ' input[name="prefix"]').val(pre + "\n");
                jQuery('#' + $form.attr('id') + ' input[name="suffix"]').val(suf);


                // Actualitcem el contingut del editing
                var $textarea = jQuery('#' + $form.attr('id') + " textarea"),
                    text = $textarea.val();
                // TODO[xavi] només cal actualitzar l'editing o es necessari també el start i end? Si es així llavors car fer-ho a la resposta

                $textarea.val(text);
                that.updateChunk(header_id, {'editing': text});


            });


            // Al fer doble click s'activa la edició
            for (i = 0; i < this.content.chunks.length; i++) {
                aux_id = this.content.id + "_" + this.content.chunks[i].header_id;
                // TODO[Xavi] Afegir listener per doble click als contenidors (al view)
                jQuery('#container_' + aux_id).on('dblclick', function () {

                    var aux_id = this.id.replace('container_', ''),
                        section_id = aux_id.replace(that.id + "_", ''),
                        editing_chunks,
                        query = 'do=edit_partial'
                            + '&section_id=' + section_id
                            + '&editing_chunks=' + that.getEditingChunks().toString()// TODO[Obtenir la llista de chunks en edició -> crear una funció per fer això
                            + '&target=section'
                            + '&id=' + that.ns
                            + '&rev=' + (that.rev || '')
                            + '&summary=[' + that.title + ']'
                            + '&range=-';

                    that.requester.urlBase = 'lib/plugins/ajaxcommand/ajax.php?call=edit_partial';

                    that.requester.sendRequest(query);
                });
            }

            // El post render es crida sempre després d'haver tornat o carregat una nova edició
            this.discardChanges = false;


            if (this.data.locked) {
                this.lockEditors();
            } else {
                this.unlockEditors();
                this.isLockNeeded();
            }

        },

        getEditingChunks: function () {
            var editingChunks = [];
            for (var i = 0; i < this.data.chunks.length; i++) {
                if (this.data.chunks[i].text) {
                    editingChunks.push(this.data.chunks[i].header_id);
                }
            }

            return editingChunks;
        },

        //// TODO[Xavi] copiat de MetaMediaDeatailsSubclass
        //_createRequest: function () {
        //
        //    require(["ioc/wiki30/Request"], lang.hitch(this, function (Request) {
        //        this.requester = new Request();
        //
        //        this.requester.updateSectok = function (sectok) {
        //            this.sectok = sectok;
        //        };
        //
        //        this.requester.sectok = this.requester.dispatcher.getSectok();
        //        this.requester.dispatcher.toUpdateSectok.push(this.requester);
        //    }));
        //},

        enableEdition: function (aux_id) {
            console.log("enabling edition for: ", aux_id);

            var $viewContainer = jQuery('#view_' + aux_id);
            var $editContainer = jQuery('#edit_' + aux_id);

            $editContainer.css('display', '');
            $viewContainer.css('display', 'none');
        },

        // TODO[Xavi] No es fa servir actualment
        disableEdition: function (header_id) {
            //console.log("StructuredDocumentSubclass#disableEditing", header_id);

            var $viewContainer = jQuery('#view_' + aux_id);
            var $editContainer = jQuery('#edit_' + aux_id);

            $editContainer.css('display', 'none');
            $viewContainer.css('display', '');
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
        },

        /**
         * @override
         */
        postAttach: function () {
            this.registerToChangesManager();
            jQuery(this.domNode).on('input', this._checkChanges.bind(this));
            this.inherited(arguments);
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
            this._updateChunks(content);
            this._updateStructure(content);
            this.setData(content);
            this.render();
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

            for (i = 0; i < content.chunks.length; i++) {
                chunk = content.chunks[i];

                if (this.changedChunks[chunk.header_id]) {
                    if (chunk.text) {

                        if (!this.changedChunks[chunk.header_id]) {
                            this._generateEmptyChangedChunk(chunk.header_id);
                        }

                        this.changedChunks[chunk.header_id].content = chunk.text.editing;
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
            jQuery('textarea[name="wikitext"]').each(function () {
                jQuery(this).attr('readonly', 'readonly');
            });

            jQuery('input[data-call-type="save_partial"]').each(function () {
                jQuery(this).css('display', 'none');
            });

            for (var i = 0; i < this.data.chunks.length; i++) {
                var header_id = this.data.chunks[i].header_id;
                jQuery('#toolbar_' + this.id + '_' + header_id).css('display', 'none')
            }
        },

        unlockEditors: function () {
            jQuery('textarea[name="wikitext"]').each(function () {
                jQuery(this).removeAttr('readonly');
            });

            jQuery('input[data-call-type="save_partial"]').each(function () {
                jQuery(this).css('display', 'visible');
            });


            for (var i = 0; i < this.data.chunks.length; i++) {
                var header_id = this.data.chunks[i].header_id;
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

        //changesNotDiscarded: function() {
        //    this.locktimer.refreshed();
        //}

    })
});
