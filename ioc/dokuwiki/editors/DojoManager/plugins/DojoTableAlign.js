define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
    "dijit/form/ToggleButton"
], function (declare, AbstractDojoPlugin, lang, _Plugin, string, Button) {

    // Alerta! això és global, ho fem servir per asegurar-nos que només un dels botons es actiu en cada moment

    var registeredButtons = [];

    var AlignButton = declare(AbstractDojoPlugin, {

        init: function (args) {
            this.inherited(arguments);

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

            this.addButton(config);

            this.button.set('disabled', true);

            this.editor.on('changeCursor', this.updateCursorState.bind(this));

            this.align = args.align;
            this.alignClass = args.align + 'align';

            // ALERTA! Això no funcionarà amb finestres múltiples



            registeredButtons[this.editor.id + '-'+ args.align] = this;
        },

        addButton: function (config) {
            this.button = new Button(config);
        },

        updateCursorState: function (e) {

            // console.log(e);

            if (e.$node) {

                if (e.$node.is('td, th')) {
                    this.button.set('disabled', false);


                    if (e.$node.hasClass(this.alignClass)) {
                        this.button.set('checked', true);
                    } else {
                        this.button.set('checked', false);
                    }
                } else {
                    this.button.set('disabled', true);

                }

            }

        },

        process: function () {
            var selected = this.editor.getSelection();

            var $node = selected.$node;

            if ($node.hasClass(this.alignClass)) {
                this.disable($node);

            } else {
                this.disableOthers($node);
                this.enable($node);
            }

            this.editor.forceChange();
        },

        disableOthers: function ($node) {
            for (var button in registeredButtons) {
                if (registeredButtons[button] === this || !button.startsWith(this.editor.id +'-')) {
                    continue;
                }
                registeredButtons[button].disable($node);
            }
        },

        enable: function ($node) {
            $node.addClass(this.alignClass);
            this.button.set('checked', true);
        },

        disable: function ($node) {
            $node.removeClass(this.alignClass);
            this.button.set('checked', false);
        }


    });


    // Register this plugin.
    _Plugin.registry["cell_align"] = function () {
        return new AlignButton({command: "cell_align"});
    };

    return AlignButton;
});