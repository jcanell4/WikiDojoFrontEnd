/**
 * Aquest métode es fa servir juntament amb extend(), els mètodes seràn reemplaçats, es a dir no continua
 * la cadena de crides.
 *
 *
 * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
 *
 * S'ha deixat com un fitxer independent per facilitar la seva edició i no pot comptarse amb que sigui accesible
 * en el futur.
 *
 * Aquesta classe s'espera que es mescli amb un DocumentContentTool que incorpori un AbstractChangesManager
 * per afegir-li les funcionalitats comunes dels documents editables de la pestanya central que son:
 *
 *      - Canviar el color de la pestanya a vermell quan hi han canvis
 *      - Canviar el color de la pestanya a negre quan els canvis es restableixin
 *      - Disparar els esdeveniment document_changed i document_changes_reset quan calgui
 *      - Demanar confirmació abans de tancar si s'han realitzat canvis
 *
 * Les crides a aquests mètodes es faran desde la clase decorada.
 *
 * @class AbstractChangesManagerCentralSubclass
 * @extends AbstractChangesManagerSubclass
 * @author Xavier García <xaviergaro.dev@gmail.com>
 * @private
 * @abstract
 */

define([
    "dojo/_base/declare",
    "ioc/gui/content/subclasses/ChangesManagerCentralSubclass",
], function (declare, ChangesManagerCentralSubclass) {

    return declare([ChangesManagerCentralSubclass], {


        postRender: function () {

            this.inherited(arguments);

            for (var i = 0; i < this.content.chunks.length; i++) {
                var aux_id = this.content.id + "_" + this.content.chunks[i].header_id;
                //console.log("Afegint la toolbar... a", aux_id);
                initToolbar('toolbar_' + aux_id, 'textarea_' + aux_id, window['toolbar']);
            }


            // Afegim el handler pel submit
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

                //console.log("Reconstruint amb chunks: ", chunks);

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

            jQuery('input[data-call-type="cancel_partial"]').on('click', function () {
                var $form = jQuery(this).closest('form');

                var values = {};
                jQuery.each($form.serializeArray(), function (i, field) {
                    values[field.name] = field.value;
                });

                var header_id = values['section_id'];

                that.cancellingHeader = header_id;


            });
        },

        updateChunk: function (header_id, text) {
            var chunk, found = false;

            // Actualitzem també els canvis
            this.changedChunks[header_id].changed = false;
            this.changedChunks[header_id].content = text.editing;

            for (var i = 0; i < this.data.chunks.length && !found; i++) {
                chunk = this.data.chunks[i];
                if (chunk.header_id === header_id) {
                    if (chunk.text) {
                        for (var item in text) {
                            chunk.text[item] = text[item];
                            found = true;
                            break;
                        }

                    } else {
                        //console.log("Aquest chunk " + header_id + " no te cap text que actualitzar:", chunk);
                        found = true;
                    }


                }
            }
        },

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

        postAttach: function () {

            //TODO[Xavi] Aquesta crida s'ha de fer aquí perque si no el ContentTool que es registra es l'abstracta
            this.registerToChangesManager();

            jQuery(this.domNode).on('input', this._checkChanges.bind(this));

            this.inherited(arguments);
        },

        _checkChanges: function () {

            // Si el document està bloquejat mai hi hauran canvis
            if (!this.locked) {
                this.changesManager.updateContentChangeState(this.id);
            }
        },

        isContentChanged: function () {

            // * El editing dels chunks en edicio es diferent del $textarea corresponent
            var chunk,
                $textarea,
                result = false;


            for (var i = 0; i < this.data.chunks.length; i++) {
                chunk = this.data.chunks[i];

                if (chunk.text) {
                    $textarea = jQuery('#textarea_' + this.id + "_" + chunk.header_id);

                    if (this._getOriginalContent(chunk.header_id) != $textarea.val()) {

                        //if (chunk.text.editing != $textarea.val()) {
                        result = true;

                        this.changedChunks[chunk.header_id].changed = true;
                        this.onDocumentChanged();
                        //break;
                    } else {
                        this.changedChunks[chunk.header_id].changed = false;
                    }
                }
            }

            //console.log("#isContentChanged", result, this.changedChunks);
            return result;

        },

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


        _isChunkChanged: function (header_id) {
            var chunk, $textarea;

            return !!this.changedChunks[header_id].changed;

            //for (var i = 0; i < this.data.chunks.length; i++) {
            //    chunk = this.data.chunks[i];
            //
            //    if (chunk.text && chunk.header_id == header_id) {
            //        $textarea = jQuery('#textarea_' + this.id + "_" + chunk.header_id);
            //        if (chunk.text.editing != $textarea.val()) {
            //            return true;
            //        }
            //    }
            //}
            //
            //return false;

        },

        /**
         * Reinicialitza l'estat del document, eliminant-lo de la llista de modificats
         */
        resetContentChangeState: function () {

            for (var header_id in this.changedChunks) {
                if (this.changedChunks[header_id].changed) {
                    // Mentre hi hagi un chunk amb canvis no es fa
                    // el reset

                    return;
                }
            }

            //console.log("#resetContentChangeState");
            delete this.changesManager.contentsChanged[this.id];
            this.onDocumentChangesReset();
        }

    });
});
