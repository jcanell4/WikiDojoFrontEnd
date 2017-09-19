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
], function (declare, IocAceEditor, IocAceMode, IocRuleSet, AceWrapper, DokuWrapper, Container, IocCommands, patcher, style, dom, Evented) {
    return declare([Evented], {

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
                this.updateTextarea(this.getEditorValue());
                dokuWrapper.text_changed();
                commands.hide_menu();
                this.emit('change', {newContent: this.getValue()});


            }.bind(this));

            iocAceEditor.setChangeCursorCallback(function () {
                commands.hide_menu();
            });


            jQuery(this.$editor).find('textarea').on('focus', this.select.bind(this));

            this.enable();

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

        updateEditor: function (value) {
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
            return this.aceWrapper.get_value();
        },

        getTextareaValue: function () {
            return this.dokuWrapper.get_value();
        },

        setEditorValue: function (value) {
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

        }
    });
});

