define([
    'dojo/i18n', // i18n.getLocalization
    'ioc/wiki30/manager/EventFactory',

    // Plugins
    'ioc/dokuwiki/editors/AceManager/plugins/AceFormatButtonPlugin',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoFormatButtonPlugin',




    // Localització
    'dojo/i18n!ioc/dokuwiki/editors/DojoManager/nls/commands'



], function (i18n, EventFactory, AceFormatButtonPlugin, DojoFormatButtonPlugin) {

    var strings = i18n.getLocalization("ioc.dokuwiki.editors.DojoManager", "commands"); // TODO: Canviar de directori

    var plugins = {
        'ACE': {
            'IocSoundFormatButton' : AceFormatButtonPlugin,
            'TestFormatButton' : AceFormatButtonPlugin
        },

        'Dojo': {
            'IocSoundFormatButton' : DojoFormatButtonPlugin,
            'TestFormatButton' : DojoFormatButtonPlugin
        }

    };

    var config = {
        // 'CancelButton': {
        //     title: strings["cancelplugin"],
        //     event: [EventFactory.eventName.CANCEL,EventFactory.eventName.CANCEL_PARTIAL]
        // },
        // 'SaveButton': {
        //     title: strings["saveplugin"],
        //     event: [EventFactory.eventName.SAVE,EventFactory.eventName.SAVE_PARTIAL]
        // },
        'IocSoundFormatButton': {
            title: strings["iocsoundplugin"],
            open: '{{soundcloud>',
            close: '}}',
            sample: strings["iocsoundplugin-sample"],
            icon: 'IocSound'
        },
        'TestFormatButton': {
            title: 'Test',
            open: '{{test>',
            close: '}}',
            sample: 'FooBar',
            icon: 'IocSound'
        }
    };


    var getPlugin = function (name, editorType) {
        console.log("PluginFactory#getPlugin", name, editorType, plugins);

        if (plugins[editorType][name]) {
            return {
                plugin : plugins[editorType][name],
                config: config[name] || {}
            };
        }

        return null;
    };


    return {
        getPlugin: getPlugin
    };

});