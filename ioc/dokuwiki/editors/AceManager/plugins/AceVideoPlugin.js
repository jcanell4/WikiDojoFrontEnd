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

            this.sizes = this.origins = JSINFO.shared_constants.ONLINE_VIDEO_CONFIG['sizes'];

            for (var i = 0; i < this.data.length; i++) {
                if (this.data[i].name === 'size') {
                    this.data[i].options = [];

                    for (var size in this.sizes) {
                        this.data[i].options.push(size);
                    }

                    break;
                }
            }

            this.origins = JSINFO.shared_constants.ONLINE_VIDEO_CONFIG['origins'];

            for (var i = 0; i < this.data.length; i++) {
                if (this.data[i].name === 'origin') {
                    this.data[i].options = [];

                    for (var origin in this.origins) {
                        this.data[i].options.push(origin);
                    }
                    break;
                }
            }

            var config = JSON.parse(JSON.stringify(args));
            if (args.icon.indexOf(".png") === -1) {
                config.icon = "/iocjslib/ioc/gui/img/" + args.icon + ".png";
            }
            this.addButton(config, this.process);
            this.enabled = true;
        },

        // _getEditor: function () {
        //     var id = this.dispatcher.getGlobalState().getCurrentId();
        //     var contentTool = this.dispatcher.getContentCache(id).getMainContentTool();
        //     return contentTool.getCurrentEditor();
        // },


        _processFull: function () {
            if (!this.canInsert()) {
                alert("No es pot inserir un video en aquest punt del document");
                return;
            }
            this._showDialog(this.data);
        },

        canInsert: function () {
            var editor = this.getInnerEditor();
            return !(editor.isReadonlySection() || editor.getReadOnly());
        },

        changeEditorCallback: function (e) {
            var innerEditor = this.getInnerEditor();
            var cursor = innerEditor.cursor_position();

            if (cursor.row >= this.lastRange.start.row && cursor.row <= this.lastRange.end.row) {
                return;
            }
            innerEditor.remove_marker(this.marker);
            clearTimeout(this.timerId);
        },

        _showDialog: function (data) {
            var dialogManager = this.dispatcher.getDialogManager();
            var innerEditor = this.getInnerEditor();
            var context = this;

            var saveCallback = function (data) {
                innerEditor.session.insert(innerEditor.cursor_position(), string.substitute(context.template, data));
            };

            var dialog = dialogManager.getDialog('form', this.getEditor().id, {
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

            var $dialog = jQuery(dialog.domNode);

            // ALERTA! En aquest punt sembla que encara no s'han creat els camps i no son accessibles, afegim el listener
            // al dialeg

            $dialog.on('paste', function (e) {
                var clipboardData, pastedData;
                var $origin = $dialog.find('[name="origin"]');
                var $id = $dialog.find('[name="id"]');

                clipboardData = e.originalEvent.clipboardData || e.clipboardData || window.clipboardData;
                pastedData = clipboardData.getData('Text');

                for (var origin in context.origins) {

                    var $matches = pastedData.match(new RegExp(context.origins[origin].pattern));

                    if ($matches && $matches.length > 1) {

                        $origin.val(origin);
                        $id.val($matches[1]);

                        // Només s'interrompt l'event si s'ha trobat un id vàlid
                        e.stopPropagation();
                        e.preventDefault();
                        break;
                    }
                }

            });

            dialog.show();
        }

    });

});