define([
    'dojo/_base/declare',
    'ioc/dokuwiki/AceManager/AbstractRuleSet',
    'ace-builds/mode-php',
    'ace-builds/mode-html'

], function (declare, AbstractRuleSet) {
    return declare(AbstractRuleSet,
        /**
         * Joc de regles configurat per la dokuwiki 3.0 del IOC.
         *
         * @class IocRuleSet
         * @extends AbstractRuleSet
         * @author Xavier García<xaviergaro.dev@gmail.com>
         */
        {
            baseHighlighters: {
                php:  ace.require("ace/mode/php_highlight_rules").PhpHighlightRules,
                html: ace.require("ace/mode/html_highlight_rules").HtmlHighlightRules,
                latex:      ace.require("ace/mode/latex_highlight_rules").LatexHighlightRules,
                markdown:   ace.require("ace/mode/markdown_highlight_rules").MarkdownHighlightRules
            },

            _extraRules: [
                ['embed', ['php', '<php>', '</php>', 'keyword', 'php']],
                ['embed', ['phpblock', '<PHP>', '</PHP>', 'keyword', 'php']],
                ['embed', ['html', '<html>', '</html>', 'keyword', 'html']],
                ['embed', ['htmlblock', '<HTML>', '</HTML>', 'keyword', 'html']],
                ['base', ['^(?: {2,}|\t{1,})[\-\\*]', 'markup.list']],
                ['base', ['^(?:  |\t).+$', 'text']],
                ['inline', ['~~NOTOC~~', 'keyword']],
                ['inline', ['~~NOCACHE~~', 'keyword']],
                ['base', ['[ \t]*={2,}.+={2,}[ \t]*$', 'markup.heading']],
                /** TODO: Reactivar aquesta taula que es la original
                ['container', ['table', '^[\\||\\^](?=.*[\\||\\^][ \t]*$)', 'keyword.operator']],
                ['rule', ['table-start', '[\\|\\^][ \t]*$', 'keyword.operator', 'start']],
                ['rule', ['table-start', '[\\|\\^]|:::(?=[ \t]*[\\|\\^])', 'keyword.operator']],
                 */
                ['format', ['strong', '\\*\\*', '\\*\\*']],
                ['format', ['emphasis', '//', '//']],
                ['format', ['underline', '__', '__']],
                ['format', ['monospace', "''", "''"]],
                ['format', ['subscript', '<sub>', '</sub>']],
                ['format', ['superscript', '<sup>', '</sup>']],
                ['format', ['subscript', '<del>', '</del>']],
                ['inline', ['\\\\\\\\', 'keyword.operator']],
                ['format', ['footnote', '\\(\\(', '\\)\\)']],
                ['base', ['^[ \t]*-{4,}[ \t]*$', 'keyword.operator']],
                ['format', ['unformatted', '<nowiki>', '</nowiki>', 'comment', 'comment']],
                ['format', ['unformattedalt', '%%', '%%', 'comment', 'comment']],
                ['base', ['^>{1,2}', 'keyword.operator']],
                ['inline', ['\\[\\[(?=.*\\]\\])', 'keyword.operator', 'internallink-ref']],
                ['rule', ['internallink-ref', '\\]\\]', 'keyword.operator', 'start']],
                ['rule', ['internallink-ref', '\\|', 'keyword.operator', 'internallink-title']],
                ['rule', ['internallink-ref', '.+?(?=\\||\\]\\])', 'markup.underline']],
                ['rule', ['internallink-title', '\\]\\]', 'keyword.operator', 'start']],
                ['rule', ['internallink-title', '.+?(?=\\]\\])', 'string']],
                ['inline', ['\\{\\{ ?(?=.*\\}\\})', 'keyword.operator', 'media-ref']],
                ['rule', ['media-ref', '\\}\\}', 'keyword.operator', 'start']],
                ['rule', ['media-ref', '\\?', 'keyword.operator', 'media-param']],
                ['rule', ['media-ref', '\\|', 'keyword.operator', 'media-title']],
                ['rule', ['media-ref', '.+?(?=\\?|\\||\\}\\})', 'markup.underline']],
                ['rule', ['media-param', '&', 'keyword.operator']],
                ['rule', ['media-param', '\\|', 'keyword.operator', 'media-title']],
                ['rule', ['media-param', '\\}\\}', 'keyword.operator', 'start']],
                ['rule', ['media-param', '[0-9]+(?=&|\\||\\}\\})', 'constant.numeric']],
                ['rule', ['media-param', '([0-9]+)(x)([0-9]+)(?=&|\\||\\}\\})', ['constant.numeric', 'keyword.operator',
                    'constant.numeric']]],
                ['rule', ['media-param', '(?:direct|nolink|linkonly|nocache|recache)(?=&|\\||\\}\\})', 'consant']],
                ['rule', ['media-param', '.+?(?=&|\\||\\}\\})', 'keyword.invalid']],
                ['rule', ['media-title', '\\}\\}', 'keyword.operator', 'start']],
                ['rule', ['media-title', '.+?(?=\\}\\})', 'string']],
                ['inline', [
                    '(?:(?:https?|telnet|gopher|wais|ftp|ed2k|irc)://'
                    + '[\\w/\\#~:.?+=&%@!\\-.:?\\-;,]+?(?=[.:?\\-;,]*'
                    + '[^\\w/\\#~:.?+=&%@!\\-.:?\\-;,]|$)|(?:www|ftp)\\'
                    + '[\\w.:?\\-;,]+?\\.[\\w.:?\\-;,]+?'
                    + '[\\w/\\#~:.?+=&%@!\\-.:?\\-;,]+?'
                    + '(?=[.:?\\-;,]*[^\\w/\\#~:.?+=&%@!\\-.:?\\-;,]|$))',
                    'markup.underline']],
                ['inline', [
                    '(<)([0-9a-zA-Z!#$%&\'*+\/=?^_`{|}~-]+'
                    + '(?:\\.[0-9a-zA-Z!#$%&\'*+\\/=?^_`{|}~-]+)*'
                    + '@(?:[0-9a-zA-Z][0-9a-zA-Z-]*\\.)+'
                    + '(?:[a-zA-Z]{2,4}|museum|travel))(>)',
                    ['keyword.operator', 'markup.underline', 'keyword.operator']
                ]],

                // Proves container TODO: Esborrar
                ['container', ['test', '<test>', 'keyword.operator']],
                ['rule', ['test-start', '</test>', 'keyword.operator', 'start']],
                ['rule', ['test-start', '<test>', 'keyword.operator']],
                ['container', ['test2', '<test2>', 'keyword.operator']],
                ['rule', ['test2-start', '</test2>', 'keyword.operator', 'start']],
                ['rule', ['test2-start', '<test2>', 'keyword.operator']],

                ['container', ['table', '<xx>', 'keyword.operator']],
                ['rule', ['table-start', '</xx>', 'keyword.operator', 'start']],
                ['rule', ['table-start', '<xx>', 'keyword.operator']],


            ],

            /**
             * En aquest mètode es comprova si s'han carregat els llenguatges latex o markdown i afegeix les regles
             * adicionals.
             */
            process: function () {

                // TODO Esborrar al integrar amb dokuwiki
                if (this.mode.getHighlighters().latex) {
                    this._addLatexExtras();
                }

                // TODO Esborrar al integrar amb dokuwiki
                if (this.mode.getHighlighters().markdown) {
                    this._addMarkDownExtras();
                }

                /* TODO Activar aquests al integrar
                if (JSINFO.plugin_aceeditor.latex) {
                    this._addLatexExtras();
                }

                if (JSINFO.plugin_aceeditor.markdown) {
                    this._addMarkDownExtras();
                }*/

            },

            /**
             * Afegeix regles adicionals pel ressaltador latex
             *
             * @private
             */
            _addLatexExtras: function () {
                // 100 latex
                this.mode.defEmbed('latex-latex', '<latex>', '</latex>', 'keyword', 'latex');

                // 300 latex
                this.mode.defEmbed('latex-ddollar', '\\$\\$', '\\$\\$', 'keyword', 'latex');

                // 405 latex
                this.mode.defEmbed('latex-dollar', '\\$', '\\$', 'keyword', 'latex');
                this.mode.defEmbed('latex-displaymath', '\\\\begin\\{displaymath\\}', '\\\\end\\{displaymath\\}', 'keyword', 'latex');
                this.mode.defEmbed('latex-equation', '\\\\begin\\{equation\\}', '\\\\end\\{equation\\}', 'keyword', 'latex');
                this.mode.defEmbed('latex-equationstar', '\\\\begin\\{equation\\*\\}', '\\\\end\\{equation\\*\\}', 'keyword', 'latex');
                this.mode.defEmbed('latex-eqnarray', '\\\\begin\\{eqnarray\\}', '\\\\end\\{eqnarray\\}', 'keyword', 'latex');
                this.mode.defEmbed('latex-eqnarraystar', '\\\\begin\\{eqnarray\\*\\}', '\\\\end\\{eqnarray\\*\\}', 'keyword', 'latex');
            },

            /**
             * Afegeix les regles adicionals pel ressaltador markdown
             *
             * @private
             */
            _addMarkDownExtras: function () {
                // 69 markdown
                this.mode.defEmbed('markdown', '<markdown>', '</markdown>', 'keyword', 'markdown');
            }
        });
});