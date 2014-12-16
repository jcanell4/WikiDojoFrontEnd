define([
    "dojo/Stateful",
    "dojo/_base/declare",
    "dojo/_base/lang"
], function (Stateful, declare, lang) {
    return declare([Stateful],
        /**
         * Classe per fer l'intercanvi entre el editor ace i el editor de la dokuwiki
         *
         * @class Toggle
         * @extends dojo.Stateful
         * @author Xavier García<xaviergaro.dev@gmail.com>
         */
        {
            IMAGES_BASE: window.DOKU_BASE + 'lib/plugins/aceeditor/images/',

            img_off: null,

            img_on: null,

            container: null,

            constructor: function (container) {
                this.container = container;
                this.init();
            },

            init: function () {
                var on = jQuery('<img>')
                        .addClass('ace-toggle')
                        //.attr('src', this.IMAGES_BASE + 'toggle_on.png')
                        .attr('src', 'images/toggle_on.png')
                        .click(lang.hitch(this, this.disable))
                        .insertAfter(jQuery('#size__ctl'))
                        .hide(),

                    off = jQuery('<img>')
                        .addClass('ace-toggle')
                        //.attr('src', this.IMAGES_BASE + 'toggle_on.png')
                        .attr('src', 'images/toggle_on.png')
                        .click(lang.hitch(this, this.enable))
                        .insertAfter(jQuery('#size__ctl'));

                this.img_on = on;
                this.img_off = off;
            },

            on:   function () {
                this.img_on.show();
                this.img_off.hide();
            },

            off:  function () {
                this.img_on.hide();
                this.img_off.show();
            },

            enable: function () {
                var selection,
                    container = this.container,
                    ace = this.container.get("aceWrapper"),
                    doku = this.container.get("dokuWrapper");
                selection = doku.get_selection();
                doku.disable();
                container.set_height(doku.inner_height());
                container.show();
                this.on();
                ace.set_value(doku.get_value());
                ace.resize();
                ace.focus();
                ace.set_selection(selection.start, selection.end);
                //user_editing = true; // TODO comprovar on s'ha d'actualitzar aquest valor i per a que es fa servir --> Es fa servir a la funció callback que es passa al AceEditor
                doku.set_cookie('aceeditor', 'on');
            },

            disable: function () {
                var selection,
                    container = this.container,
                    ace = this.container.get("aceWrapper"),
                    doku = this.container.get("dokuWrapper");

                selection = ace.get_selection();
                //user_editing = false; // TODO comprovar on s'ha d'actualitzar aquest valor i per a que es fa servir --> Es fa servir a la funció callback que es passa al AceEditor
                doku.set_cookie('aceeditor', 'off');
                container.hide();
                this.off();
                doku.enable();
                doku.set_value(ace.get_value());
                doku.set_selection(selection.start, selection.end);
                doku.focus();
            }

        }
    )
});

