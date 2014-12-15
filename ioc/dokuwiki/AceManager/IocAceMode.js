define([
    "dojo/Stateful",
    "dojo/_base/declare",
    "dojo/_base/lang",

], function (Stateful, declare, lang) {
    return declare([Stateful],
        /**
         * Aquesta classe actua com a factoría de modes que poden ser aplicats a un editor Ace. El mode pot ser
         * configurat a través del constructor, i/o fent servir els setters proporcionats per afegir més ressaltadors,
         * regles, o jocs de regles.
         *
         * @class IocAceMode
         * @extends dojo.Stateful
         * @author Xavier García<xaviergaro.dev@gmail.com>
         */
        {
            /**
             * Aquest mode pot ser substituir si es passa un altre com argument al constructor.
             * @type {ace.Mode}
             * @private
             * @constructor
             */
            Mode: ace.require("ace/mode/text").Mode,

            /**
             * @type {ace.Tokenizer}
             * @private
             * @constructor
             */
            Tokenizer: ace.require("ace/tokenizer").Tokenizer,

            /**
             * Ressaltadors afegits a través del constructor.
             * @type {Object.<string, {Highlighter}>}
             * @private
             */
            baseHighlighters: {},

            /**
             * RuleSet afegits a través del constructor o dinàmicament.
             * @type {{RuleSet}[]}
             * @private
             */
            ruleSets: [],

            /**
             * Array d'etiquetes xml per ressaltar afegides a través del constructor o dinàmicament.
             * @type {string[]}
             * @private
             */
            xmlTags: [],

            /**
             * Regles estàtiques que seran afegides al mode.
             * @type {string[][]}
             * @private
             */
            _extraRules: [],

            /**
             * Expressió regular per controlar la indentació.
             * @type {RegExp}
             * @private
             */
            _indentRegex: /^(?:(?:\x20{2,}|\t+)[\*\-][\x20\t]*|(?:\x20{2}|\t)(?=.)|>+[\x20\t]*)/,

            /**
             * Ressaltadors afegits dinàmicament o a través de RuleSet.
             * @type {Object.<string, {Highlighter}>}
             * @private
             */
            _extraHighlighters: {},

            /**
             * Array que emmagatzema les regles processades. Es equivalent al resultat de fer Highlighter.getRules().
             * @private
             */
            _tokenizerRules: {},

            /**
             * Array que conté les regles que han d'afegir-se als contenidors.
             * @private
             */
            _inlineRules: [],

            /**
             * Array amb els states que referencíen als contenidors.
             * @type {string[]}
             * @private
             */
            _containerStates: [],

            /**
             * Enregistra si han haguts canvis des de la ultima vegada que s'ha obtingut el mode.
             * @type {boolean}
             * @private
             */
            _changed: true,

            /**
             * Indica si s'està processant el mode o no
             * @type {boolean}
             * @private
             */
            _processing: false,

            /**
             * L'ultim mode generat.
             * @type {Mode}
             * @private
             */
            _generatedMode: null,

            /**
             * Array que conté la informació necessaria per incrustar els ressaltadors durant la generació del mode.
             * @private
             */
            _embededHighlighters: [],

            /**
             * El ressaltador al que s'incrusten els altres resaltadors i s'afegeixen les regles.
             *
             * @type {Mode.HighlightRules}
             */
            _highlighter: null,

            /**
             * Admet un objecte amb els paràmetres de configuració següents:
             *  - baseHighlighters amb un objecte de tipus {llenguatge : ressaltador}
             *  - xmlTags amb un array d'etiquetes xml
             *  - ruleSets amb un array de jocs de regles (objectes hereus de AbstractRuleSet)
             *  - Mode amb un objecte de tipus ace.Mode.
             *
             * En els casos de baseHiglighters, xmlTags i Mode son substituits directament els valors per defecte, en
             * el cas dels ruleSets es processan perquè si no no es registren.
             *
             * @param {object?} args paràmetres de configuració
             */
            constructor: function (args) {
                // Incialitzem els valors, si no es fa es dupliquen els valors de instancies anteriors
                this._extraRules= [];
                this._embededHighlighters= [];
                this._containerStates= [];
                //this._inlineRules= []; // TODO: Aquest no fa falta inicialitzarlo
                //this._tokenizerRules = {}; // TODO: Aquest no fa falta inicialitzarlo

                if (args) {
                    this.addRuleSets(args.ruleSets);
                }
            },

            /**
             * Defineix una regla a partir dels paràmetres passats com argument.
             *
             * @param {string} state - state al que s'aplica aquesta regle
             * @param {string} regex - expresió regular que l'activa
             * @param {string|string[]|function} token - estil a aplicar a la coincidència
             * @param {string?} next - state al que passa l'editor al trobar la coincidència
             * @protected
             */
            defRule: function (state, regex, token, next) {
                this._checkProcessing();

                if (!this._tokenizerRules[state]) {
                    this._tokenizerRules[state] = [];
                }

                this._tokenizerRules[state].push({
                    regex: regex,
                    token: token,
                    next:  next,
                    merge: true
                });

                this.change = true;
            },

            /**
             * Defineix una regla que s'aplicará al state 'start'.
             *
             * @param {string} regex - Expresió regular que l'activa
             * @param {string|string[]|function} token - Estil a aplicar a la coincidència
             * @param {string?} next - State al que passa l'editor al trobar la coincidència
             * @protected
             */
            defBase: function (regex, token, next) {
                this._checkProcessing();
                this.defRule('start', regex, token, next);
            },

            /**
             * Defineix una regla com a base i l'afegeix al array de regles que s'afegiran als contenidors.
             *
             * @param {string} regex - Expresió regular que l'activa
             * @param {string|string[]|function} token - Estil a aplicar a la coincidència
             * @param {string?} next - State al que passa l'editor al trobar la coincidència
             * @protected
             */
            defInline: function (regex, token, next) {
                this._checkProcessing();
                this.defBase(regex, token, next);

                var startRules = this._tokenizerRules['start'],
                    lastRule = startRules.length - 1,
                    lastStartRule = startRules[lastRule];

                if (!lastStartRule.next) {
                    lastStartRule.next = '';
                }
                this._inlineRules.push(lastStartRule);
            },

            /***
             * Defineix un conjunt de reglats format per:
             *  - Una regla base d'apertura del state corresponent a name quan es troba la coincidència openRegex.
             *  - Una regla de tancament quan ens trobem al state corresponent a name i es troba la coincidència
             *    closeRegex.
             *  - Una tercera regla opcional si s'ha passat un contentToken que s'aplica a tots els caràcters
             *    mentre estem al state corresponent al name(per exemple els comentaris).
             *
             * El tagToken es opcional i si no s'afegeix es fa servir el valor 'keyword.operator'
             *
             * @param {string} name - Corresponent al next de la regla d'apertura i el state de la regla de tancada
             * @param {string} openRegex - Expresió regular a fer servir per l'apertura
             * @param {string} closeRegex - Expresió regular a fer servir pel tancament
             * @param {(string|string[]|function)?} tagToken - Estil a aplicar a la coincidència
             * @param {(string|string[]|function)?} contentToken - Si es passa aquest agument s'aplicarà aquest estil
             * a tot el text entre la etiqueta d'apertura i la de tancada.
             * @protected
             */
            defFormat: function (name, openRegex, closeRegex, tagToken, contentToken) {
                this._checkProcessing();

                if (tagToken == null) {
                    tagToken = 'keyword.operator';
                }

                this.defInline(openRegex, tagToken, name);
                this.defRule(name, closeRegex, tagToken, 'start');
                //this.defInline(closeRegex, tagToken, 'start');

                if (contentToken) {
                    this.defRule(name, ".", contentToken);
                }
            },

            /**
             * Defineix un parell de regles d'apertura i de tancament per iniciar un state amb el nom passat com
             * argument.
             *
             * @param {string} name - Nom del state al que es passarà al trobar la coincidencia de apertura
             * @param {string} openRegex - Expresió regular a fer servir per l'apertura
             * @param {string} closeRegex - Expresió regular a fer servir pel tancament
             * @param {(string|string[]|function)?} token - Estil a aplicar a la coincidència
             * @protected
             */
            defBlock: function (name, openRegex, closeRegex, token) {
                this._checkProcessing();
                this.defInline(openRegex, token, name);
                //this.defInline(closeRegex, token, 'start');
                this.defRule(name, closeRegex, token, 'start');
            },

            /**
             * Defineix una regla base com a nom del próxim state igual al name del contenidor afegint '-start', i
             * l'afegeix al array de contenidors.
             *
             * @param name - Nom del contenidor
             * @param {string} regex - Expresió regular que l'activa
             * @param {string|string[]|function} token - Estil a aplicar a la coincidència
             * @protected
             */
            defContainer: function (name, regex, token) {
                this._checkProcessing();
                this.defBase(regex, token, "" + name + "-start");
                this._containerStates.push(name);
            },

            /**
             * Incrusta el ressaltador corresponent al language afegint les regles d'apertura i tancament necessaries.
             *
             * @param name - Nom del contenidor
             * @param {string} openRegex - Expresió regular d'apertura
             * @param {string} closeRegex - Expresió regular de tancament
             * @param {string|string[]|function} token - Estil a aplicar a la coincidència
             * @param {string} language - Nom del llenguatge al que correspon el ressaltador a incrustar
             * @protected
             */
            defEmbed: function (name, openRegex, closeRegex, token, language) {
                // Afegim el ressaltador al state start
                var rules = {
                    highlighter: this.getHighlighters()[language],
                    prefix:      name,
                    closeRules:  [{
                        token: token,
                        regex: closeRegex,
                        next:  'start'
                    }]
                };
                this._checkProcessing();
                this.defBase(openRegex, token, name + "-start");
                this.defInline("(?=" + openRegex + ")", token, name);

                this._embededHighlighters.push(rules);

                // Incrustem els ressaltadors als contenidors
                for (var i = 0, len = this._containerStates.length; i < len; i++) {
                    var container = this._containerStates[i];

                    rules = {
                        highlighter: this.getHighlighters()[language],
                        prefix: container + '-' + name,
                        closeRules:  [{
                            token: token,
                            regex: closeRegex,
                            next: container + '-start'
                        }]
                    };
                    this._embededHighlighters.push(rules);
                }
            },

            /**
             * Recorre totes les regles de resaltat enregistrades en aquest mode i les incrusta al resaltador base.
             *
             * @private
             */
            _embedHighlighter: function () {
                // Recorre els embed_rules i els afegeix
                var rules;

                for (var i = 0, len = this._embededHighlighters.length; i < len; i++) {
                    rules = this._embededHighlighters[i];
                    this._highlighter.embedRules(rules.highlighter, rules.prefix + "-", rules.closeRules);
                }
            },

            /**
             * Retorna la llista completa de ressaltadors afegits a aquest mode.
             * @returns {Object.<string, {Highlighter}>}
             */
            getHighlighters: function () {
                return lang.mixin(this.baseHighlighters, this._extraHighlighters);
            },

            /**
             * Retorna el mode per poder activar-lo al editor. Si no hi han hagut canvis des de l'últim cop que s'ha
             * generat retorna el mateix mode, en cas contrari el genera i retorna el nou mode.
             *
             * @returns {Mode} - Mode
             */
            getMode: function () {
                if (this._changed) {
                    this._generatedMode = this._generateMode();
                }
                return this._generatedMode;
            },

            /**
             * Genera el mode a partir dels ressaltadors incrustats i les regles afegides.
             *
             * @private
             * @returns {Mode} - mode processat
             */
            _generateMode: function () {
                var
                    doku_mode = new this.Mode(),
                    self = this,
                    total = inici = new Date().getTime();

                this._highlighter = new doku_mode.HighlightRules();


                this._processing = true;

                this._init();

                this._highlighter.addRules(this._tokenizerRules, "");
                this._embedHighlighter(); // Passem el highlighter al que s'incrustaran les regles
                this._processContainers();

                doku_mode.$tokenizer = new this.Tokenizer(this._highlighter.getRules());

                doku_mode.getNextLineIndent = function (state, line, tab) {
                    var aux;
                    return ((aux = self._indentRegex.exec(line)) != null ? aux[0] : void 0) || '';
                };

                this._changed = false;
                this._processing = false;
                return doku_mode;
            },


            /**
             * Descarta les regles anteriores i reprocessa totes les regles i resaltadors afegits al mode.
             * @private
             */
            _init: function () {

                // Reiniciem els valors per generar el nou mode
                this._tokenizerRules = {};
                this._inlineRules = [];



                // Processem primer les regles estàtiques
                this._processExtraRules();

                // Recorrem tots els sets de regles i les processem
                for (var i = 0, len = this.ruleSets.length; i < len; i++) {
                    this.ruleSets[i].process();
                }

                // Processar spec.xmltags
                if (this.xmlTags) {
                    this._processXmlTags();
                }

                // Processar la resta
                this._processCode();
                this._processFiles();
            },

            /**
             * Processa les regles estàtiques afegides al mode.
             *
             * @private
             */
            _processExtraRules: function () {
                var func, args;
                for (var i = 0, len = this._extraRules.length; i < len; i++) {
                    func = this._extraRules[i][0];
                    args = this._extraRules[i][1];
                    func.apply(this, args);
                }
            },

            /**
             * Processa tots els ressaltadors per poder acvitar-los afegint la etiqueta <code nom_ressaltador> i
             * tancar-los amb </code>
             *
             * @private
             */
            _processCode: function () {
                var full_lang_rules = this.getHighlighters(),
                    lang_rules_keys = _.keys(full_lang_rules),
                    language;

                for (var i = 0, len = lang_rules_keys.length; i < len; i++) {
                    language = lang_rules_keys[i];
                    this.defEmbed("code-" + language, "<code " + language + ">", '</code>', 'keyword', language);
                }

                this.defBlock('code', '<code.*?>', '</code>', 'keyword');
            },

            /**
             * Processa tots els ressaltadors per poder activar-los afegint la etiqueta <file nom_ressaltador (?:codi?)>
             * i la etiqueta </file> per tancar el bloc.
             *
             * @private
             */
            _processFiles: function () {
                var full_lang_rules = this.getHighlighters(),
                    lang_rules_keys = _.keys(full_lang_rules),
                    language;

                for (var i = 0, len = lang_rules_keys.length; i < len; i++) {
                    language = lang_rules_keys[i];
                    this.defEmbed("file-" + language, "<file " + language + "(?: .*?)?>", '</file>', 'keyword', language);
                }
                this.defBlock('file', '<file.*?>', '</file>', 'keyword');
            },


            /**
             * Defineix un block per a cada etiqueta xml afegida al mode.
             *
             * @private
             * */
            _processXmlTags: function () {
                var xmlTags = this.xmlTags,
                    tag;

                for (var i = 0, len = xmlTags.length; i < len; i++) {
                    tag = xmlTags[i];
                    this.defBlock(tag, "<" + tag + "(?:\\s.*?)?>", "<\\/" + tag + ">", 'keyword');
                }
            },

            /**
             * Afegeix un joc de regles que serà processat al generar el mode.
             *
             * @param {AbstractRuleSet} ruleSet - Joc de regles a afegir
             */
            addRuleSet: function (ruleSet) {
                ruleSet.register(this);
                this.ruleSets.push(ruleSet);
                this._changed = true;
            },

            /**
             * Afegeix un array de jocs de regles que seran processats al generar el mode.
             *
             * @param {AbstractRuleSet[]} ruleSets - Array de jocs de reglas a afegir
             */
            addRuleSets: function (ruleSets) {
                if (ruleSets) {
                    for (var i = 0, len = ruleSets.length; i < len; i++) {
                        this.addRuleSet(ruleSets[i]);
                    }
                }
            },

            /**
             * Afegeix els llenguatges passats com argument la la llista de llenguatges del mode.
             *
             * @param {Object.<string, {Highlighter}>} highlighters - Array associatiu que ha de contenir les regles
             * del ressaltador a afegir
             */
            addHighlighters: function (highlighters) {
                if (highlighters) {
                    lang.mixin(this._extraHighlighters, highlighters);
                    this._changed = true;
                }
            },

            /**
             *
             * @param {string[]} xmlTags - Array de cadenas de text amb el nom d'elements XML que seran convertits en
             * etiquetes d'apertura i tancament ressaltades.
             */
            addXmlTags: function (xmlTags) {
                this.xmlTags = this.xmlTags.concat(xmlTags);
                this._changed = true;
            },

            /**
             * Afegeix una regla adicional que serà aplicada al mode. Els tipus de regla suportats son:
             *      - base
             *      - rule
             *      - container
             *      - block
             *      - inline
             *      - embed
             *      - format
             *
             * @param {string} type - Tipus de regla
             * @param {string[]} args - Arguments que es passaran per configurar la regla
             */
            addExtraRule: function (type, args) {
                var aux = [], func;

                switch (type) {
                    case "base":
                        func = this.defBase;
                        break;

                    case "rule":
                        func = this.defRule;
                        break;

                    case "container":
                        func = this.defContainer;
                        break;

                    case "block":
                        func = this.defBlock;
                        break;

                    case "inline":
                        func = this.defInline;
                        break;

                    case "embed":
                        func = this.defEmbed;
                        break;

                    case "format":
                        func = this.defFormat;
                        break;

                    default:
                        throw new Error("No existeix el tipus de regla: " + type);
                }

                aux.push(func);
                aux.push(args);
                this._extraRules.push(aux);
                this._changed = true;
            },

            /**
             * Afegeix una serie de regles adicionals que seran aplicades al mode. Es passara com un array bidimensional
             * en el que el index 0 de cada fila correspondrà al tipus i el index 1 sera un array amb la llista de
             * arguments.
             *
             * @param {string[]} extraRules - Array bidimensional amb una llista de regles
             */
            addExtraRules: function (extraRules) {
                var func, args;
                for (var i = 0, len = extraRules.length; i < len; i++) {
                    func = extraRules[i][0];
                    args = extraRules[i][1];
                    this.addExtraRule(func, args);
                }
            },

            /**
             * Comprova si estem generant el mode o no, si no s'està processant es llença un error.
             *
             * @private
             */
            _checkProcessing: function () {
                if (!this._processing) {
                    throw new Error("Els métodes def_xxx només es poden fer servir durant la generació del mode.");
                }
            },

            /**
             * Processa els contenidors afegint les regles definides com inline per poder ser processades dins d'aquests.
             *
             * @private
             */
            _processContainers: function () {
                for (var i = 0, len = this._containerStates.length; i < len; i++) {
                    this._copyRules('start', this._containerStates[i], this._inlineRules);
                }
            },

            /**
             * Copia les regles definides com inline recursivament per afegir el prefix dels contenidors.
             * Els modes incrustats s'afegeixen fent servir els mètodes de incrustació i no pas aquest.
             *
             * @param {string} state - Nom del state que volem copiar
             * @param {string} prefix - Prefix que s'afegirà al nom del state i al next
             * @param {Object?} rules - Regles que es copiaran al contenidor, si no es passa cap es cercaran les regles
             * afegides anteriorment per aquest state.
             *
             * @private
             */
            _copyRules: function (state, prefix, rules) {
                var rule, newNext, newRule, newRules, oldRules, processedRules;

                processedRules = this._highlighter.getRules();

                if (!rules) {
                    rules = processedRules[state];
                }

                if (rules) {
                    newRules = {};
                    newRules[state] = lang.clone(processedRules[state]);

                    for (var i = 0, len = rules.length; i < len; i++) {
                        rule = rules[i];
                        newRule = {};

                        if (rule.next) {
                            newNext = "" + prefix + "-" + rule.next;
                        }

                        newRule = {
                            'regex': rule.regex,
                            'token': rule.token,
                            'next':  newNext
                        };

                        if (newRules[state]) {
                            newRules[state].push(newRule);
                        } else {
                            newRules[state] = [newRule];
                        }

                        oldRules = processedRules[prefix + "-" + state];

                        if (rule.next && !processedRules[newNext]) {
                            this._copyRules(rule.next, prefix);
                        }
                    }

                    this._highlighter.addRules(newRules, prefix + "-");

                    if (oldRules) {
                        this._highlighter.$rules[prefix + "-" + state] = this._highlighter.$rules[prefix + "-" + state].concat(oldRules);
                    }

                } else {
                    // Aquest cas només ha de ocorre si es tracta de modes incrustats que son processat a altres mètods.
                    // console.log("incrustat: " + state);
                }
            }
        });
});