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

            this.content = args.sample || '';

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

            this.editor.on('changedScope', this._updateToggle.bind(this));

            this.addButton(config);
        },

        _updateToggle: function(data) {

            console.log("DojoFormatCustom#_updateToggle", data);
            if (!this.editor.document) {
                // console.log("Encara no està llest el document");
                return;
            }

            // TODO[Xavi] Aquí s'ha de comprovar si l'estat del botó es el corresponent
            var checked = false;

            for (var i=0; i<data.rangeInfos.length; i++) {
                console.log("Comprovant rangeinfo", data.rangeInfos[i], "el meu state:", this.state, "resultat", data.rangeInfos[i].state === this.state)
                if (data.rangeInfos[i].state === this.state) {
                    checked = true;
                    break;
                }
            }

            this.button.set('checked', checked);
        },

        process: function () {
            var info;

            var rangeInfos = this.editor.getScopeInfo();

            for (var i=0; i<rangeInfos.length; i++) {
                console.log("Comprovant rangeinfo", rangeInfos[i], "el meu state:", this.state, "resultat", rangeInfos[i].state === this.state)
                if (rangeInfos[i].state === this.state) {
                    info = rangeInfos[i];
                    break;
                }
            }

            if (info) {
                // Eliminem el block
                var $node = jQuery(info.node);

                if ($node.html() !== $node.text()) {
                    var $nodeContent = jQuery($node.html());
                } else {
                    var text = $node.text();
                    $nodeContent = document.createTextNode(text);
                }

                $node.before($nodeContent);
                $node.remove();

            } else {
                var content = this._getSelectionText() || this.content;

                var args = {content: content, state : this.state};
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