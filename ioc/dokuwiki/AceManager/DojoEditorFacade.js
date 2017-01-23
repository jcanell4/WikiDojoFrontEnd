define([
    'dojo/_base/declare',
    'ioc/dokuwiki/AceManager/IocDojoEditor',
    'dijit/_editor/plugins/AlwaysShowToolbar',
    'dojo/dom'
], function (declare, Editor, AlwaysShowToolbar, dom) {
    return declare([], {

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


            this.editor.on('change', function () {
                console.log('editor333 onChange handler: ' );
            });

            var text = this.$textarea.val();
            this.setValue(text);


            this.editor.startup();



        },

        setHeight: function (height) {
            console.log("DojoEditorFacade#setHeight", height);
            this.editor.resize(200);
        },

        getValue: function () {
            console.log("DojoEditorFacade#getValue");
            return this.editor.get('value');
        },

        setValue: function (value) {
            this.editor.set('value', value);
        }
    })
});