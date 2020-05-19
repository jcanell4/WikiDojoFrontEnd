define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin',
    "dojo/string",
], function (declare, AbstractAcePlugin, string) {

    var TIMER_INTERVAL = 0.1;

    return declare([AbstractAcePlugin], {


        init: function (args) {

            this.title = args.title;
            this.prompt = args.prompt;
            this.data = args.data;
            this.template = args.template;
            this.origins = args.origins;


            var config = args;
            if (args.icon.indexOf(".png") === -1) {
                config.icon = "/iocjslib/ioc/gui/img/" + args.icon + ".png";
            }

            this.addButton(config, this.process);

            this.enabled = true;

        },

        _getEditor: function () {
            var dispatcher = this.editor.dispatcher;
            var id = dispatcher.getGlobalState().getCurrentId(),
                contentTool = dispatcher.getContentCache(id).getMainContentTool();

            return contentTool.getCurrentEditor();

        },

        _showDialog: function () {
            //this.documentPreviewComponent.send();
            // Opció 1: cridar directament a tb_mediapopup(btn, props, edid)

            // obtenir el id del document

            var edid = 'textarea_' + this._getEditor().id + '_media';


            // eliminem qualsevol textarea anterior. Alternativa: si existeix deixar aquest i no crear cap de nou
            jQuery('textarea#' + edid).remove();
            clearInterval(timer);

            // Afegim un de nou
            var $textarea = jQuery('<textarea>').attr('id', edid);
            $textarea.css('display', 'none');

            jQuery('body').append($textarea);

            // Canvia al textarea es fa mitjançant expresions regulars directament sobre el text,
            // no es dispara cap event

            var context = this;

            timer = setInterval(function () {
                var value = $textarea.val();
                if (value.length > 0) {
                    clearInterval(timer);
                    // this.editor.execCommand('inserthtml', string.substitute(this.htmlTemplate, args));

                    context.insert(value);


                    // context.editor.execCommand('inserthtml', value);

                    timer = null;
                    $textarea.remove();
                }

            }, TIMER_INTERVAL);

            tb_mediapopup(
                null,
                {
                    name: 'mediaselect', // name per la segona opció de window.open()
                    options: 'width=750,height=500,left=20,top=20,scrollbars=yes,resizable=yes', // options pel tercer paràmetre de la funció window.open()
                    url: 'lib/exe/mediamanager.php?ns='
                },
                edid
            );

        },

        _processFull: function () {
            this._showDialog();

        },

        insert: function (value) {

            var reg = new RegExp('{{:(.*)\\?');
            var file = value.match(reg);


            var chunks = file[1].split('|');
            var ns = chunks[0];

            // Si es troba a l'arrel cal incloure els :
            if (ns.indexOf(':') === -1) {
                ns = ':' + ns;
            }

            var data = {
                id : ns
            };

            this.editor.session.insert(this.editor.editor.getCursorPosition(), string.substitute(this.template, data));

        },

    });

});