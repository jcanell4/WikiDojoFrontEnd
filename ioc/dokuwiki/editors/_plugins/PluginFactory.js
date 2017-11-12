define([
    'dojo/i18n', // i18n.getLocalization
    'ioc/wiki30/manager/EventFactory',

    // Plugins
    'ioc/dokuwiki/editors/AceManager/plugins/AceFormat',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoFormat',

    'ioc/dokuwiki/editors/DojoManager/plugins/DojoComments',

    'ioc/dokuwiki/editors/AceManager/plugins/AceFireEvent',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoFireEvent',

    'ioc/dokuwiki/editors/AceManager/plugins/AceDocumentPreview',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoDocumentPreview',


    // Localització
    'dojo/i18n!ioc/dokuwiki/editors/DojoManager/nls/commands'



], function (i18n, EventFactory, AceFormat, DojoFormat, DojoComments, AceFireEvent,
             DojoFireEvent, AceDocumentPreview,DojoDocumentPreview) {

    var strings = i18n.getLocalization("ioc.dokuwiki.editors.DojoManager", "commands"); // TODO: Canviar de directori

    var plugins = {
        'ACE': {
            'IocSoundFormatButton' : AceFormat,
            'TestFormatButton' : AceFormat,
            'CancelButton' : AceFireEvent,
            'SaveButton' : AceFireEvent,
            'DocumentPreviewButton': AceDocumentPreview,
        },

        'Dojo': {
            'IocSoundFormatButton' : DojoFormat,
            'TestFormatButton' : DojoFormat,
            'CommentsDialog' : DojoComments,
            'CancelButton' : DojoFireEvent,
            'SaveButton' : DojoFireEvent,
            'DocumentPreviewButton': DojoDocumentPreview,
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
        'DocumentPreviewButton': {
            type: 'DocumentPreview',
            title: strings["iocdocumentpreviewplugin"],
            icon: 'IocDocumentPreview'
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