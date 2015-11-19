define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory"

], function (declare, ContentProcessor, contentToolFactory) {

    return declare([ContentProcessor],
        /**
         * Aquesta classe s'encarrega de processar els continguts per documents de tipus Html, generar els ContentTool
         * apropiat i afegir-lo al contenidor adequat.
         *
         * @class HtmlContentProcessor
         * @extends ContentProcessor
         * @author Josep Cañellas <jcanell4@ioc.cat>, Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "html_partial",

            /**
             * Processa el valor rebut com argument com a un document estructurat. Si el doucument ja existeix refresca
             * la informació.
             *
             *
             * @param {Content} value - Valor per processar
             * @param {Dispatcher} dispatcher - Dispatcher al que està lligat aquest document.
             * @override
             */
            process: function (value, dispatcher) {

                var changesManager = dispatcher.getChangesManager(),
                    confirmation = false,
                    id = value.id,
                    cache = dispatcher.getContentCache(value.id),
                    contentTool;


                // Si ja existeix el ContentTool i es un html_partial, processem la edició parcial.
                // TODO[Xavi] no estem fent el control de refreshable com al ContentProcessor
                // Per fer-ho s'ha de crear una classe nova i sobrescriure el mètode updateDocument.

                if (cache) {
                    contentTool = cache.getMainContentTool();
                }


                if (contentTool && contentTool.type === this.type) {
                    // Es una edició, el passem a primer pla
                    contentTool.getContainer().selectChild(contentTool);

                    // Si s'ha retornat un selected es que es tracta d'una nova edició
                    if (changesManager.isChanged(id) && !value.selected) {

                        // Comprovar si la nova estructura conté tots els headers que estan en edició actualment
                        // Recorrem els headers en edició actual, si estan tots a la nova estructura no importan els canvis

                        //for (var i=0; i<this.data.chunks.length;i++) {
                        //    var chunk=this.data.chunks[i];
                        //    if
                        //}

                        console.log("old:", contentTool.data);
                        console.log("new:", value);

                        //
                        //if (contentTool.cancellingHeader) {
                        //    confirmation = true;
                        //} else {



                        confirmation = dispatcher.discardChanges();
                        //}


                    } else {
                        confirmation = true;
                    }

                    if (confirmation) {
                        if (contentTool.cancellingHeader) {
                            contentTool.changedChunks[contentTool.cancellingHeader].changed = false;
                            contentTool.changedChunks[contentTool.cancellingHeader].content= null;
                        }


                        // Si hi ha selected es una edició parcial, conservem l'estat de canvis.
                        // NO, pot ser que retorni de un tornar!
                        //if (!contentTool.isContentChanged()) {
                        //    console.log("Fem el reset de l'estat");
                        contentTool.resetContentChangeState();
                        //}else {
                        //    console.log("No fem el reset");
                        //}
                        //


                        return this._processPartialEdition(value, dispatcher);
                    }

                    // Si no hi ha confirmació no fem res, s'ignora el process


                } else {

                    return this.inherited(arguments);
                }

            },

            /**
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument, i afegeix
             * el valor de la acció a "view".
             *
             * @param {Dispatcher} dispatcher - Dispatcher al que està lligat aquest process
             * @param {Content} value - Valor per processar
             * @override
             */
            updateState: function (dispatcher, value) {
                this.inherited(arguments);
                dispatcher.getGlobalState().getContent(value.id).action = "view";
                dispatcher.getGlobalState().getContent(value.id).rev = value.rev;
            },

            /**
             * Genera un ContentTool decorat adecuadament per funcionar com document de només lectura.
             *
             * @param {Content} content - Contingut a partir del qual es generarà el ContentTool
             * @param {Dispatcher} dispatcher - Dispatcher al que estarà lligat el ContentTool
             * @returns {ContentTool} ContentTool decorat com a tipus document.
             * @protected
             * @override
             */
            createContentTool: function (content, dispatcher) {
                var args,
                    changedChunks = this._generateChangedChunks(content.chunks);


                args = {
                    ns: content.ns,
                    id: content.id,
                    title: content.title,
                    content: content,
                    closable: true,
                    dispatcher: dispatcher,
                    rev: content.rev,
                    type: this.type,
                    changedChunks: changedChunks,


                    postRender: function () {

                        this.inherited(arguments);

                        for (var i = 0; i < content.chunks.length; i++) {
                            var aux_id = content.id + "_" + content.chunks[i].header_id;
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
                            console.log("This changed?", that._isChunkChanged(header_id));


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


                };


                var contentTool = contentToolFactory.generate(contentToolFactory.generation.STRUCTURED_DOCUMENT, args),

                    argsRequestForm = {
                        urlBase: "lib/plugins/ajaxcommand/ajax.php?call=edit_partial&do=edit_partial",
                        form: '.btn_secedit',
                        volatile: true,
                        continue: false
                    },

                    argsRequestForm2 = {
                        //urlBase: "lib/plugins/ajaxcommand/ajax.php?call=save_partial",
                        form: '.form_save',
                        volatile: true,
                        continue: false
                    };


                return contentTool.decorate(contentToolFactory.decoration.REQUEST_FORM, argsRequestForm)
                    .decorate(contentToolFactory.decoration.REQUEST_FORM, argsRequestForm2);

            },

            _generateChangedChunks: function (chunks) {
                var chunk,
                    changedChunks = {};

                for (var i = 0; i < chunks.length; i++) {
                    chunk = chunks[i];
                    changedChunks[chunk.header_id] = {};
                    changedChunks[chunk.header_id].changed = false;
                    changedChunks[chunk.header_id].content = chunk.editing;

                }

                return changedChunks;
            },

            _processPartialEdition: function (content, dispatcher) {
                var i, j,
                    mainContentTool = dispatcher.getContentCache(content.id).getMainContentTool(),
                    oldStructure = mainContentTool.data,
                    newStructure = content;

                // Actualitzem la llista de chunks canviats abans de fusionar amb el contingut actual
                for (i = 0; i < newStructure.chunks.length; i++) {
                    var chunk = newStructure.chunks[i];

                    if (mainContentTool.changedChunks[chunk.header_id]) {
                        if (chunk.text) {

                            if (!mainContentTool.changedChunks[chunk.header_id]) {
                                // Si no existia el creem buit
                                mainContentTool.changedChunks[chunk.header_id] = {};
                                mainContentTool.changedChunks[chunk.header_id].changed = false;
                            }

                            // Actualitzem el contingut amb el rebut
                            mainContentTool.changedChunks[chunk.header_id].content = chunk.text.editing;
                        }
                    }
                }



                for (i = 0; i < oldStructure.chunks.length; i++) {
                    var cancelThis = newStructure.cancel && newStructure.cancel.indexOf(oldStructure.chunks[i].header_id) > -1;
                    if (oldStructure.chunks[i].text && !cancelThis) {
                        // Cerquem el header_id a la nova estructura
                        for (j = 0; j < newStructure.chunks.length; j++) {
                            if (newStructure.chunks[j].header_id === oldStructure.chunks[i].header_id) {
                                if (newStructure.chunks[j].text) {
                                    newStructure.chunks[j].text.editing = oldStructure.chunks[i].text.editing;
                                }

                                break;
                            }
                        }
                        // Si no es troba es que aquesta secció ha sigut eliminada

                    }
                }



                //console.log("Nous chunks rebuts:", newStructure);

                mainContentTool.setData(newStructure);
                mainContentTool.render();

                dispatcher.getGlobalState().getContent(content.id).rev = content.rev;

                return 0;
            }
        })


});
