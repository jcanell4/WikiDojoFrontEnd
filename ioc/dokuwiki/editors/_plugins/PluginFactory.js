define([
    'dojo/i18n', // i18n.getLocalization
    'ioc/wiki30/manager/EventFactory',

    // Plugins
    'ioc/dokuwiki/editors/AceManager/plugins/AceFormatButtonPlugin',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoFormatButtonPlugin',

    'ioc/dokuwiki/editors/DojoManager/plugins/CommentsDialog',

    'ioc/dokuwiki/editors/AceManager/plugins/AceFireEventButtonPlugin',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoFireEventButtonPlugin',



    // Localització
    'dojo/i18n!ioc/dokuwiki/editors/DojoManager/nls/commands'



], function (i18n, EventFactory, AceFormatButton, DojoFormatButton, CommentsDialog, AceFireEventButton, DojoFireEventButton) {

    var strings = i18n.getLocalization("ioc.dokuwiki.editors.DojoManager", "commands"); // TODO: Canviar de directori

    var plugins = {
        'ACE': {
            'IocSoundFormatButton' : AceFormatButton,
            'TestFormatButton' : AceFormatButton,
            'CancelButton' : AceFireEventButton,
            'SaveButton' : AceFireEventButton,
        },

        'Dojo': {
            'IocSoundFormatButton' : DojoFormatButton,
            'TestFormatButton' : DojoFormatButton,
            'CommentsDialog' : CommentsDialog,
            'CancelButton' : DojoFireEventButton,
            'SaveButton' : DojoFireEventButton,
        }

    };

    var config = {
        'CancelButton': {
            type: 'BackButton',
            title: strings["ioccancelplugin"],
            event: {full: EventFactory.eventName.CANCEL, partial: EventFactory.eventName.CANCEL_PARTIAL},
            icon: 'IocBack'
        },
        'SaveButton': {
            type: 'SaveButton',
            title: strings["iocsaveplugin"],
            event: {full: EventFactory.eventName.SAVE, partial: EventFactory.eventName.SAVE_PARTIAL},
            icon: 'IocSave'
        },
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
        // console.log("PluginFactory#getPlugin", name, editorType);

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