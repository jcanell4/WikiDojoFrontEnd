define([
    'dojo/_base/declare',
    'ioc/dokuwiki/AceManager/IocDojoEditor',
    'dijit/_editor/plugins/AlwaysShowToolbar',
    'dojo/dom',
    'dojo/dom-style',
    'dojo/Evented',
    'dojo/dom-geometry',
], function (declare, Editor, AlwaysShowToolbar, dom, style, Evented, geometry) {
    return declare([Evented], {

        editor: null,

        VERTICAL_MARGIN: 25,
        MIN_HEIGHT: 200, // TODO [Xavi]: Penden de decidir on ha d'anar això definitivament. si aquí o al AceFacade


        constructor: function (args) {
            // console.log("DojoEditorFacade#constructor", args);

            this.dispatcher = args.dispatcher;

            this.$textarea = jQuery('#' + args.textareaId);


            this.$editor = jQuery('<div>');
            this.$editor.css('height', '99%');
            this.$editor.attr('id', args.containerId);
            this.$textarea.after(this.$editor);
            this.$textarea.hide();


            this.editor = new Editor({
                extraPlugins: [AlwaysShowToolbar],
                // height: "100%"
            }, dom.byId(args.containerId));


            var text = this.$textarea.val();
            this.setValue(text);

            if (args.originalContent) {
                this.originalContent = args.originalContent;
            } else {
                this.resetOriginalContentState();
            }


            this.editor.on('change', function (newContent) {
                this.$textarea.val(newContent);
                this.emit('change', {newContent: newContent});
            }.bind(this));

            this.editor.on('focus', function () {
                // console.log('Focus DojoEditor');
                // console.log("Enviant click fals:", args.parentId);
                jQuery('#'+args.parentId).trigger('click');
                // this.emit('click', {id: args.parentId});
            }.bind(this));

            this.editor.startup();


        },


        getValue: function () {
            // console.log("DojoEditorFacade#getValue");
            return this.editor.get('value');
        },

        setValue: function (value) {
            this.editor.set('value', value);
        },

        resetOriginalContentState: function() {
            this.editor.resetOriginalContentState();
        },

        isChanged: function() {
            return this.editor.isChanged();
        },

        fillEditorContainer: function () {
            var contentNode = this.editor.domNode,
                h = geometry.getContentBox(contentNode).h;

            console.log("DojoEditorFacade#fillEditorContainer", contentNode, h);
            this.setHeight(h);
        },

        setHeight: function (height) {
            console.log("DojoEditorFacade#setHeight", height);

            var min = this.MIN_HEIGHT,
                contentNode = this.editor.domNode,
                h = geometry.getContentBox(contentNode).h,
                max = h - this.VERTICAL_MARGIN,
                normalizedHeight = Math.max(min, Math.min(height, max));

            console.log("Establint height..." + normalizedHeight+ 'px');
            console.log("contentNode:", contentNode);
            this.editor.resize({height: normalizedHeight+ 'px'});
        },


        lockEditor: function () {
            this.editor.set('disabled', true); // readOnly no funciona, permet escriure igual
            this.hideToolbar();
        },

        unlockEditor: function () {
            this.editor.set('disabled', false); // readOnly no funciona, permet escriure igual
            this.showToolbar();
        },

        hideToolbar:function() {
            this._originalToolbarDisplayStyle = style.get(this.editor.toolbar.containerNode, "display");
            style.set(this.editor.toolbar.containerNode, "display", "none");
        },

        showToolbar: function() {
            style.set(this.editor.toolbar.containerNode, "display", this._originalToolbarDisplayStyle);
        },

        destroy: function () {
          this.editor.destroy();
        },


        getOriginalValue: function() {
            return this.editor.getOriginalValue();
        },

        resetValue: function() {
            this.setValue(this.getOriginalValue());
        }
    });
});