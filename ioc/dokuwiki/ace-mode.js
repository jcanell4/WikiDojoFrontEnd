var __slice = [].slice;

define([
      'ace/mode/text'
    , 'ace/tokenizer'
    , 'ace/mode/c_cpp_highlight_rules'
    , 'ace/mode/clojure_highlight_rules'
    , 'ace/mode/coffee_highlight_rules'
    , 'ace/mode/coldfusion_highlight_rules'
    , 'ace/mode/csharp_highlight_rules'
    , 'ace/mode/css_highlight_rules'
    , 'ace/mode/diff_highlight_rules'
    , 'ace/mode/golang_highlight_rules'
    , 'ace/mode/groovy_highlight_rules'
    , 'ace/mode/haxe_highlight_rules'
    , 'ace/mode/html_highlight_rules'
    , 'ace/mode/java_highlight_rules'
    , 'ace/mode/javascript_highlight_rules'
    , 'ace/mode/json_highlight_rules'
    , 'ace/mode/jsx_highlight_rules'
    , 'ace/mode/latex_highlight_rules'
    , 'ace/mode/less_highlight_rules'
    , 'ace/mode/liquid_highlight_rules'
    , 'ace/mode/lua_highlight_rules'
    , 'ace/mode/luapage_highlight_rules'
    , 'ace/mode/markdown_highlight_rules'
    , 'ace/mode/ocaml_highlight_rules'
    , 'ace/mode/perl_highlight_rules'
    , 'ace/mode/pgsql_highlight_rules'
    , 'ace/mode/php_highlight_rules'
    , 'ace/mode/powershell_highlight_rules'
    , 'ace/mode/python_highlight_rules'
    , 'ace/mode/ruby_highlight_rules'
    , 'ace/mode/scad_highlight_rules'
    , 'ace/mode/scala_highlight_rules'
    , 'ace/mode/scss_highlight_rules'
    , 'ace/mode/sh_highlight_rules'
    , 'ace/mode/sql_highlight_rules'
    , 'ace/mode/svg_highlight_rules'
    , 'ace/mode/tcl_highlight_rules'
    , 'ace/mode/textile_highlight_rules'
    , 'ace/mode/xml_highlight_rules'
    , 'ace/mode/xquery_highlight_rules'
    , 'ace/mode/yaml_highlight_rules'], function() {
  var deps;
  deps = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return function(spec) {
    var CSharpHighlightRules, ClojureHighlightRules, CoffeeHighlightRules, ColdfusionHighlightRules, CssHighlightRules, DiffHighlightRules, GolangHighlightRules, GroovyHighlightRules, HaxeHighlightRules, HtmlHighlightRules, JavaHighlightRules, JavaScriptHighlightRules, JsonHighlightRules, JsxHighlightRules, LatexHighlightRules, LessHighlightRules, LiquidHighlightRules, LuaHighlightRules, LuaPageHighlightRules, MarkdownHighlightRules, Mode, OcamlHighlightRules, PerlHighlightRules, PgsqlHighlightRules, PhpHighlightRules, PowershellHighlightRules, PythonHighlightRules, RubyHighlightRules, ScalaHighlightRules, ScssHighlightRules, ShHighlightRules, SqlHighlightRules, SvgHighlightRules, TclHighlightRules, TextileHighlightRules, Tokenizer, XQueryHighlightRules, XmlHighlightRules, YamlHighlightRules, c_cppHighlightRules, container_states, copy_rules, def_base, def_block, def_container, def_embed, def_format, def_inline, def_rule, doku_mode, embed_rules, indent_regex, inline_rules, lang, lang_rules, name, scadHighlightRules, tokenizer_rules, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2, _ref20, _ref21, _ref22, _ref23, _ref24, _ref25, _ref26, _ref27, _ref28, _ref29, _ref3, _ref30, _ref31, _ref32, _ref33, _ref34, _ref35, _ref36, _ref37, _ref38, _ref39, _ref4, _ref40, _ref41, _ref42, _ref43, _ref5, _ref6, _ref7, _ref8, _ref9;
    (_ref = deps[0], Mode = _ref.Mode), (_ref1 = deps[1], Tokenizer = _ref1.Tokenizer), (_ref2 = deps[2], c_cppHighlightRules = _ref2.c_cppHighlightRules), (_ref3 = deps[3], ClojureHighlightRules = _ref3.ClojureHighlightRules), (_ref4 = deps[4], CoffeeHighlightRules = _ref4.CoffeeHighlightRules), (_ref5 = deps[5], ColdfusionHighlightRules = _ref5.ColdfusionHighlightRules), (_ref6 = deps[6], CSharpHighlightRules = _ref6.CSharpHighlightRules), (_ref7 = deps[7], CssHighlightRules = _ref7.CssHighlightRules), (_ref8 = deps[8], DiffHighlightRules = _ref8.DiffHighlightRules), (_ref9 = deps[9], GolangHighlightRules = _ref9.GolangHighlightRules), (_ref10 = deps[10], GroovyHighlightRules = _ref10.GroovyHighlightRules), (_ref11 = deps[11], HaxeHighlightRules = _ref11.HaxeHighlightRules), (_ref12 = deps[12], HtmlHighlightRules = _ref12.HtmlHighlightRules), (_ref13 = deps[13], JavaHighlightRules = _ref13.JavaHighlightRules), (_ref14 = deps[14], JavaScriptHighlightRules = _ref14.JavaScriptHighlightRules), (_ref15 = deps[15], JsonHighlightRules = _ref15.JsonHighlightRules), (_ref16 = deps[16], JsxHighlightRules = _ref16.JsxHighlightRules), (_ref17 = deps[17], LatexHighlightRules = _ref17.LatexHighlightRules), (_ref18 = deps[18], LessHighlightRules = _ref18.LessHighlightRules), (_ref19 = deps[19], LiquidHighlightRules = _ref19.LiquidHighlightRules), (_ref20 = deps[20], LuaHighlightRules = _ref20.LuaHighlightRules), (_ref21 = deps[21], LuaPageHighlightRules = _ref21.LuaPageHighlightRules), (_ref22 = deps[22], MarkdownHighlightRules = _ref22.MarkdownHighlightRules), (_ref23 = deps[23], OcamlHighlightRules = _ref23.OcamlHighlightRules), (_ref24 = deps[24], PerlHighlightRules = _ref24.PerlHighlightRules), (_ref25 = deps[25], PgsqlHighlightRules = _ref25.PgsqlHighlightRules), (_ref26 = deps[26], PhpHighlightRules = _ref26.PhpHighlightRules), (_ref27 = deps[27], PowershellHighlightRules = _ref27.PowershellHighlightRules), (_ref28 = deps[28], PythonHighlightRules = _ref28.PythonHighlightRules), (_ref29 = deps[29], RubyHighlightRules = _ref29.RubyHighlightRules), (_ref30 = deps[30], scadHighlightRules = _ref30.scadHighlightRules), (_ref31 = deps[31], ScalaHighlightRules = _ref31.ScalaHighlightRules), (_ref32 = deps[32], ScssHighlightRules = _ref32.ScssHighlightRules), (_ref33 = deps[33], ShHighlightRules = _ref33.ShHighlightRules), (_ref34 = deps[34], SqlHighlightRules = _ref34.SqlHighlightRules), (_ref35 = deps[35], SvgHighlightRules = _ref35.SvgHighlightRules), (_ref36 = deps[36], TclHighlightRules = _ref36.TclHighlightRules), (_ref37 = deps[37], TextileHighlightRules = _ref37.TextileHighlightRules), (_ref38 = deps[38], XmlHighlightRules = _ref38.XmlHighlightRules), (_ref39 = deps[39], XQueryHighlightRules = _ref39.XQueryHighlightRules), (_ref40 = deps[40], YamlHighlightRules = _ref40.YamlHighlightRules);
    indent_regex = /^(?:(?:\x20{2,}|\t{1,})[\*\-][\x20\t]*|(?:\x20{2}|\t)(?=.)|>{1,}[\x20\t]*)/;
    lang_rules = {
      bash: ShHighlightRules,
      c: c_cppHighlightRules,
      clojure: ClojureHighlightRules,
      coffee: CoffeeHighlightRules,
      coldfusion: ColdfusionHighlightRules,
      cpp: c_cppHighlightRules,
      csharp: CSharpHighlightRules,
      css: CssHighlightRules,
      diff: DiffHighlightRules,
      golang: GolangHighlightRules,
      groovy: GroovyHighlightRules,
      haxe: HaxeHighlightRules,
      html: HtmlHighlightRules,
      java: JavaHighlightRules,
      javascript: JavaScriptHighlightRules,
      json: JsonHighlightRules,
      jsx: JsxHighlightRules,
      latex: LatexHighlightRules,
      less: LessHighlightRules,
      liquid: LiquidHighlightRules,
      lua: LuaHighlightRules,
      luapage: LuaPageHighlightRules,
      markdown: MarkdownHighlightRules,
      ocaml: OcamlHighlightRules,
      perl: PerlHighlightRules,
      pgsql: PgsqlHighlightRules,
      php: PhpHighlightRules,
      powershell: PowershellHighlightRules,
      python: PythonHighlightRules,
      ruby: RubyHighlightRules,
      scad: scadHighlightRules,
      scala: ScalaHighlightRules,
      scss: ScssHighlightRules,
      sh: ShHighlightRules,
      sql: SqlHighlightRules,
      svg: SvgHighlightRules,
      tcl: TclHighlightRules,
      textile: TextileHighlightRules,
      xml: XmlHighlightRules,
      xquery: XQueryHighlightRules,
      yaml: YamlHighlightRules
    };
    tokenizer_rules = {};
    inline_rules = [];
    container_states = [];
    def_rule = function(state, regex, token, next) {
      return (tokenizer_rules[state] || (tokenizer_rules[state] = [])).push({
        regex: regex,
        token: token,
        next: next,
        merge: true
      });
    };
    def_base = function(regex, token, next) {
      return def_rule('start', regex, token, next);
    };
    def_inline = function(regex, token, next) {
      def_base(regex, token, next);
      return inline_rules.push(_.last(tokenizer_rules['start']));
    };
    def_format = function(name, open_regex, close_regex, tag_token, content_token) {
      if (tag_token == null) {
        tag_token = 'keyword.operator';
      }
      def_inline(open_regex, tag_token, name);
      def_rule(name, close_regex, tag_token, 'start');
      if (content_token) {
        return def_rule(name, ".", content_token);
      }
    };
    def_block = function(name, open_regex, close_regex, token) {
      def_inline(open_regex, token, name);
      return def_rule(name, close_regex, token, 'start');
    };
    def_embed = function(name, open_regex, close_regex, token, lang) {
      var rules;
      def_inline("(?=" + open_regex + ")", token, name);
      def_rule(name, open_regex, token, "" + name + "-start");
      rules = new lang_rules[lang]().getRules();
      return embed_rules(rules, "" + name + "-", [
        {
          regex: close_regex,
          token: token,
          next: 'start'
        }
      ]);
    };
    def_container = function(name, regex, token) {
      def_base(regex, token, "" + name + "-start");
      return container_states.push(name);
    };
    embed_rules = function(rules, prefix, escape_rules) {
      var name, rule, state, _i, _len, _results;
      _results = [];
      for (name in rules) {
        state = rules[name];
        state = (function() {
          var _i, _len, _results1;
          _results1 = [];
          for (_i = 0, _len = state.length; _i < _len; _i++) {
            rule = state[_i];
            _results1.push(_.clone(rule));
          }
          return _results1;
        })();
        for (_i = 0, _len = state.length; _i < _len; _i++) {
          rule = state[_i];
          if (rule.next) {
            rule.next = prefix + rule.next;
          }
        }
        escape_rules = (function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = escape_rules.length; _j < _len1; _j++) {
            rule = escape_rules[_j];
            _results1.push(_.clone(rule));
          }
          return _results1;
        })();
        _results.push(tokenizer_rules[prefix + name] = escape_rules.concat(state));
      }
      return _results;
    };
    def_base('^(?: {2,}|\t{1,})[\-\\*]', 'markup.list');
    def_base('^(?:  |\t).+$', 'text');
    def_inline('~~NOTOC~~', 'keyword');
    def_inline('~~NOCACHE~~', 'keyword');
    def_base('[ \t]*={2,}.+={2,}[ \t]*$', 'markup.heading');
    def_container('table', '^[\\||\\^](?=.*[\\||\\^][ \t]*$)', 'keyword.operator');
    def_rule('table-start', '[\\|\\^][ \t]*$', 'keyword.operator', 'start');
    def_rule('table-start', '[\\|\\^]|:::(?=[ \t]*[\\|\\^])', 'keyword.operator');
    if (spec.markdown) {
      def_embed('markdown', '<markdown>', '</markdown>', 'keyword', 'markdown');
    }
    def_format('strong', '\\*\\*', '\\*\\*');
    def_format('emphasis', '//', '//');
    def_format('underline', '__', '__');
    def_format('monospace', "''", "''");
    if (spec.latex) {
      def_embed('latex-latex', '<latex>', '</latex>', 'keyword', 'latex');
    }
    def_format('subscript', '<sub>', '</sub>');
    def_format('superscript', '<sup>', '</sup>');
    def_format('subscript', '<del>', '</del>');
    def_inline('\\\\\\\\', 'keyword.operator');
    def_format('footnote', '\\(\\(', '\\)\\)');
    def_base('^[ \t]*-{4,}[ \t]*$', 'keyword.operator');
    def_format('unformatted', '<nowiki>', '</nowiki>', 'comment', 'comment');
    def_format('unformattedalt', '%%', '%%', 'comment', 'comment');
    def_embed('php', '<php>', '</php>', 'keyword', 'php');
    def_embed('phpblock', '<PHP>', '</PHP>', 'keyword', 'php');
    def_embed('html', '<html>', '</html>', 'keyword', 'html');
    def_embed('htmlblock', '<HTML>', '</HTML>', 'keyword', 'html');
    _ref41 = _.keys(lang_rules);
    for (_i = 0, _len = _ref41.length; _i < _len; _i++) {
      lang = _ref41[_i];
      def_embed("code-" + lang, "<code " + lang + ">", '</code>', 'keyword', lang);
    }
    def_block('code', '<code.*?>', '</code>', 'keyword');
    _ref42 = _.keys(lang_rules);
    for (_j = 0, _len1 = _ref42.length; _j < _len1; _j++) {
      lang = _ref42[_j];
      def_embed("file-" + lang, "<file " + lang + "(?: .*?)?>", '</file>', 'keyword', lang);
    }
    def_block('file', '<file.*?>', '</file>', 'keyword');
    def_base('^>{1,2}', 'keyword.operator');
    def_inline('\\[\\[(?=.*\\]\\])', 'keyword.operator', 'internallink-ref');
    def_rule('internallink-ref', '\\]\\]', 'keyword.operator', 'start');
    def_rule('internallink-ref', '\\|', 'keyword.operator', 'internallink-title');
    def_rule('internallink-ref', '.+?(?=\\||\\]\\])', 'markup.underline');
    def_rule('internallink-title', '\\]\\]', 'keyword.operator', 'start');
    def_rule('internallink-title', '.+?(?=\\]\\])', 'string');
    if (spec.latex) {
      def_embed('latex-ddollar', '\\$\\$', '\\$\\$', 'keyword', 'latex');
    }
    def_inline('\\{\\{ ?(?=.*\\}\\})', 'keyword.operator', 'media-ref');
    def_rule('media-ref', '\\}\\}', 'keyword.operator', 'start');
    def_rule('media-ref', '\\?', 'keyword.operator', 'media-param');
    def_rule('media-ref', '\\|', 'keyword.operator', 'media-title');
    def_rule('media-ref', '.+?(?=\\?|\\||\\}\\})', 'markup.underline');
    def_rule('media-param', '&', 'keyword.operator');
    def_rule('media-param', '\\|', 'keyword.operator', 'media-title');
    def_rule('media-param', '\\}\\}', 'keyword.operator', 'start');
    def_rule('media-param', '[0-9]+(?=&|\\||\\}\\})', 'constant.numeric');
    def_rule('media-param', '([0-9]+)(x)([0-9]+)(?=&|\\||\\}\\})', ['constant.numeric', 'keyword.operator', 'constant.numeric']);
    def_rule('media-param', '(?:direct|nolink|linkonly|nocache|recache)(?=&|\\||\\}\\})', 'consant');
    def_rule('media-param', '.+?(?=&|\\||\\}\\})', 'keyword.invalid');
    def_rule('media-title', '\\}\\}', 'keyword.operator', 'start');
    def_rule('media-title', '.+?(?=\\}\\})', 'string');
    def_inline('(?:(?:https?|telnet|gopher|wais|ftp|ed2k|irc)://' + '[\\w/\\#~:.?+=&%@!\\-.:?\\-;,]+?(?=[.:?\\-;,]*' + '[^\\w/\\#~:.?+=&%@!\\-.:?\\-;,]|$)|(?:www|ftp)\\' + '[\\w.:?\\-;,]+?\\.[\\w.:?\\-;,]+?' + '[\\w/\\#~:.?+=&%@!\\-.:?\\-;,]+?' + '(?=[.:?\\-;,]*[^\\w/\\#~:.?+=&%@!\\-.:?\\-;,]|$))', 'markup.underline');
    def_inline('(<)([0-9a-zA-Z!#$%&\'*+\/=?^_`{|}~-]+' + '(?:\\.[0-9a-zA-Z!#$%&\'*+\\/=?^_`{|}~-]+)*' + '@(?:[0-9a-zA-Z][0-9a-zA-Z-]*\\.)+' + '(?:[a-zA-Z]{2,4}|museum|travel))(>)', ['keyword.operator', 'markup.underline', 'keyword.operator']);
    if (spec.latex) {
      def_embed('latex-dollar', '\\$', '\\$', 'keyword', 'latex');
      def_embed('latex-displaymath', '\\\\begin\\{displaymath\\}', '\\\\end\\{displaymath\\}', 'keyword', 'latex');
      def_embed('latex-equation', '\\\\begin\\{equation\\}', '\\\\end\\{equation\\}', 'keyword', 'latex');
      def_embed('latex-equationstar', '\\\\begin\\{equation\\*\\}', '\\\\end\\{equation\\*\\}', 'keyword', 'latex');
      def_embed('latex-eqnarray', '\\\\begin\\{eqnarray\\}', '\\\\end\\{eqnarray\\}', 'keyword', 'latex');
      def_embed('latex-eqnarraystar', '\\\\begin\\{eqnarray\\*\\}', '\\\\end\\{eqnarray\\*\\}', 'keyword', 'latex');
    }
    _ref43 = spec.xmltags;
    for (_k = 0, _len2 = _ref43.length; _k < _len2; _k++) {
      name = _ref43[_k];
      def_block(name, "<" + name + "(?:\\s.*?)?>", "<\\/" + name + ">", 'keyword');
    }
    copy_rules = function(state, prefix, rules) {
      var next, rule, _l, _len3, _results;
      if (rules == null) {
        rules = tokenizer_rules[state];
      }
      _results = [];
      for (_l = 0, _len3 = rules.length; _l < _len3; _l++) {
        rule = rules[_l];
        next = rule.next ? "" + prefix + "-" + rule.next : void 0;
        def_rule("" + prefix + "-" + state, rule.regex, rule.token, next);
        if (rule.next && !tokenizer_rules[next]) {
          _results.push(copy_rules(rule.next, prefix));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    (function() {
      var state, _l, _len3, _results;
      _results = [];
      for (_l = 0, _len3 = container_states.length; _l < _len3; _l++) {
        state = container_states[_l];
        _results.push(copy_rules('start', state, inline_rules));
      }
      return _results;
    })();
    doku_mode = new Mode();
    doku_mode.$tokenizer = new Tokenizer(tokenizer_rules);
    doku_mode.getNextLineIndent = function(state, line, tab) {
      var _ref44;
      return ((_ref44 = indent_regex.exec(line)) != null ? _ref44[0] : void 0) || '';
    };
    return doku_mode;
  };
});

