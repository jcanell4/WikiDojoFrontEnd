define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AbstractIocFacade',
    'ioc/dokuwiki/editors/DojoManager/IocDojoEditor',
    'dijit/_editor/plugins/AlwaysShowToolbar',
    'dojo/dom',
    'dojo/dom-style',
    'dojo/dom-geometry',
    // "dijit/_editor/plugins/EnterKeyHandling", // Això no es tracta com un plugin, només cal carregar-lo
    'ioc/dokuwiki/editors/DojoManager/plugins/CustomKeyHandling',
    // 'dojox/editor/plugins/NormalizeIndentOutdent'
    'ioc/dokuwiki/editors/DojoManager/plugins/CustomNormalizeIndentOutdent'

    // 'ioc/dokuwiki/editors/DojoManager/plugins/CommentsDialog',
    // 'ioc/dokuwiki/editors/DojoManager/plugins/IocSoundFormatButtonPlugin',
    // 'dojox/editor/plugins/InsertEntity',
], function (declare, AbstractIocFacade, Editor, AlwaysShowToolbar, dom, style, geometry,
             // EnterKeyHandling
             EnterKeyHandling,
             NormalizeIndentOutdent
             /*, CommentsDialog, IocSoundFormatButtonPlugin*/) {
    return declare([AbstractIocFacade], {

        editor: null,
        TOOLBAR_ID: "full-editor",
        VERTICAL_MARGIN: 25,
        MIN_HEIGHT: 200,


        constructor: function (args) {
            // console.log("DojoEditorFacade#constructor", args);

            this.id = args.id;

            this.viewId = args.viewId;
            this.dispatcher = args.dispatcher;

            this.$textarea = jQuery('#' + args.textareaId);

            this.$editor = jQuery('<div>');
            this.$editor.css('height', '99%');
            this.$editor.attr('id', args.containerId);
            this.$textarea.after(this.$editor);
            this.$textarea.hide();

            this.containerNode = jQuery('#' + args.containerId.replace(/^editor_/, '')).get(0);

            // ALERTA[Xavi] Si es passa el valor de l'editor directament com a 'value' no s'executa el parse dels plugins.
            this.editor = new Editor({
                styleSheets: '/iocjslib/ioc/dokuwiki/editors/DojoManager/css/dojoEditorStyles.css',
                dispatcher: this.dispatcher,
                components: [], // string[],
                TOOLBAR_ID: this.TOOLBAR_ID,
                readOnly: args.readOnly,
                extra: args.extra,
                extraPlugins: [
                    {name:"dijit._editor.plugins.CustomKeyHandling", blockNodeForEnter: 'P'},
                    {name:"dojox.editor.plugins.NormalizeIndentOutdent"}
                ]
            }, dom.byId(args.containerId));

            if (args.TOOLBAR_ID) {
                this.TOOLBAR_ID = args.TOOLBAR_ID;
            }

            this.editor.value = args.content;

            this.editor.originalContent = args.originalContent || args.content;

            this.editor.on('change', function (newContent) {
                //console.log("Editor change");
                this.$textarea.val(newContent);
                this.emit('change', {newContent: newContent});
            }.bind(this));

            this.editor.startup();
            this.editor.focus();

        },


        getValue: function () {
            // console.log("DojoEditorFacade#getValue");
            return this.editor.get('value');
        },

        setValue: function (value) {
            this.editor.set('value', value);
        },

        resetOriginalContentState: function () {
            this.editor.resetOriginalContentState();
        },

        isChanged: function () {
            return this.editor.isChanged();
        },

        fillEditorContainer: function () {
            // var contentNode = this.editor.domNode,
            var contentNode = this.containerNode,
                containerHeight = geometry.getContentBox(contentNode).h;

            this.setHeight(containerHeight - this._getImportantMessageHeight(contentNode));
        },

        setHeight: function (height) {
            // console.log("DojoEditorFacade#setHeight", height);

            var min = this.MIN_HEIGHT,
                contentNode = this.containerNode,
                h = geometry.getContentBox(contentNode).h,
                max = h - this.VERTICAL_MARGIN - this._getImportantMessageHeight(contentNode),
                normalizedHeight = Math.max(min, Math.min(height, max));

            this.editor.resize({h: normalizedHeight});
        },


        lockEditor: function () {
            this.editor.set('disabled', true); // readOnly no funciona, permet escriure igual
            this.hideToolbar();
        },

        unlockEditor: function () {
            this.editor.set('disabled', false); // readOnly no funciona, permet escriure igual
            this.showToolbar();
        },

        hideToolbar: function () {
            this._originalToolbarDisplayStyle = style.get(this.editor.toolbar.containerNode, "display");
            style.set(this.editor.toolbar.containerNode, "display", "none");
        },

        showToolbar: function () {
            style.set(this.editor.toolbar.containerNode, "display", this._originalToolbarDisplayStyle);
        },

        destroy: function () {
            this.editor.destroy();
        },


        getOriginalValue: function () {
            return this.editor.getOriginalValue();
        },

        resetValue: function () {
            this.setValue(this.getOriginalValue());
        }

    });
});
