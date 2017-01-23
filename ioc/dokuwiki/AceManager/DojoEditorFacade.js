define([
    'dojo/_base/declare',
    'ioc/dokuwiki/AceManager/IocDojoEditor',
    'dijit/_editor/plugins/AlwaysShowToolbar',
    'dojo/dom',
    'dojo/Evented',
], function (declare, Editor, AlwaysShowToolbar, dom, Evented) {
    return declare([Evented], {

        editor: null,

        constructor: function (args) {
            console.log("DojoEditorFacade#constructor", args);

            this.$textarea = jQuery('#' + args.textareaId);


            this.$editor = jQuery('<div>');
            this.$editor.attr('id', args.containerId);
            this.$textarea.after(this.$editor);


            this.$textarea.hide();


            this.editor = new Editor({
                extraPlugins: [AlwaysShowToolbar],
                updateInterval: 1,

            }, dom.byId(args.containerId));


            var text = this.$textarea.val();
            this.setValue(text);

            this.editor.on('change', function (newContent) {
                this.emit('change', {newContent: newContent});
            }.bind(this));

            this.editor.startup();
        },


        setHeight: function (height) {
            console.log("DojoEditorFacade#setHeight", height);
            console.log("TODO: No funciona canviar la alçada ni el resize");
            this.editor.set('height', 2000);
        },

        getValue: function () {
            console.log("DojoEditorFacade#getValue");
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
        }
    });
});