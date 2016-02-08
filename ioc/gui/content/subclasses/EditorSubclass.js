define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "ioc/gui/content/subclasses/LocktimedDocumentSubclass",
], function (declare, lang, on, LocktimedDocumentSubclass) {

    return declare([LocktimedDocumentSubclass],

        /**
         * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
         *
         * S'ha deixat com un fitxer independent per facilitar la seva edició i no pot comptarse amb que sigui accesible
         * en el futur.
         *
         * Aquesta classe s'espera que es mescli amb un DocumentContentTool per afegir-li les funcions de edició de documents
         * amb un ACE-Editor.
         *
         * @class EditorSubclass
         * @extends DocumentSubclass, AbstractChangesManagerCentral
         * @author Xavier García <xaviergaro.dev@gmail.com>
         * @private
         * @see contentToolFactory.generate()
         */
        {
            /**
             * El contingut original inicial s'ha de passar a travès del constructor dins dels arguments com la
             * propietat originalContent.
             *
             * @param args
             */
            constructor: function (args) {
                this._setOriginalContent(args.originalContent);
            },


            /**
             * Retorna cert si el contingut actual i el contingut original son iguals o fals si no ho son.
             *
             * @returns {boolean} - Retorna true si el contingut ha canviat o false en cas contrari
             */
            isContentChanged: function () {
                var content = this.getCurrentContent(),
                    result = !(this._getOriginalContent() == content);

                if (result) {
                    this.onDocumentChanged();
                }

                return result;
            },

            /**
             * Reinicialitza l'estat del document establint el valor del contingut original igual al del contingut
             * actual.
             */
            resetContentChangeState: function () {
                this._setOriginalContent(this.getCurrentContent());
                this.onDocumentChangesReset();
            },

            /**
             * Es registra als esdeveniments i activa la detecció de canvis, copiar, enganxar i pijar tecles dins
             * del node on es troba quest ContentTool.
             *
             * Realitza l'enregistrament al ChangesManager.
             *
             * @override
             */
            //postAttach: function () {
            //
            //    //TODO[Xavi] Aquesta crida s'ha de fer aquí perque si no el ContentTool que es registra es l'abstracta
            //    this.registerToChangesManager();
            //
            //
            //    jQuery(this.domNode).on('input paste cut keyup', this._checkChanges.bind(this));
            //
            //
            //    if (!this.locked) {
            //        this.lockDocument();
            //    }
            //
            //    this.inherited(arguments);
            //},
            //


            postAttach: function () {
                this.registerToChangesManager();

                jQuery(this.domNode).on('input paste cut keyup', this._checkChanges.bind(this));
                this.inherited(arguments);

                console.log("StructuredDocumentSubclass#postLoad");

                this.eventManager = this.dispatcher.getEventManager();

                //this.eventManager.registerEventForBroadcasting(this, "edit_" + this.id, this._doEdit.bind(this));
                this.eventManager.registerEventForBroadcasting(this, "save_" + this.id, this._doSave.bind(this));
                this.eventManager.registerEventForBroadcasting(this, "cancel_" + this.id, this._doCancel.bind(this));

                //this.updateTitle(this.data); // TODO[xavi] Comprovar si això cal o es crida el de documentSubclass
            },

            //_doEdit: function (event) { // TODO[Xavi] esborrar? sempre està en edició
            //    //console.log("StructuredDocumentSubclass#_doEditPartial", event.id, event);
            //
            //    var dataToSend = this.getQueryEdit(event.id),
            //        containerId = "container_" + event.id;
            //
            //    this.eventManager.dispatchEvent("edit", {
            //        id: this.id,
            //        dataToSend: dataToSend,
            //        standbyId: containerId
            //    })
            //
            //},

            _doSave: function (event) {
                //console.log("StructuredDocumentSubclass#_doSavePartial", this.id, event);

                var dataToSend = this.getQuerySave(event.id),
                    containerId = "container_" + event.id;

                this.eventManager.dispatchEvent("save", {
                    id: this.id,
                    dataToSend: dataToSend,
                    standbyId: containerId
                })

            },

            _doCancel: function (event) {
                //console.log("StructuredDocumentSubclass#_doCancelPartial", this.id, event);

                var dataToSend = this.getQueryCancel(event.id),
                    containerId = "container_" + event.id;

                this.eventManager.dispatchEvent("cancel", {
                    id: this.id,
                    dataToSend: dataToSend,
                    standbyId: containerId
                })

            },


            getQuerySave: function (id) {

                var $form = jQuery('#form_' + this.id),
                    values = {},
                    //header_id,
                    //pre = '',
                    //suf = '',
                    text;
                    //chunks = this.data.chunks,
                    //editingIndex = -1;



                jQuery.each($form.serializeArray(), function (i, field) {
                    values[field.name] = field.value;
                });


                //header_id = values['section_id'];

                // IMPORTANT! S'ha de fer servir el this.data perquè el this.content no es actualitzat

                //// TODO: Només fins al actual Fins al actual,
                //for (var i = 0; i < chunks.length; i++) {
                //
                //    if (chunks[i].header_id === header_id) {
                //        editingIndex = i;
                //        pre += chunks[i].text.pre;
                //        break;
                //    }
                //
                //    if (chunks[i].text) {
                //        pre += chunks[i].text.pre;
                //        //pre += chunks[i].text.editing;
                //        pre += this.changedChunks[chunks[i].header_id].content;
                //    }
                //}


                //for (i = editingIndex + 1; i < chunks.length; i++) {
                //    if (chunks[i].text) {
                //        suf += chunks[i].text.pre;
                //        suf += chunks[i].text.editing;
                //    }
                //}
                //suf += this.data.suf || '';

                // Actualitzem les dades d'edició

                console.log("This?", this, "section_id:", id);

                text = this.getCurrentContent();

                // Afegim un salt per assegurar que no es perdi cap caràcter
                //values.prefix = pre + "\n";
                //values.suffix = suf;
                values.wikitext = text;

                console.log("Data to save:", values);

                return values;
            },

            getQueryCancel: function (section_id) {
                return 'do=cancel&id=' + this.ns + '&section_id=' + section_id
                    + '&editing_chunks=' + this.getEditingChunks().join(',');
            },



            /**
             * Comunica al ChangesManager que pot haver canvis.
             *
             * @private
             */
            _checkChanges: function () {
                // Si el document està bloquejat mai hi hauran canvis
                if (!this.locked) {
                    this.changesManager.updateContentChangeState(this.id);
                }
            },

            /**
             * Retorna el que està establert com a contingut original per fer comprovacions sobre canvis.
             *
             * @returns {string} - Contingut original
             * @private
             */
            _getOriginalContent: function () {
                return this.originalContent;
            },

            /**
             * Estableix el contingut passat com paràmetre com a contingut original.
             *
             * @param {string} content - Contingut a establir com original
             * @private
             */
            _setOriginalContent: function (content) {
                this.originalContent = content;
            },

            /**
             * Retorna el text contingut al editor per la id passada com argument o la del id del document actual si
             * no s'especifica.
             *
             * @returns {string|null} - Text contingut al editor
             * o null si no existeix
             */
            getCurrentContent: function () {
                var contentCache = this.dispatcher.getContentCache(this.id),
                    content;

                try {
                    if (contentCache.isAceEditorOn()) {
                        content = contentCache.getEditor().iocAceEditor.getText();

                    } else {
                        content = contentCache.getEditor().$textArea.context.value;
                    }

                    content = '\n' + content + '\n';

                } catch (error) {
                    console.error("Error detectat: ", error);
                }

                return content;
            },


            /**
             * Al ser seleccionat aquest ContentTool estableix l'editor com a sel·leccionat.
             *
             * La primera vegada que es selecciona el content tool encara no es troba carregat al ContentCache per això
             * s'ha de fer la comprovació.
             *
             * @override
             */
            onSelect: function () {
                var contentCache = this.dispatcher.getContentCache(this.id);

                if (contentCache && contentCache.getEditor()) {
                    this.dispatcher.getContentCache(this.id).getEditor().select();
                }

                this.inherited(arguments);
            },

            /**
             * Al ser des-seleccionat aquest ContentTool es des-selecciona l'editor.
             *
             * Ens assegurem que existeix l'editor abans de des-seleccionar-lo per evitar errors.
             *
             * @override
             */
            onUnselect: function () {
                var contentCache = this.dispatcher.getContentCache(this.id);

                if (contentCache && contentCache.getEditor()) {
                    this.dispatcher.getContentCache(this.id).getEditor().unselect();
                }

                this.inherited(arguments);
            },


            /**
             * Descarta els canvis al document actual i restaura els originals
             */
            discardChanges: function () {
                // TODO: fer la substitució del contingut i comprovar que està sincronitzat amb el ACEEditor, i si no ho està comprovar si es necessari sincronitzar-lo.

                this.inherited(arguments);
            },

            generateDraft: function () {
                return {
                    type: 'full',
                    id: this.id,
                    content: this.getCurrentContent()
                };
            },



        });
});