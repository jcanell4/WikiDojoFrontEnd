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
    'dojo/dom-style'

], function (declare, IocAceEditor, IocAceMode, IocRuleSet, AceWrapper, DokuWrapper, Container, IocCommands, patcher, style) {
    return declare([], {

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

            this.enable();
        },

        updateTextarea: function (value) {
            // Comprovar si el id del textarea seleccionat correspont amb el que te el focus?
            this.dokuWrapper.set_value(value);
        },

        updateEditor: function (value) {
            //console.log("AceFacade#updateEditor", value);
            this.aceWrapper.set_value(value);
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


        },

        select: function () {
            //console.log("AceFacade#select", this.id);
            patcher.restoreCachedFunctions(this.id);
        },

        lockEditor: function() {
            this.iocAceEditor.setReadOnly(true);
        },

        unlockEditor: function() {
            this.iocAceEditor.setReadOnly(false);
        },

        setHeight: function(h) {
            style.set(this.iocAceEditor.containerId, "height", "" + h + "px"); // TODO [Xavi] això no pot queda així, afegir una mètode al editor per obternir la informació.
        }

    });

});
