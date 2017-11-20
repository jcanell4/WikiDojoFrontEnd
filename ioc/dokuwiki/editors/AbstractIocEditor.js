define([
    'dojo/Evented',
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/_plugins/PluginFactory'
], function (Evented, declare, pluginFactory) {

    return declare([Evented], {

        // Gestió de funcions comunes pels components, plugins i adaptors

        getPlugin : function(name) {
            // console.log("AbstractIocEditor#getPlugin", this.editorType);
            return pluginFactory.getPlugin(name, this.editorType);
        },

        getPlugins: function (names) {
            var plugins = [];

            for (var i = 0; i<names.length; i++) {
                var plugin = this.getPlugin(names[i]);

                if (plugin) {
                    plugins.push(plugin);
                }
            }

            return plugins;
        },

        destroy: function() {
            // console.log("AbstractIocEditor#destroy");
            for (var toolbarId in this.toolbars) {
                this.toolbars[toolbarId].destroy();
            }

            this.inherited(arguments);
        }

    });

});
