define([
    'ioc/dokuwiki/editors/AbstractIocEditor',
    'dojo/_base/declare',
    'dijit/Editor',


    // ALERTA[Xavi] Necessari pel addPlugin (només per depurar)
    "dojo/_base/array", // array.forEach
    // "dojo/_base/declare", // declare
    "dojo/Deferred", // Deferred
    "dojo/i18n", // i18n.getLocalization
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
    "dojo/i18n!dijit/_editor/nls/commands"

], function (AbstractIocEditor, declare, Editor,
             array, /*declare,*/ Deferred, i18n, domAttr, domClass, domGeometry, domStyle,
             keys, lang, has, string, topic,
             _Container, Toolbar, ToolbarSeparator, _LayoutWidget, ToggleButton,
             _Plugin, EnterKeyHandling, html, rangeapi, RichText, dijit) {
    return declare([AbstractIocEditor, Editor], {


        constructor: function () {
            this.changeDetectorEnabled = false;
            this._pluginsToParse = [];
        },


        startup: function () {
            this.inherited(arguments);
            this.watch('value', this._checkOriginalContent);
            this.runOnce = this.watch('value', this._parsePlugins);
        },


        _addPluginParser: function (plugin) {

            this._pluginsToParse.push(plugin);
        },

        _parsePlugins: function () {
            this.runOnce.unwatch('value');

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

            // this.onChange(this.get('value'));

        },

        _enableChangeDetector: function () {

            var $editorContainer = jQuery("iframe#" + this.domNode.id + "_iframe").contents().find('#dijitEditorBody');
            var callback = function () {
                // console.log("IocDojoEditor#onDisplayChanged->callback");
                this.onChange(this.get('value'));
            }.bind(this);

            if ($editorContainer.length > 0) {
                $editorContainer.on('input keyup', callback);
                this.changeDetectorEnabled = true;
            }
        },

        _checkOriginalContent: function (name, oldValue, newValue) {


            // console.log("IocDojoEditor#_checkOriginalContent", newValue);
            if (!this.originalContent) {
                this.originalContent = newValue;
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
            return this.get('value') != this.originalContent;
        },


        // ALERTA[Xavi] Aquesta funció es idéntica a la del editor, sobreescrita només per facilitar la depuració i després es pot eliminar
        addPlugin: function (/*String||Object||Function*/ plugin, /*Integer?*/ index) {

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
            plugin.setEditor(this);

            if (lang.isFunction(plugin.setToolbar)) {
                plugin.setToolbar(this.toolbar);
            }

            if (plugin.needsParse) {
                this._addPluginParser(plugin);
            }
            // console.log(" ** FI ** ");
        },


        onKeyDown: function (e) {
            // summary:
            //		Handler for onkeydown event.
            // tags:
            //		private

            //We need to save selection if the user TAB away from this editor
            //no need to call _saveSelection for IE, as that will be taken care of in onBeforeDeactivate
            if (!has("ie") && !this.iframe && e.keyCode == keys.TAB && !this.tabIndent) {
                this._saveSelection();
            }
            if (!this.customUndo) {
                this.inherited(arguments);
                return;
            }
            var k = e.keyCode;
            if (e.ctrlKey && !e.shiftKey && !e.altKey) {//undo and redo only if the special right Alt + z/y are not pressed #5892
                if (k == 90 || k == 122) { //z, but also F11 key
                    e.stopPropagation();
                    e.preventDefault();
                    this.undo();
                    return;
                } else if (k == 89 || k == 121) { //y
                    e.stopPropagation();
                    e.preventDefault();
                    this.redo();
                    return;
                }
            }
            this.inherited(arguments);

            switch (k) {
                case keys.ENTER:
                case keys.BACKSPACE:
                case keys.DELETE:
                    break;
                case 88: //x
                case 86: //v
                    if (e.ctrlKey && !e.altKey && !e.metaKey) {
                        this.endEditing();//end current typing step if any
                        if (e.keyCode == 88) {
                            this.beginEditing('cut');
                        } else {
                            this.beginEditing('paste');
                        }
                        //use timeout to trigger after the paste is complete
                        this.defer("endEditing", 1);
                        break;
                    }
                //pass through
                default:
                    if (!e.ctrlKey && !e.altKey && !e.metaKey && (e.keyCode < keys.F1 || e.keyCode > keys.F15)) {
                        this.beginEditing();
                        break;
                    }
                //pass through
                case keys.ALT:
                    this.endEditing();
                    break;
                case keys.UP_ARROW:
                case keys.DOWN_ARROW:
                case keys.LEFT_ARROW:
                case keys.RIGHT_ARROW:
                case keys.HOME:
                case keys.END:
                case keys.PAGE_UP:
                case keys.PAGE_DOWN:
                    this.endEditing(true);
                    break;
                //maybe ctrl+backspace/delete, so don't endEditing when ctrl is pressed
                case keys.CTRL:
                case keys.SHIFT:
                case keys.TAB:
                    break;
            }
        },

        onClick: function () {
            // summary:
            //		Handler for when editor is clicked
            // tags:
            //		protected

            this.endEditing(true);
            this.inherited(arguments);
        },

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


    })
});
