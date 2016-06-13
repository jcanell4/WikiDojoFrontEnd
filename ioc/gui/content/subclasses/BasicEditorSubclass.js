define([
    "dojo/_base/declare",
    "dojo/on",
    'ioc/dokuwiki/AceManager/toolbarManager',
    'ioc/dokuwiki/AceManager/AceFacade',
    'dojo/dom-geometry',
    'dojo/dom',
    "dojo/io-query",
    "dojo/_base/lang",
    'ioc/wiki30/Draft',
], function (declare, on, toolbarManager, AceFacade, geometry, dom, ioQuery, lang) {

    return declare([],
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
            VERTICAL_MARGIN: 25,
            MIN_HEIGHT: 200, // TODO [Xavi]: Penden de decidir on ha d'anar això definitivament. si aquí o al AceFacade
            
            editorCreated:false,
            
            setReadOnly: function (value) {
                this.set("readonly", value);
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
                this.inherited(arguments);

                this.registerObserverToEvent(this, this.eventName.DOCUMENT_SELECTED, this.fillEditorContainer.bind(this)); // Alerta[Xavi] Necessari per redimensionar correctament l'editor quan es recarrega amb més d'una pestanya
                this.registerObserverToEvent(this, this.eventName.DATA_REPLACED, this.fillEditorContainer.bind(this)); // Alerta[Xavi] Necessari per redimensionar correctament l'editor quan es recarrega amb més d'una pestanya
                this.registerObserverToEvent(this, this.eventName.CONTENT_SELECTED, this.fillEditorContainer.bind(this)); // Alerta[Xavi] Necessari per redimensionar correctament l'editor quan es recarrega amb més d'una pestanya

//                this.eventManager = this.dispatcher.getEventManager();

//                this.eventManager.registerEventForBroadcasting(this, this.eventNameCompound.SAVE + this.id, this._doSave.bind(this));
//                this.eventManager.registerEventForBroadcasting(this, this.eventNameCompound.CANCEL + this.id, this._doCancelDocument.bind(this));
                
                this.setFireEventHandler(this.eventName.SAVE, this._doSave.bind(this));
                this.setFireEventHandler(this.eventName.CANCEL, this._doCancelDocument.bind(this));

                this.fillEditorContainer();
            },


            _doSave: function (event) {
                //console.log("BasicEditorSubclass#_doSave", this.id, event);

                var dataToSend = this.getQuerySave(this.id),
                    containerId = this.id;

                if(event.extraDataToSend){
                    if(typeof event.extraDataToSend==="string"){
                        lang.mixin(dataToSend, ioQuery.queryToObject(event.extraDataToSend));
                    }else{
                        lang.mixin(dataToSend, event.extraDataToSend);
                    }
                }
//                this.eventManager.dispatchEvent(this.eventName.SAVE, {
//                    id: this.id,
//                    dataToSend: dataToSend,
//                    standbyId: containerId
//                })
                return {
                    id: this.id,
                    dataToSend: dataToSend,
                    standbyId: containerId
                };

            },

            // Alerta[Xavi] el event pot contenir informació que cal afegir al dataToSend, com per exemple el keep_draft i el discardChanges
            _doCancelDocument: function (event) {
                var containerId = this.id,
                    dataToSend = this.getQueryCancel(this.id); // el paràmetre no es fa servir

                if(event.extraDataToSend){
                    if(typeof event.extraDataToSend==="string"){
                        dataToSend += "&" + event.extraDataToSend;
                    }else{
                        dataToSend += "&" + ioQuery.objectToQuery(event.extraDataToSend);
                    }
                }
//                this.eventManager.dispatchEvent(this.eventName.CANCEL, {
//                    id: this.id,
//                    dataToSend: dataToSend,
//                    standbyId: containerId
//                })
                return {
                    id: this.id,
                    dataToSend: dataToSend,
                    standbyId: containerId
                };

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
             * Al post render s'afegeix la funcionalitat de reconstruir els prefix i suffix necessaris per la wiki al
             * fer click en el botó de desar i s'afegeix la toolbar a cada editor.
             *
             * @override
             */
            postRender: function () {

                this.inherited(arguments);
                
                if(!this.editorCreated){
                    this.addToolbars();
                    this.addEditors();

                    on(window, 'resize', function () {
                        this.fillEditorContainer();
                    }.bind(this));

                    this.fillEditorContainer();
                    this.editorCreated=true;
                }
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
             * ALERTA[Xavi] Compte, el this fa referencia al dispatcher
             *
             * @protected
             */
            _funcSave: function () {
                var id = this.getGlobalState().getCurrentId(),
                    eventManager = this.getEventManager();
//                eventManager.dispatchEvent(eventManager.eventNameCompound.SAVE, {id: id}, id);
                eventManager.fireEvent(eventManager.eventName.SAVE, {id: id}, id);
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
             * ALERTA[Xavi] Compte, el this fa referencia al dispatcher
             * @protected
             */
            _funcCancel: function () {
                //console.log("EditorSubclass#_funcCancel");
                var id = this.getGlobalState().getCurrentId(),
                    eventManager = this.getEventManager();
//                eventManager.dispatchEvent(eventManager.eventNameCompound.CANCEL + id, {id: id, extra: 'trololo'});

                eventManager.fireEvent(eventManager.eventName.CANCEL, {id: id}, id);
//                this.fireEvent(this.eventName.CANCEL, {id: id, extra: 'trololo'}); // Si és possible, canviar-hi a aquest sistema
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

            /**
             * Aquest mètode es cridat automàticament quan es realitza un canvi de mida del ContentTool.
             *
             * @param {*} args - el objecte amb els arguments pot tenir diferents hash amb informació sobre el canvi
             * sent els estandard changeSize i resultSize.
             * @see resize()
             */
            onResize: function (args) {
                var $form = jQuery('#form_' + this.id);
                if($form.length>0){
                    $form.height(args.changeSize.h);
                }
            }

        });
});