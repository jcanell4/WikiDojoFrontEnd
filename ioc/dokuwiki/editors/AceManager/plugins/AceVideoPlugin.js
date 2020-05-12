define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin',
    "dojo/string",
], function (declare, AbstractAcePlugin, string) {

    return declare([AbstractAcePlugin], {

        init: function (args) {

            this.title = args.title;
            this.prompt = args.prompt;
            this.data = args.data;
            this.template = args.template;

            // this.uniqueId = "UNIQUE ID " + Date.now();

            var config = args;
            if (args.icon.indexOf(".png") === -1) {
                config.icon = "/iocjslib/ioc/gui/img/" + args.icon + ".png";
            }

            console.log("Config?", config);

            // var config = {
            //     type: args.type,
            //     title: args.title,
            //     icon: '/iocjslib/ioc/gui/img/' + args.icon + '.png',
            //     category: args.category
            // };

            // this.addButton(config);

            this.addButton(config, this.process);

            this.enabled = true;

        },

        _getEditor: function () {
            var dispatcher = this.editor.dispatcher;
            var id = dispatcher.getGlobalState().getCurrentId(),
                contentTool = dispatcher.getContentCache(id).getMainContentTool();

            return contentTool.getCurrentEditor();

        },


        _processFull: function () {

            if (!this.canInsert()) {
                alert("No es pot inserir un video en aquest punt del document");
                return;
            }

            this._showDialog(this.data);

        },

        canInsert: function () {
            var editor = this._getEditor().editor;

            return !(editor.isReadonlySection() || editor.getReadOnly());

        },

        changeEditorCallback: function (e) {

            var cursor = this.editor.editor.getCursorPosition();

            if (cursor.row >= this.lastRange.start.row && cursor.row <= this.lastRange.end.row) {
                return;
            }
            this._getEditor().editor.remove_marker(this.marker);
            clearTimeout(this.timerId);
        },

        _showDialog: function (data) {


            var dialogManager = this.editor.dispatcher.getDialogManager();
            var context = this;

            var saveCallback = function (data) {
                context.editor.session.insert(context.editor.editor.getCursorPosition(), string.substitute(context.template, data));

            };

            var dialog = dialogManager.getDialog('form', this.editor.id, {
                title: this.title,
                message: this.prompt, // TODO: localitzar
                data: data,
                ok: {
                    text: 'Inserir' // localitzar
                },
                cancel: {
                    text: 'Cancel·lar' // localitzar
                },
                callback: saveCallback
            });


            dialog.show();

        }

    });

});