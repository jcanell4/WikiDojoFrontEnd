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


        /**
         * Afegeix el parse del plugin si es necessari.
         *
         * @param plugin
         * @param index
         * @override
         */
        addPlugins: function (/*String||Object||Function*/ plugin, /*Integer?*/ index) {

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


    })
});