define([
    "dojo/_base/declare",
    "dojo/on",
    "ioc/gui/content/subclasses/LocktimedDocumentSubclass",
    'ioc/dokuwiki/AceManager/toolbarManager',
    'ioc/dokuwiki/AceManager/AceFacade',
    'dojo/dom-geometry',
    'dojo/dom',
    'ioc/wiki30/Draft',
], function (declare, on, LocktimedDocumentSubclass, toolbarManager, AceFacade, geometry, dom) {

    return declare([LocktimedDocumentSubclass],
        //return declare(null,

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

            TOOLBAR_ID: 'full_editor',
            VERTICAL_MARGIN: 0,
            MIN_HEIGHT: 200, // TODO [Xavi]: Penden de decidir on ha d'anar això definitivament. si aquí o al AceFacade

            DRAFT_TYPE: 'full',

            /**
             * El contingut original inicial s'ha de passar a travès del constructor dins dels arguments com la
             * propietat originalContent.
             *
             * @param args
             */
            constructor: function (args) {
                this._setOriginalContent(args.originalContent);
                this.hasChanges = false;
            },


            setReadOnly: function (value) {
                this.set("readonly", value);
            },

            getReadOnly: function () {
                return this.get("readonly");
            },

            /**
             * Retorna cert si el contingut actual i el contingut original son iguals o fals si no ho son.
             *
             * @returns {boolean} - Retorna true si el contingut ha canviat o false en cas contrari
             */
            isContentChanged: function () {
                var content = this.getCurrentContent(),
                    diffFromOriginal = this._getOriginalContent() != content,
                    diffFromLastCheck = this.isLastCheckedContentChanged();


                if (diffFromOriginal && diffFromLastCheck) { // No es fa el refresc si encara no s'ha produt cap canvi
                    this.onDocumentRefreshed();
                }

                if (diffFromOriginal && !this.hasChanges) {
                    this.onDocumentChanged();
                    this.hasChanges = true;
                }

                return diffFromOriginal;
            },

            /**
             * Reinicialitza l'estat del document establint el valor del contingut original igual al del contingut
             * actual.
             */
            resetContentChangeState: function () {
                this.hasChanges = false;
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
            postAttach: function () {
                //console.log("EditorSubclass#postAttach");
                this.registerToChangesManager();

                jQuery(this.domNode).on('input paste cut keyup', this._checkChanges.bind(this));
                this.inherited(arguments);

                this.lockDocument(); // Lock i Draft

                this.registerToEvent(this, this.eventName.DOCUMENT_SELECTED, this.fillEditorContainer.bind(this)); // Alerta[Xavi] Necessari per redimensionar correctament l'editor quan es recarrega amb més d'una pestanya
                this.registerToEvent(this, this.eventName.DATA_REPLACED, this.fillEditorContainer.bind(this)); // Alerta[Xavi] Necessari per redimensionar correctament l'editor quan es recarrega amb més d'una pestanya
                this.registerToEvent(this, this.eventName.CONTENT_SELECTED, this.fillEditorContainer.bind(this)); // Alerta[Xavi] Necessari per redimensionar correctament l'editor quan es recarrega amb més d'una pestanya

                this.eventManager = this.dispatcher.getEventManager();

                this.eventManager.registerEventForBroadcasting(this, this.eventNameCompound.SAVE + this.id, this._doSave.bind(this));
                this.eventManager.registerEventForBroadcasting(this, this.eventNameCompound.CANCEL + this.id, this._doCancelDocument.bind(this));

                this.fillEditorContainer();
            },


            _doSave: function (event) {
                //console.log("StructuredDocumentSubclass#_doSavePartial", this.id, event);

                var dataToSend = this.getQuerySave(event.id),
                    containerId = event.id;

                this.eventManager.dispatchEvent(this.eventName.SAVE, {
                    id: this.id,
                    dataToSend: dataToSend,
                    standbyId: containerId
                })

            },

            // Alerta[Xavi] el event pot contenir informació que cal afegir al dataToSend, com per exemple el keep_draft i el discardChanges
            _doCancelDocument: function (event) {
                //console.log("EditorSubclass#_doCancel", this.id, event);
                var dataToSend, containerId;

                if (event.discardChanges) {
                    dataToSend = this.getQueryForceCancel(event.id); // el paràmetre no es fa servir
                } else {
                    dataToSend = this.getQueryCancel(event.id); // el paràmetre no es fa servir
                }

                if (event.keep_draft) {
                    dataToSend += '&keep_draft=' + event.keep_draft;
                }

                containerId = event.id;

                this.eventManager.dispatchEvent(this.eventName.CANCEL, {
                    id: this.id,
                    dataToSend: dataToSend,
                    standbyId: containerId
                })

            },


            getQuerySave: function (id) {

                var $form = jQuery('#form_' + this.id),
                    values = {},
                    text;

                jQuery.each($form.serializeArray(), function (i, field) {
                    values[field.name] = field.value;
                });

                text = this.getCurrentContent();

                values.wikitext = jQuery.trim(text);

                return values;
            },

            getQueryCancel: function () {
                return 'do=cancel&id=' + this.ns;
            },

            getQueryForceCancel: function () {
                return 'do=cancel&discard_changes=true&id=' + this.ns;
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
                var content = this.getEditor().getValue();
                //console.log('EditorSubclass#getCurrentContent', content);
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
                    type: this.DRAFT_TYPE,
                    id: this.id,
                    content: jQuery.trim(this.getCurrentContent())
                };
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

                on(window, 'resize', function () {
                    this.fillEditorContainer();
                }.bind(this));

                this.fillEditorContainer();
            },

            // Afegeix un editorAce per cada editor actiu
            addEditors: function () {
                this.editor = this.createEditor(this.id);
            },

            createEditor: function (id) {
                var $textarea = jQuery('#textarea_' + id); // TODO[Xavi] Només cal per determinar el wrap, si es passa des del servidor no caldria

                return new AceFacade({
                    xmltags: JSINFO.plugin_aceeditor.xmltags,
                    containerId: 'editor_' + id,
                    textareaId: 'textarea_' + id,
                    theme: JSINFO.plugin_aceeditor.colortheme,
                    readOnly: this.getReadOnly(),
                    wraplimit: JSINFO.plugin_aceeditor.wraplimit,
                    wrapMode: $textarea.attr('wrap') !== 'off',
                    mdpage: JSINFO.plugin_aceeditor.mdpage,
                    auxId: id
                });
            },

            // TODO[Xavi] en aquest cas només cal una toolbar
            addToolbars: function () {
                if (this.getReadOnly()) {
                    return;
                }
                this.addButtons();
                toolbarManager.initToolbar('toolbar_' + this.id, 'textarea_' + this.id, this.TOOLBAR_ID);
            },

            addButtons: function () {
                var argSave = {
                        type: 'SaveButton',
                        title: 'Desar',
                        icon: '/iocjslib/ioc/gui/img/save.png'
                    },

                    argCancel = {
                        type: 'BackButton',
                        title: 'Tornar',
                        icon: '/iocjslib/ioc/gui/img/back.png'
                    },

                    confEnableAce = {
                        type: 'EnableAce',
                        title: 'Activar/Desactivar ACE',
                        icon: '/iocjslib/ioc/gui/img/toggle_on.png'
                    },

                    confEnableWrapper = {
                        type: 'EnableWrapper', // we havea new type that links to the function
                        title: 'Activar/Desactivar embolcall',
                        icon: '/iocjslib/ioc/gui/img/wrap.png'
                    };


                toolbarManager.addButton(confEnableWrapper, this._funcEnableWrapper.bind(this.dispatcher), this.TOOLBAR_ID);
                toolbarManager.addButton(confEnableAce, this._funcEnableAce.bind(this.dispatcher), this.TOOLBAR_ID);
                toolbarManager.addButton(argSave, this._funcSave.bind(this.dispatcher), this.TOOLBAR_ID);
                toolbarManager.addButton(argCancel, this._funcCancel.bind(this.dispatcher), this.TOOLBAR_ID);
            },

            /**
             * Activa o desactiva l'embolcall del text.
             * @returns {boolean} - Sempre retorna fals
             * @protected
             */
            _funcEnableWrapper: function () {
                var id = this.getGlobalState().getCurrentId(),
                    editor = this.getContentCache(id).getMainContentTool().getEditor();

                editor.toggleWrap();
            },

            /**
             *
             * @protected
             */
            _funcSave: function () {
                var id = this.getGlobalState().getCurrentId(),
                    eventManager = this.getEventManager();
                eventManager.dispatchEvent(eventManager.eventNameCompound.SAVE + id, {id: id});
            },

            /**
             * Activa o desactiva l'editor ACE segons l'estat actual
             *
             * @returns {boolean} - Sempre retorna fals.
             * @protected
             */
            _funcEnableAce: function () {
                var id = this.getGlobalState().getCurrentId(),
                    editor = this.getContentCache(id).getMainContentTool().getEditor();
                editor.toggleEditor();
            },

            /**
             *
             * @protected
             */
            _funcCancel: function () {
                var id = this.getGlobalState().getCurrentId(),
                    eventManager = this.getEventManager();
                eventManager.dispatchEvent(eventManager.eventNameCompound.CANCEL + id, {id: id});
            },

            getEditor: function () {
                return this.editor;
            },

            fillEditorContainer: function () {
                //console.log('EditorSubclass#fillEditorContainer');
                var contentNode = dom.byId(this.id),
                    h = geometry.getContentBox(contentNode).h,
                    max = h - this.VERTICAL_MARGIN;

                //console.log("Alçada:", h);
                this.editor.setHeight(Math.max(this.MIN_HEIGHT, max));

            },

            isLastCheckedContentChanged: function () {
                var content = this.getCurrentContent(),
                    result = this._getLastCheckedContent() != content;

                if (result) {
                    this._setLastCheckedContent(content);
                }

                return result;
            },

            _getLastCheckedContent: function () {
                return this.lastCheckedContent;
            },

            _setLastCheckedContent: function (content) {
                this.lastCheckedContent = content;
            },


        });
});