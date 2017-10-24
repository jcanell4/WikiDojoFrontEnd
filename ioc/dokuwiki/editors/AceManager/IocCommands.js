define([
    "dojo/Stateful",
    "dojo/_base/declare",
    "ioc/dokuwiki/editors/AceManager/IocContextTable"
], function (Stateful, declare, IocContextTable) {
    return declare([Stateful],
        /**
         * Classe que conté les comandes que s'afegiran al editor ace.
         *
         * @class IocCommands
         */
        {
            /** @type {AceWrapper} */
            editor: null,

            /** @type {Object[]} */
            contexts: [],

            /** @type {int} id del marcador del menú */
            menu_marker: null,


            /**
             * Al constructor s'ha de passar el embolcall del editor per poder inicialitzar les opcions correctament.
             *
             * @param {AceWrapper} aceWrapper - Embolcall del editor al que s'aplicaran els comandaments
             */
            constructor: function (aceWrapper) {
                this.aceWrapper = aceWrapper;
                this.contexts = [IocContextTable(aceWrapper)];
                this.init();
            },

            /**
             * Afegeix un menú a la posició del cursor.
             *
             * @param {Object} context - Contexte en es crearà el menú TODO: No es fa servir
             * @private
             */
            add_menu_marker: function (context) {
                var pos;
                pos = this.aceWrapper.cursor_position();

                this.menu_marker = this.aceWrapper.add_marker(
                    {
                        start_row: pos.row,

                        start_column: pos.column,

                        end_row: pos.row,

                        end_column: pos.column + 1,

                        klass: 'menu',

                        /**
                         * Configura el menú a mostrar.
                         *
                         * El contexte on s'executa aquest mètode es un objecte de tipus IocContextTable.
                         *
                         * @param {{top: int, screen_height: int, bottom: int, container_height: int}} args - dades per
                         * configurar el menú.
                         * @returns {string}
                         */
                        on_render: function (args) {
                            var vertical_pos = args.top > args.screen_height - args.bottom ? "bottom: "
                                + (args.container_height - args.top) + "px;" : "top: " + args.bottom + "px;",

                                style = "position: absolute; left: " + args.left + "px; " + vertical_pos,

                                attributes = "class=\"ace_menu\" style=\"" + style + "\"",

                                items = (function () {
                                    var item, ref, results;
                                    ref = context.menu;
                                    results = [];

                                    for (var i = 0, len = ref.length; i < len; i++) {
                                        item = ref[i];
                                        results.push("<div><strong>" + item.key + "</strong> " + item.label + "</div>");
                                    }

                                    return results;
                                })();

                            return "<div " + attributes + ">" + (items.join('')) + "</div>";
                        }
                    });
            },

            /**
             * Retorna la funció a executar segons la plataforma en la que s'executa l'editor i el contexte.
             *
             * @param name - nom de la funció a executar
             * @param {{win: function, mac: function}?} fallback - Funció a executar segons la plataforma
             * @returns {function}
             * @private
             */
            callback: function (name, fallback) {
                var self = this;

                return function () {
                    var context, data, exec, platform, base;

                    for (var i = 0, len = self.contexts.length; i < len; i++) {

                        context = self.contexts[i];

                        if (data = context.parse()) {
                            if (typeof (base = context.commands)[name] === "function") {
                                base[name](data);
                            }

                            self.hide_menu();
                            return;
                        }
                    }

                    if (fallback) {
                        platform = self.aceWrapper.platform();
                        exec = fallback[platform] || fallback;
                        return typeof exec === "function" ? exec.call(context) : null;
                    }
                };
            },

            /**
             * Oculta el menú
             */
            hide_menu: function () {
                if (this.menu_marker) {
                    this.aceWrapper.remove_marker(this.menu_marker);
                }
                this.menu_marker = null;
            },


            /**
             * Inicialitza els comandaments, afegint-los al embolcall del editor ace.
             *
             * @private
             */
            init: function () {
                var self = this;

                this.aceWrapper.add_command({
                    name:    'doku-alt-left',
                    key_win: 'Alt-Left',
                    key_mac: 'Option-Left',
                    exec:    this.callback('alt_left', {
                        win: this.aceWrapper.navigate_line_start,
                        mac: this.aceWrapper.navigate_word_left
                    })
                });

                this.aceWrapper.add_command({
                    name:    'doku-alt-right',
                    key_win: 'Alt-Right',
                    key_mac: 'Option-Right',
                    exec:    this.callback('alt_right', {
                        win: this.aceWrapper.navigate_line_end,
                        mac: this.aceWrapper.navigate_word_right
                    })
                });

                this.aceWrapper.add_command({
                    name:    'doku-ctrl-shift-d',
                    key_win: 'Ctrl-Shift-D',
                    key_mac: 'Command-Shift-D',
                    exec:    this.callback('ctrl_shift_d', this.aceWrapper.duplicate_selection)
                });

                this.aceWrapper.add_command({
                    name: 'doku-hide-menu',
                    exec: function () {
                        self.hide_menu();
                    }
                });

                this.aceWrapper.add_command({
                    name: 'doku-menu',
                    exec: function () { // això era show_menu()

                        // Només s'ha de mostrar si es tracta d'una taula
                        if (!self.isTable()) {
                            return;
                        }

                        var context;
                        self.hide_menu();

                        for (var i = 0, len = self.contexts.length; i < len; i++) {
                            context = self.contexts[i];
                            if (context.parse) {
                                self.add_menu_marker(context);
                                return;
                            }
                        }
                    }
                });

                this.aceWrapper.add_command({
                    name: 'doku-menu-c',
                    exec: this.callback('menu_c')
                });

                this.aceWrapper.add_command({
                    name: 'doku-menu-l',
                    exec: this.callback('menu_l')
                });

                this.aceWrapper.add_command({
                    name: 'doku-menu-r',
                    exec: this.callback('menu_r')
                });

                this.aceWrapper.add_command({
                    name: 'doku-menu-t',
                    exec: this.callback('menu_t')
                });

                this.aceWrapper.add_command({
                    name:    'doku-return',
                    key_win: 'Return',
                    key_mac: 'Return',
                    exec:    this.callback('return', function () {
                        return self.aceWrapper.insert('\n');
                    })
                });

                this.aceWrapper.add_command({
                    name:    'doku-shift-return',
                    key_win: 'Shift-Return',
                    key_mac: 'Shift-Return',
                    exec:    this.callback('shift_return', function () {
                        return self.aceWrapper.insert('\n');
                    })
                });

                this.aceWrapper.add_command({
                    name:    'doku-shift-tab',
                    key_win: 'Shift-Tab',
                    key_mac: 'Shift-Tab',
                    exec:    this.callback('shift_tab', this.aceWrapper.outdent)
                });

                this.aceWrapper.add_command({
                    name:    'doku-tab',
                    key_win: 'Tab',
                    key_mac: 'Tab',
                    exec:    this.callback('tab', this.aceWrapper.indent)
                });

                this.aceWrapper.set_keyboard_states({
                    'start': [
                        {
                            key:  'ctrl-space',
                            exec: 'doku-menu',
                            then: 'doku-menu'
                        }
                    ],

                    'doku-menu': [
                        {
                            key:  'ctrl-space',
                            exec: 'doku-menu'
                        },
                        {
                            key:  'esc',
                            exec: 'doku-hide-menu',
                            next: 'start'
                        },
                        {
                            key:  'c',
                            exec: 'doku-menu-c',
                            then: 'start'
                        },
                        {
                            key:  'l',
                            exec: 'doku-menu-l',
                            then: 'start'
                        },
                        {
                            key:  'r',
                            exec: 'doku-menu-r',
                            then: 'start'
                        },
                        {
                            key:  't',
                            exec: 'doku-menu-t',
                            then: 'start'
                        },
                        {
                            then: 'start'
                        }
                    ]
                });
            },

            /**
             * Comprova si la línia en la que es troba el cursor conté l'estat table i retorna cert si el conté o fals
             * en cas contrari
             *
             * @returns {boolean} - Cert si es tracta d'una fila amb l'estat taula ('table') fals en cas contrari.
             */
            isTable: function () {
                var states = this.aceWrapper.get_line_states(this.aceWrapper.getCurrentRow());

                for (var i = 0, len = states.length; i < len; i++) {
                    if (states[i].name.indexOf("table") == 0) {
                        return true;
                    }
                }

                return false;
            }
        });
});

