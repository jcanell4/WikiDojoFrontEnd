define([
    'dojo/_base/declare',
    'ioc/dokuwiki/AceManager/IocDojoEditor',
    'dijit/_editor/plugins/AlwaysShowToolbar',
    'dojo/dom',
    'dojo/Evented',
    'dojo/dom-geometry',
], function (declare, Editor, AlwaysShowToolbar, dom, Evented, geometry) {
    return declare([Evented], {

        editor: null,

        VERTICAL_MARGIN: 25,
        MIN_HEIGHT: 200, // TODO [Xavi]: Penden de decidir on ha d'anar això definitivament. si aquí o al AceFacade


        constructor: function (args) {
            console.log("DojoEditorFacade#constructor", args);

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

            this.editor.on('change', function (newContent) {
                this.emit('change', {newContent: newContent});
            }.bind(this));

            this.editor.startup();
        },


        setHeight: function (height) {
            console.log("DojoEditorFacade#setHeight", height);
            // this.editor.set('height', '1000px');
            this.editor.resize({height: height+ 'px'});
            // this.editor.set('height', "50px");
            // setTimeout(function() {
            //     this.editor.resize(height + 'px');
            // }.bind(this), 1000);
            // this.$editor.css('height', height + 'px');

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
        },

        fillEditorContainer: function () {
            var contentNode = this.editor.domNode,
                h = geometry.getContentBox(contentNode).h,
                max = h - this.VERTICAL_MARGIN;

            console.log("DojoEditorFacade#fillEditorContainer", contentNode, h);
            this.setHeight(Math.max(this.MIN_HEIGHT, max));
        }
    });
});