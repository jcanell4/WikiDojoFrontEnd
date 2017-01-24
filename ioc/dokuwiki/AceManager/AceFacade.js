define([
    "dojo/_base/declare",
    'ioc/dokuwiki/AceManager/IocAceEditor',
    'ioc/dokuwiki/AceManager/IocAceMode',
    'ioc/dokuwiki/AceManager/IocRuleSet',
    'ioc/dokuwiki/AceManager/AceWrapper',
    'ioc/dokuwiki/AceManager/DokuWrapper',
    'ioc/dokuwiki/AceManager/Container2',
    'ioc/dokuwiki/AceManager/IocCommands',
    'ioc/dokuwiki/AceManager/patcher',
    'dojo/dom-style',
    "dojo/dom",
    'dojo/Evented',
    'ioc/dokuwiki/AceManager/toolbarManager',
    'dojo/dom-geometry',

], function (declare, IocAceEditor, IocAceMode, IocRuleSet, AceWrapper, DokuWrapper, Container, IocCommands, patcher,
             style, dom, Evented, toolbarManager, geometry) {
    return declare([Evented], {

        VERTICAL_MARGIN: 25,
        MIN_HEIGHT: 200, // TODO [Xavi]: Penden de decidir on ha d'anar això definitivament. si aquí o al AceFacade

        constructor: function (args) {
            var lang_rules = {},
                iocAceMode = new IocAceMode({
                    baseHighlighters: lang_rules,
                    ruleSets: [new IocRuleSet()],
                    xmlTags: args.xmltags // TODO[Xavi] Passar la info que harà prové del JSINFO per paràmetre, així no depenem d'ella si volem fer canvis
                }),

                mode = iocAceMode.getMode(),


                iocAceEditor = new IocAceEditor({
                    mode: mode,
                    containerId: args.containerId,
                    theme: args.theme,
                    readOnly: args.readOnly,
                    wraplimit: args.wraplimit,
                    wrapMode: args.wrapMode,
                    mdpage: args.mdpage // TODO[Xavi] Passar la info que harà prové del JSINFO per paràmetre, així no depenem d'ella si volem fer canvis
                }),

                aceWrapper = new AceWrapper(iocAceEditor),

                dokuWrapper = new DokuWrapper(aceWrapper, args.textareaId, args.auxId), //TODO[Xavi] A banda de passar la info del JSINFO per paràmetre, s'ha de tenir en compte que el id del text area ja no serà aquest, si no el que nosaltres volgumen (i.e. multi edició)

                container = new Container(aceWrapper, dokuWrapper),// Comprovar que es el que ha de fer currentEditor!

                commands;

            this.dispatcher = args.dispatcher;

            this.wrap = args.wrapMode;

            this.$editor = jQuery('#' + args.containerId);
            this.$textarea = jQuery('#' + args.textareaId);
            this.container = container;

            this.aceWrapper = aceWrapper;
            this.dokuWrapper = dokuWrapper;
            this.iocAceEditor = iocAceEditor;
            this.id = args.auxId;

            // Inicialitzem l'editor
            iocAceEditor.init();

            // No es poden afegir els comandaments fins que no s'a inicialitzat l'editor
            commands = new IocCommands(aceWrapper);

            var text = this.getTextareaValue();
            this.setEditorValue(text);

            iocAceEditor.setDocumentChangeCallback(function () {
                //console.log("AceFacade#setDocumentChangeCallback");
                this.updateTextarea(this.getEditorValue());
                dokuWrapper.text_changed();
                commands.hide_menu();
            }.bind(this));

            iocAceEditor.setChangeCursorCallback(function () {
                commands.hide_menu();
            });


            jQuery(this.$editor).find('textarea').on('focus', this.select.bind(this));


            jQuery(this.$editor).on('input paste cut keyup', function () {
                this.emit('change', {newContent: this.getValue()});
            }.bind(this));

            this.enable();

            this.addToolbars();

        },

        updateTextarea: function (value) {
            // Comprovar si el id del textarea seleccionat correspont amb el que te el focus?
            this.dokuWrapper.set_value(value);
        },

        updateEditor: function (value) {
            //console.log("AceFacade#updateEditor", value);
            this.aceWrapper.set_value(value);
        },


        getValue: function () {
            if (this.enabled) {
                return this.getEditorValue();
            } else {
                return this.getTextareaValue();
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

        setTextareaValue: function () {
            return this.dokuWrapper.set_value(value);
        },

        destroy: function () {
            this.iocAceEditor.destroy();
        },

        enable: function () {

            var selection,
                container = this.container,
                ace = container.aceWrapper,
                doku = container.dokuWrapper;

            selection = doku.get_selection();
            doku.disable();
            container.set_height(doku.inner_height());
            container.show();
            ace.set_value(doku.get_value());
            ace.resize();
            ace.focus();
            ace.set_selection(selection.start, selection.end);

            doku.set_cookie('aceeditor', 'on');
            //dispatcher.getContentCache(currentId).setAceEditorOn(true);

            this.resetOriginalContentState();

            this.enabled = true;
        },

        disable: function () {
            var selection,
                container = this.container,
                ace = container.aceWrapper,
                doku = container.dokuWrapper;

            selection = ace.get_selection();
            doku.set_cookie('aceeditor', 'off');

            container.hide();
            doku.enable();
            doku.set_value(ace.get_value());
            doku.set_selection(selection.start, selection.end);
            doku.focus();

            this.enabled = false;

        },

        select: function () {
            //console.log("AceFacade#select", this.id);
            patcher.restoreCachedFunctions(this.id);
        },

        lockEditor: function () {
            this.iocAceEditor.setReadOnly(true);
        },

        unlockEditor: function () {
            this.iocAceEditor.setReadOnly(false);
        },

        setHeight: function (height) {
            var node = dom.byId(this.dokuWrapper.textArea.id);
            if (node) {
                style.set(node, "height", "" + height + "px");
            }
            node = dom.byId(this.iocAceEditor.containerId);
            if (node) {
                style.set(node, "height", "" + height + "px");
            }

            this.container.aceWrapper.resize(); // TODO[Xavi] Important! sense això no s'ajusta la mida del editor

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
            this.originalContent = this.getValue();
        },

        isChanged: function () {
            return this.originalContent != this.getValue();
        },

        fillEditorContainer: function () {
            var contentNode = dom.byId(this.id),
                h = geometry.getContentBox(contentNode).h,
                max = h - this.VERTICAL_MARGIN;

            console.log("AceFacade#fillEditorContainer", this.id, h);
            this.setHeight(Math.max(this.MIN_HEIGHT, max));
        },


        // TODO[Xavi] en aquest cas només cal una toolbar
        addToolbars: function () {
            if (this.iocAceEditor.getReadOnly()) {
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
    });
});

