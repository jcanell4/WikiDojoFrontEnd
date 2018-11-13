define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
    "dijit/form/ToggleButton"
], function (declare, AbstractDojoPlugin, lang, _Plugin, string, Button) {

    var FormatButton = declare(AbstractDojoPlugin, {

        init: function(args) {
            this.inherited(arguments);

            this.htmlTemplate = args.open + "${content}" + args.close;

            this.content = args.sample;
            this.tag = args.tag;

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

            this.addButton(config);


            this.editor.on('changeCursor', this.updateCursorState.bind(this));
        },

        addButton: function(config) {
            this.button = new Button(config);
        },

        updateCursorState: function(e) {
            console.log("DojoFormatBlock", e);

            if (e.state.indexOf(this.tag)>-1) {
                this.button.set('checked', true);
            } else {
                this.button.set('checked', false);
            }
        },

        process: function () {

            // ALERTA[Xavi] si el botó es troba checked, es que ja es troba en aquest format i s'ha de treure
            // la solució que hi ha a continuació no ho te en compte i no funciona correctament perque s'afegeixen blocs div directament
            // en el cas en que s'ha d'eliminar el bloc ho hem de fer manualment
            // posible solució:
            //      - cercar el primer parent amb el tag
            //      - afegir el seu innerhtml al seu parent
            //      - eliminar aquest node

            // var previousValue = this.editor.getValue();
            var previousValue = this.editor.getValue();

            // this.editor.execCommand('removeformat');
            this.editor.execCommand('formatblock', this.tag);

            // si no hi han canvis es que ja es trobaba aquest block, el reemplaçem pel block generic 'p'. Alerta! amb 'div' com a block generic no funciona, al 3er canvi falla
            if (previousValue === this.editor.getValue()) {
                // this.editor.execCommand('removeformat');
                this.editor.execCommand('formatblock', 'p');
            }

        },


    //     getTextNodesIn: function (node) {
    //     var textNodes = [];
    //
    //     if (node.nodeType === 3) {
    //         textNodes.push(node);
    //     } else {
    //         var children = node.childNodes;
    //
    //         for (var i = 0, len = children.length; i < len; ++i) {
    //             textNodes.push.apply(textNodes, this.getTextNodesIn(children[i]));
    //         }
    //     }
    //
    //     return textNodes;
    // }
    });


    // Register this plugin.
    _Plugin.registry["insert_format"] = function () {
        return new FormatButton({command: "insert_format"});
    };

    return FormatButton;
});