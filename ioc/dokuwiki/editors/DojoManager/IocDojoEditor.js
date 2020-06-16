define([
    'ioc/dokuwiki/editors/AbstractIocEditor',
    'dojo/_base/declare',
    // 'dojo/Evented',
    'dijit/Editor',
    'dijit/registry',
    'ioc/dokuwiki/editors/_plugins/IocToolbar',

    'ioc/dokuwiki/editors/_plugins/AbstractIocPlugin',

    'ioc/dokuwiki/editors/DojoManager/plugins/DojoToolbarDropdown',
    'ioc/dokuwiki/editors/DojoManager/plugins/CustomLinkDialog',

    // ALERTA[Xavi] Necessari pel addPlugin (només per depurar)
    "dojo/_base/array", // array.forEach
    "dojo/Deferred", // Deferred
    "dojo/dom-attr", // domAttr.set
    "dojo/dom-class", // domClass.add
    "dojo/dom-geometry",
    "dojo/dom-style", // domStyle.set, get
    "dojo/keys", // keys.F1 keys.F15 keys.TAB
    "dojo/_base/lang", // lang.getObject lang.hitch
    "dojo/sniff", // has("ie") has("mac") has("webkit")
    "dojo/string", // string.substitute
    "dojo/topic", // topic.publish()
    "dijit/_Container",
    "dijit/Toolbar",
    "dijit/ToolbarSeparator",
    "dijit/layout/_LayoutWidget",
    "dijit/form/ToggleButton",
    "dijit/_editor/_Plugin",
    // "dijit/_editor/plugins/EnterKeyHandling",
    "dijit/_editor/html",
    "dijit/_editor/range",
    "dijit/_editor/RichText",
    "dijit/main", // dijit._scopeName
    // "dojox/editor/plugins/TablePlugins", // Això cal asegurar que es carrega per poder utilizar els plugins de taules
    "ioc/dokuwiki/editors/DojoManager/plugins/CustomTablePlugins"

], function (AbstractIocEditor, declare, Editor,
             registry,
             IocToolbar,
             AbstractIocPlugin, DojoToolbarDropdown,
             CustomLinkDialog,
             array, Deferred, domAttr, domClass, domGeometry, domStyle,
             keys, lang, has, string, topic,
             _Container, Toolbar, ToolbarSeparator, _LayoutWidget, ToggleButton,
             _Plugin, /*EnterKeyHandling,*/ html, rangeapi, RichText, dijit,
             TablePlugins
) {


    return declare([Editor, AbstractIocEditor], {

            editorType: 'Dojo',

            contentFormat: 'Dojo',

            onKeyDown: function (/* Event */ e) {
                if (e.keyCode === 9) { // Tab
                    console.log("Intercepted, aquí es pot control·lar el tab", e);
                }
                // else {
                //     console.log("tecla detectada:", e.keyCode);
                // }

                this.inherited(arguments);
            },


            // provem a sobreescriure la inserció de llistes ordendanes i desordenades (originalment a RichText.js)
            _insertorderedlistImpl: function (argument) {
                // summary:
                //		This function implements the insertorderedlist command
                // argument:
                //		arguments to the exec command, if any.
                // tags:
                //		protected

                var applied = false;
                if (has("ie")) {
                    applied = this._adaptIEList("insertorderedlist", argument);
                }
                if (!applied) {
                    applied = this.document.execCommand("insertorderedlist", false, argument);

                    this._fixListRootNode();

                }
                return applied;
            },

            _insertunorderedlistImpl: function (argument) {
                // summary:
                //		This function implements the insertunorderedlist command
                // argument:
                //		arguments to the exec command, if any.
                // tags:
                //		protected

                var applied = false;
                if (has("ie")) {
                    applied = this._adaptIEList("insertunorderedlist", argument);
                }
                if (!applied) {
                    applied = this.document.execCommand("insertunorderedlist", false, argument);

                    this._fixListRootNode();

                }
                return applied;
            },

            _fixListRootNode: function () {
                var $node = this.getCurrentNode();

                console.log("Node:", $node);


                // Cerquem el node pare, no funciona el or al selector
                // var $parent = $node.parent('div');

                var $closest = $node.closest('p');

                // console.log("parent:", $parent);
                console.log("closest:", $closest);


                if ($closest.length > 0) {
                    // alert('detectat un parágraf que embolcalla la llista');

                    var $auxNode = $closest.children();
                    $closest.before($auxNode);
                    $closest.remove();


                    this.setCursorToNodePosition($node.get(0));
                }

            },


            constructor: function (args) {
                this.changeDetectorEnabled = false;
                this._pluginsToParse = [];
                this.toolbars = {};

                this.disabled = args.readOnly === true;

                // Basic plugins
                arguments[0].plugins = [
                    this.getPlugin('HTMLBold'),
                    // 'bold'
                    this.getPlugin('HTMLItalic'),
                    this.getPlugin('HTMLUnderline'),
                    this.getPlugin('HTMLMonospace'),
                    this.getPlugin('HTMLCode'),
                    // this.getPlugin('HTMLStrikethrough'), // No utilitzat a la wiki, no implementat als translators
                    //this.getPlugin('ClearFormat'),
                    // this.getPlugin('HTMLHeader0'), // Aquest ja no es necessari, ara les capçaleras són tipus toggle
                    this.getPlugin('HTMLHeader1'),
                    this.getPlugin('HTMLHeader2'),
                    this.getPlugin('HTMLHeader3'),
                    this.getPlugin('HTMLHeader4'),
                    this.getPlugin('HTMLHeader5')
                    // this.getPlugin('HTMLLink'),
                    // this.getPlugin('HTMLLinkExternal'),


                    // 'bold', 'italic','underline', /*'code' this.getPlugin('InsertCodeSyntax'),*/'strikethrough', /* Header x4, Enllaç intern,
                    // Enllaç extern (hi ha plugin de dojo), UL, OL, Linia horitzontal,  Afegir imatge,
                    // emoticones (plugin de dojo?), caracters especials, inserir signatura*/
                ];


                // Extra plugins
                var plugins = this.getPlugins([
                    // 'TestDropdown'

                    // plugins propis
                    'InsertInternalLinkSyntax',
                    'DojoActionAddParagraph',

                    // plugins Dojo
                    // 'createLink',
                    'customCreateLink',
                    'unlink',
                    'insertOrderedList',
                    'insertUnorderedList',
                    'indent',
                    'outdent',


                    // plugins propis
                    // 'InsertHrSyntax', // Desactivada la ratlla, no es troba a la wiki actual
                    'InsertSpecialCharacter',


                    // plugins dojox
                    'insertTable',

                    'ToggleTableHeader', //plugin propi
                    'TableAlignLeft', //plugin propi
                    'TableAlignCenter', //plugin propi
                    'TableAlignRight', //plugin propi

                    // 'modifyTable',
                    'insertTableRowBefore', // no funciona, només afegeix la columna del principi
                    'insertTableRowAfter', // no funciona, només afegeix la columna del principi
                    'insertTableColumnBefore',
                    'insertTableColumnAfter',
                    'deleteTableRow',
                    'deleteTableColumn',
                    // 'tableContextMenu', // això no funciona bé, s'aplica tant si hi ha como si no hi ha taula

                    // plugin propi taules
                    'MergeCells', // desactivat temporalment, no funciona correctament
                    // 'TableDelete', // desactivat, s'ha afegit un action a la caixa
                    'InsertSound',
                    'InsertVideo',
                    'InsertGif',


                    // 'NewContent', // Desactivat temporalment

                    'InsertMediaSyntax', // Correspón a la imatge lateral
                    'InsertFigureSyntax', // nou, correspón a les figures


                    'InsertFigureLinkSyntax',
                    'InsertTableLinkSyntax',
                    'InsertTextSyntax',
                    'InsertTextLargeSyntax',
                    'InsertExampleSyntax',
                    'InsertNoteSyntax',
                    'InsertReferenceSyntax',
                    'InsertImportantSyntax',
                    'InsertQuoteSyntax',

                    'IocComment',
                    'SaveButton',
                    'CancelButton',
                    'DocumentPreviewButton',
                    'ViewSource',
                    'DojoSafePaste',
                    'SwitchEditorButton',

                    'NewContent',


                ]);


                if (arguments[0].extraPlugins) {
                    arguments[0].extraPlugins = plugins.concat(arguments[0].extraPlugins);
                } else {
                    arguments[0].extraPlugins = plugins;
                }


                this.TOOLBAR_ID = args.TOOLBAR_ID;


            },

            onLoad: function () {
                this.inherited(arguments);
                this._parsePlugins();
            },

            // @private
            _addPluginParser: function (plugin) {
                // console.log("IocDojoEditor#_addPluginParser", plugin);
                this._pluginsToParse.push(plugin);
            },

            // Aquest és el mètode públic que ha de cridar-se si es necessari fer un re-parse (per exemple en enganxar html)
            reparse: function () {
                this._parsePlugins();
            },

            // @private
            _parsePlugins: function () {
                // console.error("IocDojoEditor#_parsePlugins", this._pluginsToParse);

                for (var i = 0; i < this._pluginsToParse.length; i++) {
                    this._pluginsToParse[i].parse();
                }
            },

            onDisplayChanged: function () {
                // console.log("IocDojoEditor#onDisplayChanged");
                this.inherited(arguments);

                if (!this.changeDetectorEnabled) {
                    this._enableChangeDetector();
                }
            },

            getCurrentNodeState: function () {
                var selection = this.getSelection();
                var currentState = this.generateNodeState(selection.startNode);

                return currentState;
            },

            getCurrentNode: function () {
                var selection = this.getSelection();
                return jQuery(selection.startNode)
            },

            getPreviousNode: function () {
                var selection = this.getSelection();
                // console.log(jQuery(selection.startNode).prev());
                return jQuery(selection.startNode).prev();
            },


            generateNodeState: function (node) {

                // console.error("Node?", node);

                if (!node) {
                    return 'state unknown'
                }


                var $node = jQuery(node);


                // si el node te id ="dijitEditorBody" retorna ''
                if ($node.attr('id') === 'dijitEditorBody' || $node.prop("tagName").toLowerCase() === 'body') {
                    return '';
                } else {
                    var state = ($node.attr('data-ioc-state') ? $node.attr('data-ioc-state') : $node.prop("tagName")).toLowerCase();

                    // ALERTA! si el nombre de classes especial creix més caldria implementar-ho com un array
                    if ($node.attr('class') === 'iocinfo' || $node.attr('data-dw-field')) {
                        state = state + "-iocinfo";
                    }
                    if ($node.attr('class') === 'editable-text') {
                        state = state + "-editable-text";
                    }

                    var pre = this.generateNodeState($node.parent());

                    if (pre.length > 0) {
                        state = pre + '-' + state;
                    }

                    // console.log("current state", state);

                    return state;
                }

            },

            getSelection: function () {
                // Normalment el node seleccionat serà de tipus text, en aquest cas s'enviarà el parent

                var internalDocument = this.$iframe.get(0).contentDocument || this.$iframe.get(0).contentWindow.document;

                var nodeSelected = internalDocument.getSelection().rangeCount > 0;

                if (!nodeSelected) {
                    return {
                        container: null,
                        startNode: null,
                        endNode: null,
                        nodes: [],
                        $node: jQuery('')
                    }
                }


                try {
                    var documentSelection = internalDocument.getSelection();
                    var node = documentSelection.getRangeAt(0).commonAncestorContainer; // aquest node conté tots els nodes de la selecció
                    var $node = node && node.nodeType === 3 ? jQuery(node).parent() : jQuery(node);

                } catch (e) {
                    // Es tracta d'un node protegit, no es pot seleccionar
                    return {
                        container: null,
                        startNode: null,
                        endNode: null,
                        nodes: [],
                        $node: jQuery('')
                    }
                }


                // isCollapsed: true es que només inclou 1 node, false inclou més d'un node? <-- no serveix, es true quan hi han múltiples nodes en 1 sol block
                var startNode = documentSelection.getRangeAt(0).startContainer;
                var endNode = documentSelection.getRangeAt(0).endContainer;

                startNode = startNode.nodeType === 3 ? startNode.parentElement : startNode;
                endNode = endNode.nodeType === 3 ? endNode.parentElement : endNode;


                var nodes = [];

                if (startNode === endNode) {
                    // jQuery(startNode).css('background-color','red'); // Utilitzat per comprovar que els blocks seleccionats son aquests (no s'elimina en deseleccionar)
                    nodes.push(startNode);
                } else {

                    var started = false;

                    $node.children().each(function () {

                        if (jQuery.contains(this, startNode) || this === startNode) {
                            started = true;
                        }

                        if (!started) {
                            return true;
                        }

                        nodes.push(this);


                        // jQuery(this).css('background-color','red'); // Utilitzat per comprovar que els blocks seleccionats son aquests (no s'elimina en deseleccionar)

                        var ended = jQuery.contains(this, endNode) || this === endNode;

                        return !ended;

                    });
                }

                return {
                    documentSelection: documentSelection,
                    container: node,
                    startNode: startNode,
                    endNode: endNode,
                    nodes: nodes,
                    $node: $node
                };
            },

            forceChange: function () {
                this.emit('change', {newValue: this.get('value')});
            },


            forceUpdateCursor: function () {
                var selection = this.getSelection();
                var currentState = this.generateNodeState(selection.startNode);

                this.emit('changeCursor', {state: currentState, $node: selection.$node, node: selection.node});
            },

            _enableChangeDetector: function () {
                this.$iframe = jQuery("iframe#" + this.domNode.id + "_iframe");

                var $editorContainer = this.$iframe.contents().find('#dijitEditorBody');
                var callback = function () {
                    // ALERTA! Si això funciona afegir també un callback pel click aquí
                    // s'ha d'aprofitar per fer un update de la posició del cursor, actualitzar el tipus de bloc i fer un update dels plugins per canviar l'estat dels botons

                    // console.log("Cridat el callback de ChangeDectector, llençan l'event 'changed'");

                    this.emit('change', {newValue: this.get('value')});

                }.bind(this);

                this.internalDocument = this.$iframe.get(0).contentDocument || this.$iframe.get(0).contentWindow.document; // ie compatibility

                var updateCursorState = function () {
                    var selection = this.getSelection();
                    var currentState = this.generateNodeState(selection.startNode);

                    this.emit('changeCursor', {state: currentState, $node: selection.$node, node: selection.node});

                }.bind(this);


                var context = this;

                if ($editorContainer.length > 0) {
                    $editorContainer.on('input keyup', callback);
                    $editorContainer.on('input keyup click mouseup ', updateCursorState);
                    this.changeDetectorEnabled = true;

                    $editorContainer.on('dragstart drop', function (e) {
                        e.preventDefault();
                        return false;
                    });


                    // Es bloqueja el parse, s'ha de fer servir plugins que interceptin aquest esdeveniment i el processin
                    $editorContainer.on('paste', function (e) {
                        console.log(e);

                        var pastedData = e.originalEvent.clipboardData.getData('text');
                        console.log('Text: ', pastedData);

                        console.log('Html: ', e.originalEvent.clipboardData.getData('text/html'));

                        context.emit('safePaste', e);

                        e.preventDefault();
                        return true;
                    });
                    //
                    // $editorContainer.on('delete', function (e) {
                    //    alert("delete");
                    // });

                }


            },

            resetOriginalContentState: function () {
                // console.log("IocDojoEditor#resetOriginalContentState");
                this.originalContent = this.get('value');

            },

            getOriginalValue: function () {
                return this.originalContent;
            },


            isChanged: function () {
                // console.log("IocDojoEditor#isChanged", this.get('value').length, this.originalContent.length);

                // console.error("Trace");

                // TESTS: eliminicació manual de tags <-- Si es fa això desprès no funciona el cancel, perquè el que es guarda como a "ResetOriginalContentState" sí que conté els BR originals, ids, etc.
                // var processedValue = this.get('value').trim();
                //
                // //processedValue = processedValue.replace(/ id=".*?"/gi, '');
                // processedValue = processedValue.replace(/<br \/>/gi, '<br>');
                // processedValue = processedValue.replace(/<tbody.*?>/gi, '');
                // processedValue = processedValue.replace(/<\/tbody>/gi, '');

                // console.log("value:", processedValue);
                // console.log("original:", this.originalContent.trim());
                // console.log("Són iguals?", this.get('value').trim() === this.originalContent.trim());

                return this.get('value').trim() !== this.originalContent.trim();
            },

            /**
             * Injecta l'editor i afegeix el parse del plugin si es necessari.
             *
             * ALERTA[Xavi] Aquest mètode es practicament idèntic a l'original de dijit.Editor, però si es crida am inherited
             * es modifica plugin i ja no es pot injectar l'editor ni afegir el parse.
             *
             * @override
             */
            addPlugin: function (/*String||Object||Function*/ plugin, /*Integer?*/ index) {

                // ALERTA[Xavi] Codi propi afegit
                if (plugin.plugin) {
                    var config = plugin.config;
                    plugin = plugin.plugin;
                }

                // summary:
                //		takes a plugin name as a string or a plugin instance and
                //		adds it to the toolbar and associates it with this editor
                //		instance. The resulting plugin is added to the Editor's
                //		plugins array. If index is passed, it's placed in the plugins
                //		array at that index. No big magic, but a nice helper for
                //		passing in plugin names via markup.
                // plugin:
                //		String, args object, plugin instance, or plugin constructor
                // args:
                //		This object will be passed to the plugin constructor
                // index:
                //		Used when creating an instance from
                //		something already in this.plugins. Ensures that the new
                //		instance is assigned to this.plugins at that index.
                var args = lang.isString(plugin) ? {name: plugin} : lang.isFunction(plugin) ? {ctor: plugin} : plugin;

                if (!args.setEditor) {
                    var o = {"args": args, "plugin": null, "editor": this};
                    if (args.name) {
                        // search registry for a plugin factory matching args.name, if it's not there then
                        // fallback to 1.0 API:
                        // ask all loaded plugin modules to fill in o.plugin if they can (ie, if they implement args.name)
                        // remove fallback for 2.0.
                        if (_Plugin.registry[args.name]) {
                            o.plugin = _Plugin.registry[args.name](args);
                        } else {
                            topic.publish(dijit._scopeName + ".Editor.getPlugin", o);	// publish
                        }
                    }
                    if (!o.plugin) {

                        try {
                            // TODO: remove lang.getObject() call in 2.0
                            var pc = args.ctor || lang.getObject(args.name) || require(args.name);
                            if (pc) {
                                o.plugin = new pc(args);
                            }

                        } catch (e) {
                            throw new Error(this.id + ": cannot find plugin [" + args.name + "]");
                        }
                    }
                    if (!o.plugin) {
                        throw new Error(this.id + ": cannot find plugin [" + args.name + "]");
                    }
                    plugin = o.plugin;
                    // console.log("S'ha trobat el plugin?", plugin);
                }
                if (arguments.length > 1) {
                    this._plugins[index] = plugin;
                } else {
                    this._plugins.push(plugin);
                }

                // ALERTA[Xavi] Codi afegit pels plugins de l'IOC


                plugin.setEditor(this);

                if (plugin.init) {
                    // console.log("Config:", config);
                    // console.log("Plugin:", plugin);
                    plugin.init(config);
                }

                // ALERTA[Xavi] Codi afegit pels plugins de l'IOC

                // console.log("Aqui s'estableix la toolbar a la que s'afegeix el plugin!");
                // alert("Alerta! aqui s'estableix la toolbar a la que s'afegeix el plugin!");
                if (lang.isFunction(plugin.setToolbar)) {
                    // plugin.setToolbar(this.toolbar);
                    if (plugin.category) {
                        if (!this.toolbars[plugin.category]) {
                            this.createToolbar(plugin.category);
                        }
                        plugin.setToolbar(this.toolbars[plugin.category]);
                    } else {
                        plugin.setToolbar(this.toolbar);
                    }
                }

            },

            createToolbar: function (category) {
                // TODO: Crear el node on s'afegirà la toolbar
                // TODO: Crear el botó que desplegarà la toolbar flotant i afegirlo a this.toolbar (la barra principal)
                // TODO: AFegir a la localització la cadena de text corresponent a la categoría, que servirà com a title del botó desplegable

                // var toolbarId = this.id + '_' + category;
                var toolbarId = this.id + '_dropdown_toolbar_' + category;
                //console.log("Creada toolbar:", category, toolbarId);


                var $toolbar = jQuery('<div></div>');
                $toolbar.attr('id', toolbarId);
                // $toolbar.css('display', 'none');
                jQuery('body').append($toolbar);


                this.toolbars[category] = new IocToolbar({}, toolbarId);

                // console.log(toolbarContainer.domNode);

                // this.toolbars[category] = new IocToolbar( {id: toolbarId}, toolbarContainer.domNode);
                // alert("Aqui no");
                this.toolbars[category].startup();
                // alert("Aqui si?");


                // Config dels botons desplegables:
                var config = {
                    toolbarContainerId: toolbarId,
                    icon: 'IocBack', // Temporal
                    title: category
                };

                var plugin = new DojoToolbarDropdown();

                plugin.setEditor(this);
                plugin.init(config);
                plugin.setToolbar(this.toolbar);
            },

            /**
             * Afegeix el parse dels plugins en executar una ordre.
             *
             * @override
             */
            execCommand: function (cmd) {
                // summary:
                //		Main handler for executing any commands to the editor, like paste, bold, etc.
                //		Called by plugins, but not meant to be called by end users.
                // tags:
                //		protected
                if (this.customUndo && (cmd == 'undo' || cmd == 'redo')) {
                    var r = this[cmd]();
                    this._parsePlugins();
                    return r;
                } else {
                    var r = this.inherited(arguments);
                    if (this.customUndo) {
                        this._endEditing();
                    }
                    return r;
                }
            },

            startup: function () {
                this.inherited(arguments); // a la superclasse es crea la toolbar

                if (this.disabled) {
                    jQuery(this.toolbar.domNode).css('display', 'none');
                    this.resize();
                }

            },


            setCursorToNodePosition: function (node) {

                if (!node || node.length === 0) {
                    return;
                }

                var backup = window.getSelection;
                window.getSelection = document.getSelection;

                var sel = dijit.range.getSelection(this.internalDocument);
                this.focus();
                // var el = node;

                var range = document.createRange();

                range.setStart(node, 0);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);

                // Restaurem la funció
                window.getSelection = backup;

                this.forceUpdateCursor();
            },

            _stripTrailingEmptyNodes: function (node) {

                // buit, això és el que fa que es perdin totes les etiquetes buides a l'editor en teoría, es conserva
                // al HTML però no es mostren a l'editor
                return node;
            }
        }
    );
});
