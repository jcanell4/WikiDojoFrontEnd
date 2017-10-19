define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AbstractIocFacade',
    'ioc/dokuwiki/editors/AceManager/IocAceEditor',
    'ioc/dokuwiki/editors/AceManager/modes/IocAceMode',
    'ioc/dokuwiki/editors/AceManager/rules/IocRuleSet',
    'ioc/dokuwiki/editors/AceManager/AceWrapper',
    'ioc/dokuwiki/editors/AceManager/DokuWrapper',
    // 'ioc/dokuwiki/editors/AceManager/Container2',
    'ioc/dokuwiki/editors/AceManager/IocCommands',
    'ioc/dokuwiki/editors/AceManager/patcher',
    'dojo/dom-style',
    'dojo/dom',
    'ioc/dokuwiki/editors/AceManager/toolbarManager',
    'dojo/dom-geometry',
    'ioc/dokuwiki/editors/AceManager/ace-preview',
    'dojo/cookie',
], function (declare, AbstractIocFacade, IocAceEditor, IocAceMode, IocRuleSet, AceWrapper, DokuWrapper, /*Container,*/ IocCommands, patcher,
             style, dom, toolbarManager, geometry, acePreview, cookie) {


    return declare([AbstractIocFacade], {

        TOOLBAR_ID: "full-editor",
        VERTICAL_MARGIN: 25,
        MIN_HEIGHT: 200,

        constructor: function (args) {
            // console.log("AceEditorFullFacade#constructor");

            var lang_rules = {},
                iocAceMode = new IocAceMode({
                    baseHighlighters: lang_rules,
                    ruleSets: [new IocRuleSet()],
                    xmlTags: args.xmltags
                }),

                mode = iocAceMode.getMode(),


                iocAceEditor = new IocAceEditor({
                    mode: mode,
                    containerId: args.containerId,
                    theme: args.theme,
                    readOnly: args.readOnly,
                    wraplimit: args.wraplimit,
                    wrapMode: args.wrapMode,
                    mdpage: args.mdpage
                }),

                aceWrapper = new AceWrapper(iocAceEditor),

                dokuWrapper = new DokuWrapper(aceWrapper, args.textareaId, args.auxId), //TODO[Xavi] A banda de passar la info del JSINFO per paràmetre, s'ha de tenir en compte que el id del text area ja no serà aquest, si no el que nosaltres volgumen (i.e. multi edició)

                // container = new Container(aceWrapper, dokuWrapper),// Comprovar que es el que ha de fer currentEditor!

                commands,
                preview;

            this.aceWrapper = aceWrapper;
            this.dokuWrapper = dokuWrapper;
            this.iocAceEditor = iocAceEditor;
            this.id = args.auxId;


            this.initContainer();


            this.dispatcher = args.dispatcher;
            this.data = args.data;

            this.wrap = args.wrapMode;

            this.$editor = jQuery('#' + args.containerId);
            this.$textarea = jQuery('#' + args.textareaId);
            // this.container = container;


            // Inicialitzem l'editor
            iocAceEditor.init();

            // No es poden afegir els comandaments fins que no s'a inicialitzat l'editor
            commands = new IocCommands(aceWrapper);

            var text = this.getTextareaValue();
            this.setEditorValue(text);

            preview = acePreview({ace: aceWrapper});


            // ----------------------------
            // ALERTA[Xavi] No esborrar, descomentar per depurar, mostra la informació sobre el token i el estat a la posició del cursor
            // var editor = this.iocAceEditor.editor;
            // editor.on("changeSelection", function() {
            //     var position = editor.getCursorPosition();
            //     var token = editor.session.getTokenAt(position.row, position.column);
            //     var state = editor.session.getState(position.row);
            //     console.log("Token: " , token, "State" , state);
            // });
            // ----------------------------

            iocAceEditor.setDocumentChangeCallback(function () {
                //console.log("AceFacade#setDocumentChangeCallback");
                this.updateTextarea(this.getEditorValue());
                dokuWrapper.text_changed();
                commands.hide_menu();
                preview.trigger();

            }.bind(this));

            iocAceEditor.setChangeCursorCallback(function () {
                commands.hide_menu();
                preview.trigger();

            });


            jQuery(this.$editor).find('textarea').on('focus', this.select.bind(this));


            jQuery(this.$editor).on('input paste cut keyup', function () {
                this.emit('change', {newContent: this.getValue()});
            }.bind(this));


            this.originalContent = args.originalContent;

            this.enable();
            toolbarManager.setDispatcher(this.dispatcher);
            this.addToolbars();

            this.initDwEditor();
        },


        //ALERTA[Xav] Aquest mètode lliga el textarea als events originals de la wiki
        initDwEditor: function () {
            var $editor = this.$textarea,
                self = this;


            $editor.on('input change focus', function (event) {
                self.emit('change', {newContent: $editor.val()});
            });


            if ($editor.length === 0) {
                return;
            }

            window.dw_editor.initSizeCtl('#size__ctl', $editor);

            if ($editor.attr('readOnly')) {
                return;
            }

            // in Firefox, keypress doesn't send the correct keycodes,
            // in Opera, the default of keydown can't be prevented
            if (jQuery.browser.opera) {
                $editor.keypress(window.dw_editor.keyHandler);
            } else {
                $editor.keydown(window.dw_editor.keyHandler);
            }
        },

        updateTextarea: function (value) {
            // Comprovar si el id del textarea seleccionat correspont amb el que te el focus?
            this.dokuWrapper.set_value(value);
        },

        // updateEditor: function (value) {
        //     //console.log("AceFacade#updateEditor", value);
        //     this.aceWrapper.set_value(value);
        // },


        getValue: function () {
            if (this.enabled) {
                return this.getEditorValue();
            } else {
                return this.getTextareaValue();
            }
        },

        setValue: function (value) {
            if (this.enabled) {
                this.setEditorValue(value);
            } else {
                return this.setTextareaValue(value);
            }
        },

        getEditorValue: function () {
            //console.log("AceFacade#getEditor", this.aceWrapper.get_value());
            return this.aceWrapper.get_value();
        },

        getTextareaValue: function () {
            return this.dokuWrapper.get_value();
        },

        setEditorValue: function (value) {
            //console.log("AceFacade#setEditorValue", value);
            return this.aceWrapper.set_value(value);
        },

        setTextareaValue: function (value) {
            return this.dokuWrapper.set_value(value);
        },

        destroy: function () {
            this.iocAceEditor.destroy();
        },

        enable: function () {

            var selection;
                // container = this.container,
                // ace = container.aceWrapper,
                // doku = container.dokuWrapper;

            selection = this.dokuWrapper.get_selection();
            this.dokuWrapper.disable();

            this.set_height(this.dokuWrapper.inner_height());
            this.show();
            this.aceWrapper.set_value(this.dokuWrapper.get_value());
            this.aceWrapper.resize();
            this.aceWrapper.focus();
            this.aceWrapper.set_selection(selection.start, selection.end);

            this.dokuWrapper.set_cookie('aceeditor', 'on');
            //dispatcher.getContentCache(currentId).setAceEditorOn(true);

            // this.resetOriginalContentState();

            this.enabled = true;
        },

        disable: function () {
            var selection;
                // container = this.container,
                // ace = container.aceWrapper,
                // doku = container.dokuWrapper;

            selection = this.aceWrapper.get_selection();
            this.dokuWrapper.set_cookie('aceeditor', 'off');

            this.hide();
            this.dokuWrapper.enable();
            this.dokuWrapper.set_value(this.aceWrapper.get_value());
            this.dokuWrapper.set_selection(selection.start, selection.end);
            this.dokuWrapper.focus();

            this.enabled = false;

        },

        select: function () {
            //console.log("AceFacade#select", this.id);
            patcher.restoreCachedFunctions(this.id);
        },

        lockEditor: function () {
            this.$textarea.attr('readonly', true);
            this.iocAceEditor.setReadOnly(true);
            this.hideToolbar();
        },

        unlockEditor: function () {
            this.$textarea.removeAttr('readonly');
            this.iocAceEditor.setReadOnly(false);
            this.showToolbar();
        },


        setWrap: function (on) {
            var textarea = this.$textarea.get(0);

            if (on) {
                dw_editor.setWrap(textarea, 'on');
            } else {
                dw_editor.setWrap(textarea, 'off');
            }

        },

        toggleWrap: function () {
            this.wrap = !this.wrap;
            this.setWrap(this.wrap);
        },

        toggleEditor: function () {

            if (this.enabled) {
                this.disable();
            } else {
                this.enable();
            }

        },

        resetOriginalContentState: function () {
            // console.log("AceEditorFullFacade#resetOriginalContentState", this.id);
            this.originalContent = this.getValue();
        },

        isChanged: function () {
            // console.log("IocAceEditor#isChanged", this.originalContent != this.getValue());

            // this._compareStrings(this.originalContent,this.getValue());

            return this.originalContent != this.getValue();
        },




        fillEditorContainer: function () {
            var contentNode = dom.byId(this.id),
                h = geometry.getContentBox(contentNode).h;


            // console.log("AceFacade#fillEditorContainer", this.id, h);
            this.setHeight(Math.max(h));
        },

        setHeight: function (height) {
            // console.log("AceEditorFullFacade#setHeight", height);
            var min = this.MIN_HEIGHT,
                contentNode = dom.byId(this.id),
                h = geometry.getContentBox(contentNode).h,
                max = h - this.VERTICAL_MARGIN,
                normalizedHeight = Math.max(min, Math.min(height, max));


            var node = dom.byId(this.dokuWrapper.textArea.id);

            if (node) {
                style.set(node, "height", "" + normalizedHeight  + "px");
            }

            node = dom.byId(this.iocAceEditor.containerId);
            if (node) {
                style.set(node, "height", "" + normalizedHeight  + "px");
            }

            this.aceWrapper.resize();

        },



        addToolbars: function () {
            toolbarManager.setDispatcher(this.dispatcher);


            if (this.iocAceEditor.getReadOnly()) {
                return;
            }
            this.addButtons();

            this.toolbarId = 'toolbar_' + this.id;
            toolbarManager.initToolbar(this.toolbarId, 'textarea_' + this.id, this.TOOLBAR_ID);
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
                },

                argPreview = {
                    type: "preview", // we havea new type that links to the function
                    title: "Previsualitzar el contingut d'aquest editor",
                    icon: "/iocjslib/ioc/gui/img/Document-Preview-icon.png"
                };
            ;

            toolbarManager.addButton(argPreview, this._funcPreview.bind(this.dispatcher), this.TOOLBAR_ID);
            toolbarManager.addButton(confEnableWrapper, this._funcEnableWrapper.bind(this.dispatcher), this.TOOLBAR_ID);
            toolbarManager.addButton(confEnableAce, this._funcEnableAce.bind(this.dispatcher), this.TOOLBAR_ID);
            toolbarManager.addButton(argSave, this._funcSave.bind(this.dispatcher), this.TOOLBAR_ID);
            toolbarManager.addButton(argCancel, this._funcCancel.bind(this.dispatcher), this.TOOLBAR_ID);
        },

        _funcPreview: function(){
            var id = this.getGlobalState().getCurrentId(),
                contentTool = this.getContentCache(id).getMainContentTool(),
                dataToSend = contentTool.requester.get("dataToSend"),
                urlBase = contentTool.requester.get("urlBase");

            cookie("IOCForceScriptLoad", 1);

            contentTool.requester.set("dataToSend", {call:"preview", wikitext:contentTool.getCurrentContent()});
            contentTool.requester.set("urlBase", contentTool.requester.get("defaultUrlBase"));
            contentTool.requester.sendRequest();
            contentTool.requester.set("urlBase", urlBase);
            contentTool.requester.set("dataToSend", dataToSend);
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

        hideToolbar: function () {
            var $toolbar = jQuery('#' + this.toolbarId);

            this._originalToolbarDisplayStyle = $toolbar.css('display');
            $toolbar.css('display', 'none')
        },

        showToolbar: function () {
            if (this._originalToolbarDisplayStyle) {
                jQuery('#' + this.toolbarId).css('display', this._originalToolbarDisplayStyle);
            } else {
                jQuery('#' + this.toolbarId).css('display', 'inherit');
            }

        },

        getOriginalValue: function () {
            return this.originalContent;
        },

        resetValue: function () {

            this.setValue(this.getOriginalValue());
        },

        // Funcions originalment al Container

        initContainer: function () {
            console.log("initContainer", this.aceWrapper.containerId);

            var element = jQuery('<div>'),
                textarea = jQuery(this.dokuWrapper.textArea),
                wrapper = jQuery('<div>', {
                    "class": 'ace-doku',
                    "id": this.aceWrapper.containerId
                }),
                prop,
                properties = ['border', 'border-color', 'border-style', 'border-width', 'border-top',
                    'border-top-color', 'border-top-style', 'border-top-width', 'border-right',
                    'border-right-color', 'border-right-style', 'border-right-width', 'border-bottom',
                    'border-bottom-color', 'border-bottom-style', 'border-bottom-width', 'border-left',
                    'border-left-color', 'border-left-style', 'border-left-width', 'margin', 'margin-top',
                    'margin-right', 'margin-bottom', 'margin-left'];

            // Recorre les propietats css del array
            // les afegeix una per una al wrapper
            // afegeix al wrapper un element (div) amb classe 'ace-doku' després del textarea

            for (var i = 0, len = properties.length; i < len; i++) {
                prop = properties[i];
                wrapper.css(prop, textarea.css(prop));
            }

            wrapper.append(element).insertAfter(textarea).hide();

            this.$elementContainer = element;
            this.$wrapper = wrapper;
            // this.$textArea = textarea;
        },

        show: function() {
                var wrapper = this.$wrapper,
                    element = this.$elementContainer;
                wrapper.show();
                element.css('width', wrapper.width() + 'px');
                return element.css('height', wrapper.height() + 'px');
            },

            hide: function() {
                return this.$wrapper.hide();
            },

            set_height: function (value) {
                this.$wrapper.css('height', value + 'px');
                return this.$elementContainer.css('height', this.$wrapper.height() + 'px');
            }

    });


});

