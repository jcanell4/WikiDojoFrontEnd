define([
    'dojo/Evented',
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/_plugins/PluginFactory'
], function (Evented, declare, pluginFactory) {

    // Patch pel toggle del linkwiz de manera que es cerqui l'editor seleccionat quan s'activi

    var originalToggle = dw_linkwiz.toggle;
    var dispatcher = null;

    var loadDispatcher = function() {
        // ALERTA[Xavi] Important, el require es syncron, fins que no s'executa no continua la execució!
        require(["ioc/wiki30/dispatcherSingleton"], function(getDispatcher) {
            dispatcher = getDispatcher();
        });
    };


    dw_linkwiz.toggle = function ($textarea) {

        if (!$textarea) {

            // TODO: Obtenir l'editor i el textarea del dispatcher


            if (!dispatcher) {
                loadDispatcher();
            }

            var id = dispatcher.getGlobalState().getCurrentId(),
                editor = dispatcher.getContentCache(id).getMainContentTool().getEditor();


            // TODO: extreure l'editor parcial
            // var chunk = dispatcher.getGlobalState().getCurrentElementId(),
            //     id = dispatcher.getGlobalState().getCurrentId(),
            //     editor;
            // chunk = chunk.replace(id + "_", "");
            // chunk = chunk.replace("container_", "");
            //
            // editor = dispatcher.getContentCache(id).getMainContentTool().getEditor(chunk);


            $textarea = editor.editor.$textarea;

        }

        dw_linkwiz.init($textarea); // Ens asegurem que s'ha inicialitzat
        dw_linkwiz.textArea = $textarea[0]; // Establim el textarea

        originalToggle();
    };


    return declare([Evented], {

        // Gestió de funcions comunes pels components, plugins i adaptors

        getPlugin : function(name) {
            // console.log("AbstractIocEditor#getPlugin", this.editorType);
            return pluginFactory.getPlugin(name, this.editorType);
        },

        getPlugins: function (names) {
            //console.log("getPlugins:", names);
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
        },

        getContentFormat: function () {
            if (!this.editorType) {
                throw new Error("ContentFormat no definit");
            } else {
                return this.editorType;
            }
        },

        refresh: function() {
            this.emit('refresh');
        }

    });

});
