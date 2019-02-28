define([
    "ioc/gui/content/plugins/EmbededComment",
], function (EmbededComment) {

    var plugins = {},

        _getPlugin = function (type) {

            if (!plugins[type]) {
                console.error("Content Tool Plugin " + type + " not found.");
                return null;
            }

            return plugins[type];
        },

        _addPlugin = function (type, plugin) {
            plugins[type] = plugin;
        },

        _init = function () {
            _addPlugin('EmbededComment', EmbededComment);
        };

    _init();

    return {
        getPlugin: _getPlugin,
        addPlugin: _addPlugin
    };
});

