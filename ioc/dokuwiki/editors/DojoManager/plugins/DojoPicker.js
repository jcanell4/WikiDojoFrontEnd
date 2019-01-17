define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
], function (declare, AbstractDojoPlugin, lang, _Plugin) {

    var TIMER_INTERVAL = 0.1;
    var timer = null;


    var PickerButton = declare(AbstractDojoPlugin, {

        init: function (args) {
            this.inherited(arguments);

            var config = {
                label: args.title,
                ownerDocument: this.editor.ownerDocument,
                dir: this.editor.dir,
                lang: this.editor.lang,
                showLabel: false,
                iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + args.icon, // TODO[Xavi] el prefix ha de canviar per correspondre amb una classe CSS que mostri la icona
                tabIndex: "-1",
                onClick: lang.hitch(this, "process")
            };

            this.addButton(config);

            this.pickerid = 'picker' + (pickercounter++); // pickercounter es una variable global definida per la wiki a toolbar.js

            var props = {
                block : false,
                title : args.title,
                type: 'picker',
                list : args.list
            };

            this.edid = 'textarea_' + this.editor.id + '_picker';
            createPicker(this.pickerid, props, this.edid);
        },

        _processFull: function () {

            var formId = 'form_' + this.editor.id + '_picker';

            jQuery('form#' + formId).remove();
            clearInterval(timer);

            // Afegim un de nou
            var $form = jQuery('<form>')
                .attr('id', formId);

            var $textarea = jQuery('<textarea>')
                .attr('id', this.edid);

            $form.css('display', 'none');

            $form.append($textarea);

            jQuery('body').append($form);

            // ALERTA[Xavi] El canvia al textarea es fa mitjançant expresions regulars directament
            // sobre el text, no es dispara cap event

            var context = this;

            timer = setInterval(function () {
                var value = $textarea.val();

                if (value.length > 0) {
                    clearInterval(timer);
                    context.insertHtml(value);
                    timer = null;
                }

            }, TIMER_INTERVAL);


            $textarea.focus();

            var $btn = jQuery(this.button.domNode);

            pickerToggle(this.pickerid, $btn);

        },

        insertHtml: function (value) {
            // var html = this.wikiInternalLinkToHTML(value);
            // ALERTA[Xavi] Pel cas dels caràcters especials carldria fer servir un diccionari i fer la conversió a entitats html
            this.editor.execCommand('inserthtml', value);
        },


    });


    // Register this plugin.
    _Plugin.registry["picker"] = function () {
        return new PickerButton({command: "picker"});
    };

    return PickerButton;
});