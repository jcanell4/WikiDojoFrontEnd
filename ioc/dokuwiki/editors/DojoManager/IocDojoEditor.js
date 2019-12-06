define([
    'ioc/dokuwiki/editors/AbstractIocEditor',
    'dojo/_base/declare',
    // 'dojo/Evented',
    'dijit/Editor',
    'dijit/registry',
    'ioc/dokuwiki/editors/_plugins/IocToolbar',

    'ioc/dokuwiki/editors/_plugins/AbstractIocPlugin',

    'ioc/dokuwiki/editors/DojoManager/plugins/DojoToolbarDropdown',

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
    "dijit/_editor/plugins/EnterKeyHandling",
    "dijit/_editor/html",
    "dijit/_editor/range",
    "dijit/_editor/RichText",
    "dijit/main", // dijit._scopeName
    "dojox/editor/plugins/TablePlugins", // Això cal asegurar que es carrega per poder utilizar els plugins de taules
    // ioc/dokuwiki/editors/DojoManager/plugins/IocDojoTablePlugins"

], function (AbstractIocEditor, declare, Editor,
             registry,
             IocToolbar,
             AbstractIocPlugin, DojoToolbarDropdown,
             array, Deferred, domAttr, domClass, domGeometry, domStyle,
             keys, lang, has, string, topic,
             _Container, Toolbar, ToolbarSeparator, _LayoutWidget, ToggleButton,
             _Plugin, EnterKeyHandling, html, rangeapi, RichText, dijit, TablePlugins) {


    return declare([Editor, AbstractIocEditor], {

            editorType: 'Dojo',

            contentFormat: 'Dojo',

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
                    this.getPlugin('HTMLCode'),
                    this.getPlugin('HTMLStrikethrough'),
                    this.getPlugin('HTMLHeader1'),
                    this.getPlugin('HTMLHeader2'),
                    this.getPlugin('HTMLHeader3'),
                    this.getPlugin('HTMLHeader4'),
                    this.getPlugin('HTMLHeader5'),
                    // this.getPlugin('HTMLHeader6'),
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


                    // plugins Dojo
                    'createLink',
                    'unlink',
                    'insertOrderedList',
                    'insertUnorderedList',


                    // plugins propis
                    // 'InsertHrSyntax', // Desactivada la ratlla, no es troba a la wiki actual
                    // 'InsertMediaSyntax', // TODO: Dividir entre el de figura i el de imatge lateral
                    'InsertSpecialCharacter',


                    // plugins dojox
                    'insertTable',

                    'ToggleTableHeader', //plugin propi
                    'TableAlignLeft', //plugin propi
                    'TableAlignCenter', //plugin propi
                    'TableAlignRight', //plugin propi

                    // 'modifyTable',
                    'insertTableRowBefore',
                    'insertTableRowAfter',
                    'insertTableColumnBefore',
                    'insertTableColumnAfter',
                    'deleteTableRow',
                    'deleteTableColumn',
                    // 'tableContextMenu', // això no funciona bé, s'aplica tant si hi ha como si no hi ha taula

                    // plugin propi taules
                    // 'MergeCells', // desactivat temporalment, no funciona correctament
                    'TableDelete',
                    'InsertSound',


                    // 'NewContent', // Desactivat temporalment

                    'InsertFigureSyntax', // nou


                    'InsertFigureLinkSyntax',
                    // 'InsertTableSyntax',
                    'InsertTableLinkSyntax',
                    'InsertTextSyntax',
                    'InsertTextLargeSyntax',
                    'InsertExampleSyntax',
                    'InsertNoteSyntax',
                    'InsertReferenceSyntax',
                    'InsertImportantSyntax',
                    'InsertQuoteSyntax',
                    'InsertAccountingSyntax',
                    // 'IocSoundFormatButton',
                    'IocComment',
                    'SaveButton',
                    'CancelButton',
                    //'DocumentPreviewButton', // Desactivat, ara no funciona
                    'ViewSource',


                ]);


                if (arguments[0].extraPlugins) {
                    arguments[0].extraPlugins = plugins.concat(arguments[0].extraPlugins);
                } else {
                    arguments[0].extraPlugins = plugins;
                }

                // console.log("arguments?", arguments[1].id);
                // this.createToolbars(arguments[1].id);


                /// TEST Nova toolbar
                //     var $container = jQuery('#topBloc');
                //     $container.append(jQuery('<span id="toolbarXXX"></span>'));
                //
                //
                //
                //     this.toolbars['A'] = new IocToolbar({}, "toolbarXXX");

                // array.forEach(["Cut", "Copy", "Paste"], function(label){
                //     console.log("inici");
                //     var button = new Button({
                //         // note: should always specify a label, for accessibility reasons.
                //         // Just set showLabel=false if you don't want it to be displayed normally
                //         label: label,
                //         showLabel: false,
                //         iconClass: "dijitEditorIcon dijitEditorIcon"+label
                //     });
                //
                //     button.startup();
                //
                //     console.log("Afegit el botó", button);
                //
                //     toolbar.addChild(button);
                //
                //     console.log("Afegit a la barra");
                // });
                //
                // this.new_toolbar.startup();

                /// FI TEST Nova toolbar


                this.TOOLBAR_ID = args.TOOLBAR_ID;


            },

            onLoad: function () {
                this.inherited(arguments);
                this._parsePlugins();
            },


            _addPluginParser: function (plugin) {
                // console.log("IocDojoEditor#_addPluginParser", plugin);
                this._pluginsToParse.push(plugin);
            },

            _parsePlugins: function () {
                // console.log("IocDojoEditor#_parsePlugins", this._pluginsToParse[i]);

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

            generateNodeState: function (node) {

                var $node = jQuery(node);

                // si el node te id ="dijitEditorBody" retorna ''
                if ($node.attr('id') === 'dijitEditorBody') {
                    return '';
                } else {
                    var state = ($node.attr('data-ioc-state') ? $node.attr('data-ioc-state') : $node.prop("tagName")).toLowerCase();
                    var pre = this.generateNodeState($node.parent());

                    if (pre.length > 0) {
                        state = pre + '-' + state;
                    }

                    return state;
                }

            },

            getSelection: function () {
                // Normalment el node seleccionat serà de tipus text, en aquest cas s'enviarà el parent

                var node = this.internalDocument.getSelection().getRangeAt(0).commonAncestorContainer; // aquest node conté tots els nodes de la selecció

                var $node = node.nodeType === 3 ? jQuery(node).parent() : jQuery(node);


                // console.log("jQuery:", $node);

                // console.log("Informació total de la selecció:", this.internalDocument.getSelection());
                // console.log("Informació del rang at 0:", this.internalDocument.getSelection().getRangeAt(0));


                // isCollapsed: true es que només inclou 1 node, false inclou més d'un node? <-- no serveix, es true quan hi han múltiples nodes en 1 sol block
                var startNode = this.internalDocument.getSelection().getRangeAt(0).startContainer;
                var endNode = this.internalDocument.getSelection().getRangeAt(0).endContainer;

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
                    container: node,
                    startNode: startNode,
                    endNode: endNode,
                    nodes: nodes,
                    $node: $node
                }
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

                    this.emit('change', {newValue: this.get('value')});

                }.bind(this);

                this.internalDocument = this.$iframe.get(0).contentDocument || this.$iframe.get(0).contentWindow.document; // ie compatibility

                var updateCursorState = function () {
                    var selection = this.getSelection();
                    var currentState = this.generateNodeState(selection.startNode);

                    this.emit('changeCursor', {state: currentState, $node: selection.$node, node: selection.node});

                }.bind(this);


                if ($editorContainer.length > 0) {
                    $editorContainer.on('input keyup', callback);
                    $editorContainer.on('input keyup click mouseup ', updateCursorState);
                    this.changeDetectorEnabled = true;

                    $editorContainer.on('dragstart drop', function (e) {
                        e.preventDefault();
                        return false;
                    });
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
                //console.log("IocDojoEditor#isChanged", this.get('value').length, this.originalContent.length);

                // if (this.get('value') !== this.originalContent) {
                //     console.log("|" + this.get('value') + "|");
                //     console.log("/////////////////////////////");
                //     console.log("|" + this.originalContent + "|");
                // }

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

                        plugin.setToolbar(this.toolbars[plugin.category])
                    } else {
                        plugin.setToolbar(this.toolbar);
                    }
                }

            },

            // createToolbars: function (id) {
            //     // Proves, divs amagas al document per afegir els botons desplegables.
            //     var categories = ['A', 'B'];
            //
            //     console.log("this id?", id);
            //     for (var i in categories) {
            //         var $wrapper = jQuery('<div style="width:auto;height:auto;background-color:red;position:fixed;top:100px"></div>');
            //         var $toolbar = jQuery('<div></div>');
            //         $toolbar.attr('id', id + '_dropdown_toolbar_'+categories[i]);
            //         // $toolbar.css('display', 'none');
            //         jQuery($wrapper).append($toolbar);
            //         jQuery('body').append($wrapper);
            //         console.log("Afegit element:", id + '_dropdown_toolbar_'+categories[i]);
            //         console.log("Trobat?", jQuery('#' + id + '_dropdown_toolbar_'+categories[i]))
            //
            //     }
            //
            //
            //
            //
            //
            //
            //
            // },

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

                // var $container = jQuery('#topBloc');
                // var $container = jQuery('#test-toolbar');
                // $container.append(jQuery('<span id="'+toolbarId+'"></span>'));


                // var toolbarContainer = registry.byId('test-toolbar');
                // toolbarContainer.set('content', '<span id="'+toolbarId+'"></span>');

                // alert("Això es visible?");

                // var node = jQuery('<span id="'+toolbarId + '"</span>');


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


            setCursorToNodePosition(node) {

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
            }
        }
    )
});
