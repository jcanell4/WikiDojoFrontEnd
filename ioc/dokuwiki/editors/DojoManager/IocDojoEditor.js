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

], function (AbstractIocEditor, declare, Editor,
             registry,
             IocToolbar,
             AbstractIocPlugin, DojoToolbarDropdown,
             array, Deferred, domAttr, domClass, domGeometry, domStyle,
             keys, lang, has, string, topic,
             _Container, Toolbar, ToolbarSeparator, _LayoutWidget, ToggleButton,
             _Plugin, EnterKeyHandling, html, rangeapi, RichText, dijit) {


    return declare([Editor, AbstractIocEditor], {

        editorType: 'Dojo',

        contentFormat: 'Dojo',

        constructor: function (args) {
            this.changeDetectorEnabled = false;
            this._pluginsToParse = [];
            this.toolbars = {};

            // Basic plugins
            arguments[0].plugins = [
                this.getPlugin('HTMLBold'),
                // 'bold'
                this.getPlugin('HTMLItalic'),
                this.getPlugin('HTMLUnderline'),
                this.getPlugin('HTMLStrikethrough'),
                this.getPlugin('HTMLSuperscript'),
                this.getPlugin('HTMLSubscript'),
                this.getPlugin('HTMLCode'),
                this.getPlugin('HTMLCodeBlock'),
                this.getPlugin('HTMLHR'),
                this.getPlugin('HTMLHeader1'),
                this.getPlugin('HTMLHeader2'),
                this.getPlugin('HTMLHeader3'),
                this.getPlugin('HTMLHeader4'),
                this.getPlugin('HTMLHeader5'),
                this.getPlugin('HTMLHeader6'),
                this.getPlugin('HTMLOrderedList'),
                this.getPlugin('HTMLUnorderedList'),
                this.getPlugin('HTMLIndent'),
                this.getPlugin('HTMLOutdent'),

                this.getPlugin('HTMLLink'),
                this.getPlugin('HTMLLinkExternal'),


                // 'bold', 'italic','underline', /*'code' this.getPlugin('InsertCodeSyntax'),*/'strikethrough', /* Header x4, Enllaç intern,
                // Enllaç extern (hi ha plugin de dojo), UL, OL, Linia horitzontal,  Afegir imatge,
                // emoticones (plugin de dojo?), caracters especials, inserir signatura*/
            ];


            // Extra plugins
            var plugins = this.getPlugins([
                // 'TestDropdown'
                'NewContent',
                'InsertFigureSyntax',
                'InsertFigureLinkSyntax',
                'InsertTableSyntax',
                'InsertTableLinkSyntax',
                'InsertTextSyntax',
                'InsertTextLargeSyntax',
                'InsertExampleSyntax',
                'InsertNoteSyntax',
                'InsertReferenceSyntax',
                'InsertImportantSyntax',
                'InsertQuoteSyntax',
                'InsertAccountingSyntax',
                'IocSoundFormatButton',
                // 'TestFormatButton',
                'IocComment',
                'SaveButton',
                'CancelButton',
                'DocumentPreviewButton',
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

        _enableChangeDetector: function () {
            var $editorContainer = jQuery("iframe#" + this.domNode.id + "_iframe").contents().find('#dijitEditorBody');
            var callback = function () {
                console.log("IocDojoEditor#onDisplayChanged->callback");
                this.emit('change', {newValue: this.get('value')});
            }.bind(this);

            if ($editorContainer.length > 0) {
                $editorContainer.on('input keyup', callback);
                this.changeDetectorEnabled = true;
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
            console.log("IocDojoEditor#isChanged", this.get('value').length, this.originalContent.length);

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

            if (plugin.init) {// TODO[Xavi] Comprovar si això es pot moure al setEditor del plugin
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
            console.log("Creada toolbar:", category, toolbarId);


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
                // var r = this.EditorExecCommand.apply(this,arguments);
                if (this.customUndo) {
                    this._endEditing();
                }
                return r;
            }
        },
        //
        // EditorExecCommand: function(cmd){
        //     // summary:
        //     //		Main handler for executing any commands to the editor, like paste, bold, etc.
        //     //		Called by plugins, but not meant to be called by end users.
        //     // tags:
        //     //		protected
        //     if(this.customUndo && (cmd == 'undo' || cmd == 'redo')){
        //
        //         return this[cmd]();
        //     }else{
        //         if(this.customUndo){
        //             this.endEditing();
        //             this._beginEditing();
        //         }
        //         var r = this.RichTextExecCommand.apply(this,arguments);
        //         // var r = this.inherited(arguments);
        //         if(this.customUndo){
        //             this._endEditing();
        //         }
        //         return r;
        //     }
        // },


        // RichTextExecCommand: function(/*String*/ command, argument){
        //     // summary:
        //     //		Executes a command in the Rich Text area
        //     // command:
        //     //		The command to execute
        //     // argument:
        //     //		An optional argument to the command
        //     // tags:
        //     //		protected
        //     var returnValue;
        //
        //     //focus() is required for IE to work
        //     //In addition, focus() makes sure after the execution of
        //     //the command, the editor receives the focus as expected
        //     if(this.focused){
        //         // put focus back in the iframe, unless focus has somehow been shifted out of the editor completely
        //         this.focus();
        //     }
        //
        //     command = this._normalizeCommand(command, argument);
        //
        //     if(argument !== undefined){
        //         if(command === "heading"){
        //             throw new Error("unimplemented");
        //         }else if(command === "formatblock" && (has("ie") || has("trident"))){
        //             argument = '<' + argument + '>';
        //         }
        //     }
        //
        //     //Check to see if we have any over-rides for commands, they will be functions on this
        //     //widget of the form _commandImpl.  If we don't, fall through to the basic native
        //     //exec command of the browser.
        //     var implFunc = "_" + command + "Impl";
        //     if(this[implFunc]){
        //         returnValue = this[implFunc](argument);
        //     }else{
        //         argument = arguments.length > 1 ? argument : null;
        //         if(argument || command !== "createlink"){
        //             returnValue = this.document.execCommand(command, false, argument);
        //         }
        //     }
        //
        //     this.onDisplayChanged();
        //     return returnValue;
        // },

        // Alerta[Xavi] Es dispara en més casos, no només quan canvia de posició el cursor, però he fet servir
        // aquest nom per coincidir amb l'event disparat pel AceEditor.
        onNormalizedDisplayChanged: function () {
            this.inherited(arguments);

            var info = this.getRangeInfo();

            this.emit('changeCursor', {node: info.node, state: info.state});

            if (!this.prevRangeInfo || info.node !== this.prevRangeInfo.node) {
                this.prevRangeInfo = info;
                var infos = this.getScopeInfo();
                this.emit('changedScope', {rangeInfos: infos});
            }
        },

        getRangeInfo: function () {
            var info = {};

            if (this.document) {

                var selection = this.document.getSelection();
                var node = selection.getRangeAt(0).commonAncestorContainer.parentNode;

                var state = node.getAttribute('data-block-state');

                if (!state) {
                    // Cerquem el node pare amb data-state
                    var $node =  jQuery(node).parents('[data-block-state]');
                    state = $node.attr('data-block-state');

                    if (state){
                        node = $node.get(0);
                    }
                }

                info = {
                    node: node,
                    state: state
                };
            }
            return info;
        },

        getScopeInfo: function() {
            var infos = [];

            if (this.document) {

                var selection = this.document.getSelection();
                var currentNode = selection.getRangeAt(0).commonAncestorContainer/*.parentNode*/;




                var parentNodes = jQuery(currentNode).parentsUntil('#dijitEditorBody','[data-block-state]');

                // Si el node actual te state l'afegim

                var $currentNode=jQuery(currentNode);
                var state =$currentNode.attr('data-block-state');
                if (state) {
                    infos.push({
                        node: currentNode,
                        state: state
                    });
                } else {
                    console.log("+++No hi ha cap estat?", state, currentNode);
                    console.log("+++Selection:", selection);
                    console.log("+++Range:", selection.getRangeAt(0));
                    console.log("+++Container:", selection.getRangeAt(0).commonAncestorContainer);
                }

                parentNodes.each(function() {
                    // Tots els nodes han de tenir l'atribut data-block-state
                    var state = this.getAttribute('data-block-state');

                    infos.push({
                        node: this,
                        state: state
                    });
                })


            }

            console.log("Generated infos:", infos, "parentNodes", parentNodes);

            return infos;
        }

    });
});
