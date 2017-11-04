define([
    'ioc/dokuwiki/editors/AbstractIocEditor',
    'dojo/_base/declare',
    'dijit/Editor',

    'ioc/dokuwiki/editors/_plugins/AbstractIocPlugin',
    'ioc/dokuwiki/editors/DojoManager/plugins/CommentsDialog',
    'ioc/dokuwiki/editors/DojoManager/plugins/IocSoundFormatButtonPlugin',

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
             AbstractIocPlugin, CommentsDialog, IocSoundFormatButtonPlugin,

             array, /*declare,*/ Deferred, i18n, domAttr, domClass, domGeometry, domStyle,
             keys, lang, has, string, topic,
             _Container, Toolbar, ToolbarSeparator, _LayoutWidget, ToggleButton,
             _Plugin, EnterKeyHandling, html, rangeapi, RichText, dijit) {
    return declare([AbstractIocEditor, Editor], {

        editorType : 'Dojo',


            constructor: function () {
                this.changeDetectorEnabled = false;
                this._pluginsToParse = [];

                // TODO[Xavi] Recorrer els components i extreure els plugins que s'afegiran a aquest array.
                // components

                // var plugins = [
                //     CommentsDialog, IocSoundFormatButtonPlugin
                // ];


                var plugins = this.getPlugins(['IocSoundFormatButton', 'TestFormatButton', 'CommentsDialog', 'SaveButton', 'CancelButton']);


                if (arguments[0].extraPlugins) {
                    arguments[0].extraPlugins = plugins.concat(arguments[0].extraPlugins);
                } else {
                    arguments[0].extraPlugins = plugins;
                }
            },

        onLoad: function()  {
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
                // console.log("IocDojoEditor#onDisplayChanged->callback");
                this.onChange(this.get('value'));
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
            // console.log("IocDojoEditor#isChanged", this.get('value').length, this.originalContent.length);

            // if (this.get('value') !== this.originalContent) {
            //     console.log("|"+this.get('value')+"|");
            //     console.log("/////////////////////////////");
            //     console.log("|"+this.originalContent+"|");
            // }

            return this.get('value') !== this.originalContent;
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

            if (lang.isFunction(plugin.setToolbar)) {
                plugin.setToolbar(this.toolbar);
            }

            // TODO[Xavi] Comprovar si això es pot moure al init del plugin
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
