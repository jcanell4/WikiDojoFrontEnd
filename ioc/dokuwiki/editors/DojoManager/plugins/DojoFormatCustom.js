define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dijit/form/ToggleButton",
    "dojo/string"
], function (declare, AbstractDojoPlugin, lang, _Plugin, ToggleButton, string) {

    var FormatButton = declare(AbstractDojoPlugin, {


        init: function(args) {
            this.inherited(arguments);

            this.command = args.command;
            this.state = args.state;

            args.open = args.open.replace('>', ' data-block-state="${state}">');
            this.htmlTemplate = args.open + "${content}" + args.close;

            this.content = args.sample;

            var config = {
                label: args.title,
                ownerDocument: this.editor.ownerDocument,
                dir: this.editor.dir,
                lang: this.editor.lang,
                showLabel: false,
                iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + args.icon,
                tabIndex: "-1",
                onClick: lang.hitch(this, "process")
            };

            this.editor.on('changeCursor', this._updateToggle.bind(this));

            this.addButton(config);
        },

        _updateToggle: function(data) {

            console.log("data", data);
            if (!this.editor.document) {
                // console.log("Encara no està llest el document");
                return;
            }

            // TODO[Xavi] Aquí s'ha de comprovar si l'estat del botó es el corresponent


            this.button.set('checked', data.state === this.state);
        },

        process: function () {
            // TODO: Si l'estat de la selecció es = this.state llavors s'ha de treure el block, no afegir-lo
            //  - S'ha de seleccionar tot el block per eliminar-lo.


            var info = this.editor.getRangeInfo();
            if (info.state === this.state) {
                console.log("TODO: desfer el format");

                var $node = jQuery(info.node);
                var $nodeContent= jQuery($node.html());
                var text = $node.text();

                $nodeContent = $nodeContent.length>0 ? $nodeContent : document.createTextNode(text);

                var $paragraph = jQuery('<p>').append($nodeContent);
                console.log($paragraph);


                $node.before($paragraph);
                $node.remove();

            } else {
                var args = {content: this._getSelectionText() || this.content, state : this.state};
                this.editor.execCommand('inserthtml', string.substitute(this.htmlTemplate, args));
            }

        },


        addButton: function(config) {
            this.button = new ToggleButton(config);
        },


    });


    // Register this plugin.
    _Plugin.registry["insert_format_custom"] = function () {
        return new FormatButton({command: "insert_format_custom"});
    };

    return FormatButton;
});