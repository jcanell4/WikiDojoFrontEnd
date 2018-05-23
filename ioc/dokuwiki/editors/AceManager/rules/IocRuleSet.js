define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/rules/AbstractRuleSet',
    'ioc/dokuwiki/editors/AceManager/modes/mode-java',
    'ioc/dokuwiki/editors/AceManager/modes/mode-php',
    'ioc/dokuwiki/editors/AceManager/modes/mode-html',
    'ioc/dokuwiki/editors/AceManager/modes/mode-markdown',
    'ioc/dokuwiki/editors/AceManager/modes/mode-latex',
    // 'ace-builds/mode-latex',

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
                java:  ace.require("ace/mode/java_highlight_rules").JavaHighlightRules,

                php:  ace.require("ace/mode/php_highlight_rules").PhpHighlightRules,
                html: ace.require("ace/mode/html_highlight_rules").HtmlHighlightRules,
                latex:      ace.require("ace/mode/latex_highlight_rules").LatexHighlightRules,
                markdown:   ace.require("ace/mode/markdown_highlight_rules").MarkdownHighlightRules
            },

            _extraRules: [
                ['inline', ["\\{\{\\s?(?:vimeo|youtube|dailymotion|altamarVideos|altamarFromUrl|altamarFromId|altamarFromReq).*?>[^}]+\\}\\}", "keyword"]],
                ['inline',["\\{\\{\\s?(?:soundcloud|iocgif).*?>.*?:[^}]+\\}\\}", "keyword"]],

                ['container', ["quiz", "<quiz>", "keyword"]],
                ['rule', ["quiz-start", "^(?: {2,}|	{1,})[-\\*]", "markup.list"]],
                ['rule', ["quiz-start", "</quiz>", "keyword", "start"]],
                ['base', ["^(?: {2,}|	{1,})[-\\*]", "markup.list"]],
                ['base', ["^(?:  |	).+$", "text"]],
                ['inline', ["~~NOTOC~~", "keyword"]],
                ['inline', ["~~NOCACHE~~", "keyword"]],
                ['base', ["[ 	]*={2,}.+={2,}[ 	]*$", "markup.heading"]],
                ['container', ["table", "^[\\|\\^]", "keyword.operator"]],
                ['rule', ["table-start", "[\\|\\^]", "keyword.operator"]],
                ['rule', ["table-start", "[	 ]*:::[	 ]*(?=[\\|\\^])", "keyword.operator"]],
                ['rule', ["table-start", "[	 ]+", "text"]],
                ['rule', ["table-start", "$", "text", "start"]],
                ['format', ["strong", "\\*\\*", "\\*\\*"]],
                ['format', ["emphasis", "//", "//"]],
                ['format', ["underline", "__", "__"]],
                ['format', ["monospace", "''", "''"]],
                ['format', ["subscript", "<sub>", "</sub>"]],
                ['format', ["superscript", "<sup>", "</sup>"]],
                ['format', ["subscript", "<del>", "</del>"]],
                ['inline', ["\\\\\\\\", "keyword.operator"]],
                ['format', ["footnote", "\\(\\(", "\\)\\)"]],
                ['base', ["^[ 	]*-{4,}[ 	]*$", "keyword.operator"]],
                ['format', ["unformatted", "<nowiki>", "</nowiki>", "comment", "comment"]],
                ['format', ["unformattedalt", "%%", "%%", "comment", "comment"]],
                ['embed', ["php", "<php>", "</php>", "keyword", "php"]],
                ['embed', ["phpblock", "<PHP>", "</PHP>", "keyword", "php"]],
                ['embed', ["html", "<html>", "</html>", "keyword", "html"]],
                ['embed', ["htmlblock", "<HTML>", "</HTML>", "keyword", "html"]],
                ['container', ["note", "<note>", "keyword"]],
                ['rule', ["note-start", "</note>", "keyword", "start"]],
                ['base', ["^>{1,2}", "keyword.operator"]],
                ['inline', ["\\[\\[(?=.*\\]\\])", "keyword.operator", "internallink-ref"]],
                ['rule', ["internallink-ref", "\\]\\]", "keyword.operator", "start"]],
                ['rule', ["internallink-ref", "\\|", "keyword.operator", "internallink-title"]],
                ['rule', ["internallink-ref", ".+?(?=\\||\\]\\])", "markup.underline"]],
                ['rule', ["internallink-title", "\\]\\]", "keyword.operator", "start"]],
                ['rule', ["internallink-title", ".+?(?=\\]\\])", "string"]],
                ['inline', ["\\{\\{ ?(?=.*\\}\\})", "keyword.operator", "media-ref"]],
                ['rule', ["media-ref", "\\}\\}", "keyword.operator", "start"]],
                ['rule', ["media-ref", "\\?", "keyword.operator", "media-param"]],
                ['rule', ["media-ref", "\\|", "keyword.operator", "media-title"]],
                ['rule', ["media-ref", ".+?(?=\\?|\\||\\}\\})", "markup.underline"]],
                ['rule', ["media-param", "&", "keyword.operator"]],
                ['rule', ["media-param", "\\|", "keyword.operator", "media-title"]],
                ['rule', ["media-param", "\\}\\}", "keyword.operator", "start"]],
                ['rule', ["media-param", "[0-9]+(?=&|\\||\\}\\})", "constant.numeric"]],
                ['rule', ["media-param", "([0-9]+)(x)([0-9]+)(?=&|\\||\\}\\})", ["constant.numeric", "keyword.operator", "constant.numeric"]]],
                ['rule', ["media-param", "(?:direct|nolink|linkonly|nocache|recache)(?=&|\\||\\}\\})", "consant"]],
                ['rule', ["media-param", ".+?(?=&|\\||\\}\\})", "keyword.invalid"]],
                ['rule', ["media-title", "\\}\\}", "keyword.operator", "start"]],
                ['rule', ["media-title", "/(?=[^/]*?\\}\\})", "keyword.operator", "media-offset"]],
                ['rule', ["media-title", ".+?(?=/|\\}\\})", "string"]],
                ['rule', ["media-offset", "\\}\\}", "keyword.operator", "start"]],
                ['rule', ["media-offset", "-?\\d+(?=\\}\\})", "constant.numeric"]],
                ['rule', ["media-offset", ".+?(?=\\}\\})", "keyword.invalid"]],
                ['inline', ["(?:(?:https?|telnet|gopher|wais|ftp|ed2k|irc)://[\\w/\\#~:.?+=&%@!\\-.:?\\-;,]+?(?=[.:?\\-;,]*[^\\w/\\#~:.?+=&%@!\\-.:?\\-;,]|$)|(?:www|ftp)\\[\\w.:?\\-;,]+?\\.[\\w.:?\\-;,]+?[\\w/\\#~:.?+=&%@!\\-.:?\\-;,]+?(?=[.:?\\-;,]*[^\\w/\\#~:.?+=&%@!\\-.:?\\-;,]|$))", "markup.underline"]],
                ['inline', ["(<)([0-9a-zA-Z!#$%&'*+/=?^_`{|}~-]+(?:\\.[0-9a-zA-Z!#$%&'*+\\/=?^_`{|}~-]+)*@(?:[0-9a-zA-Z][0-9a-zA-Z-]*\\.)+(?:[a-zA-Z]{2,4}|museum|travel))(>)", ["keyword.operator", "markup.underline", "keyword.operator"]]],
                ['box', ["table", ["id", "title", "footer", "large", "small", "vertical"]]],
                ['box', ["accounting", ["id", "title", "footer", "widths"]]],
                ['box', ["figure", ["id", "title", "copyright", "license", "footer", "large"]]],
                ['box', ["text", ["offset", "title", "large"]]],
                ['box', ["note", ["offset"]]],
                ['box', ["reference", ["offset"]]],
                ['box', ["quote"]],
                ['box', ["important"]],
                ['box', ["example", ["title"]]],
                ['base', ["^(::)(.+?)(:)", ["keyword.operator", "keyword.invalid", "keyword.operator"]]],
                ['base', ["^:::s*$", "keyword.operator"]],
                ['inline', ["(:)(table|figure)(:)(.+?)(:)", ["keyword.operator", "keyword", "keyword.operator", "text", "keyword.operator"]]],
                ['inline', ["<newcontent>", "keyword"]],
                ['inline', ["</newcontent>", "keyword"]],
                ['inline', ["<iocstl .*>", "keyword"]],
                ['inline', ["</iocstl>", "keyword"]],
                ['inline', ["<quiz .*>", "keyword"]],
                ['inline', ["</quiz>", "keyword"]],
                ['inline', ["!!!!", "keyword.operator"]],

                // Test readonly
                ['container', ["readonly", "<readonly>", "keyword.operator.readonly"]],
                ['rule', ["readonly-start", "</readonly>", "keyword.operator.readonly", "start"]],

                ['container', ["edittable", "<edittable>", "keyword.operator.edittable"]],
                ['rule', ["edittable-start", "</edittable>", "keyword.operator.edittable", "start"]],

            ],

            /**
             * En aquest mètode es comprova si s'han carregat els llenguatges latex o markdown i afegeix les regles
             * adicionals.
             */
            process: function () {
                if (JSINFO.plugin_aceeditor.latex) {
                    this._addLatexExtras();
                }

                if (JSINFO.plugin_aceeditor.markdown) {
                    this._addMarkDownExtras();
                }
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