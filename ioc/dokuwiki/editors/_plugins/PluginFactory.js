define([
    'dojo/i18n', // i18n.getLocalization
    'ioc/wiki30/manager/EventFactory',

    // Plugins
    'ioc/dokuwiki/editors/AceManager/plugins/AceFormat',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoFormat',

    'ioc/dokuwiki/editors/DojoManager/plugins/DojoComment',

    'ioc/dokuwiki/editors/AceManager/plugins/AceFireEvent',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoFireEvent',

    'ioc/dokuwiki/editors/AceManager/plugins/AceDocumentPreview',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoDocumentPreview',

    'ioc/dokuwiki/editors/AceManager/plugins/AceEnableACE',
    'ioc/dokuwiki/editors/AceManager/plugins/AceEnableWrapper',

    'ioc/dokuwiki/editors/AceManager/plugins/AceLatexPreview',

    // Localització
    'dojo/i18n!ioc/dokuwiki/editors/nls/commands'



], function (i18n, EventFactory, AceFormat, DojoFormat, DojoComment, AceFireEvent,
             DojoFireEvent, AceDocumentPreview,DojoDocumentPreview,
             AceEnableACE, AceEnableWrapper, AceLatexPreview) {

    var strings = i18n.getLocalization("ioc.dokuwiki.editors", "commands");

    var plugins = {
        'ACE': {
            'IocSoundFormatButton' : AceFormat,
            // 'TestFormatButton' : AceFormat,
            'CancelButton' : AceFireEvent,
            'SaveButton' : AceFireEvent,
            'DocumentPreviewButton': AceDocumentPreview,
            'EnableACE': AceEnableACE,
            'EnableWrapper': AceEnableWrapper,
            'LatexPreview': AceLatexPreview
        },

        'Dojo': {
            'IocSoundFormatButton' : DojoFormat,
            // 'TestFormatButton' : DojoFormat,
            'IocComment' : DojoComment,
            'CancelButton' : DojoFireEvent,
            'SaveButton' : DojoFireEvent,
            'DocumentPreviewButton': DojoDocumentPreview,

            // Botons del desplegable IOC
            'NewContent': DojoFormat,
            'InsertFigureSyntax': DojoFormat,
            'InsertFigureLinkSyntax': DojoFormat,
            'InsertTableSyntax': DojoFormat,
            'InsertTableLinkSyntax': DojoFormat,
            'InsertTextSyntax': DojoFormat,
            'InsertTextLargeSyntax': DojoFormat,
            'InsertExampleSyntax': DojoFormat,
            'InsertNoteSyntax': DojoFormat,
            'InsertReferenceSyntax': DojoFormat,
            'InsertImportantSyntax': DojoFormat,
            'InsertQuoteSyntax': DojoFormat,
            'InsertAccountingSyntax': DojoFormat,
        }

    };

    var config = {
        'CancelButton': {
            type: 'BackButton',
            title: strings["cancel-button"],
            event: {full: EventFactory.eventName.CANCEL, partial: EventFactory.eventName.CANCEL_PARTIAL},
            icon: 'IocBack',
            // category: 'A'
        },
        'SaveButton': {
            type: 'SaveButton',
            title: strings["save-button"],
            event: {full: EventFactory.eventName.SAVE, partial: EventFactory.eventName.SAVE_PARTIAL},
            icon: 'IocSave',
            // category: 'A'
        },
        'IocSoundFormatButton': {
            title: strings["ioc-sound-button"],
            open: '{{soundcloud>',
            close: '}}',
            sample: strings["ioc-sound-sample"],
            icon: 'IocSound',
            category: 'IOC'
        },
        'DocumentPreviewButton': {
            type: 'DocumentPreview',
            title: strings["document-preview"],
            icon: 'IocDocumentPreview',
            // category: 'B'
        },
        // 'TestFormatButton': {
        //     title: 'Test',
        //     open: '{{test>',
        //     close: '}}',
        //     sample: 'FooBar',
        //     icon: 'IocSound'
        //     // category: 'C',
        // },
        'IocComment': {
            type: 'IocComment',
            title: strings["ioc-comment-button"],
            icon: 'IocComment'
            // category: 'C',
        },

        'EnableACE': {
            type: 'EnableACE',
            title: strings["enable-ace"],
            icon: 'IocEnableACE'
            // category: 'C',
        },

        'EnableWrapper': {
            type: 'EnableWrapper',
            title: strings["enable-wrapper"],
            icon: 'IocEnableWrapper'
            // category: 'C',
        },

        'LatexPreview': {
            type: 'LatexPreview',
            title: strings["latex-preview"],
        },

        'NewContent': {
            title: strings["ioc-new-content-button"],
            open: '<newcontent>',
            close: '</newcontent>',
            sample: strings["ioc-new-content-sample"],
            icon: 'IocNewContent', // TODO[Xavi] Afegir icon
            category: 'IOC'
        },

        'InsertFigureSyntax': {
            title: strings["ioc-insert-figure-button"],
            open: '::figure:\n  :title:\n  :footer:\n',
            close: '\n:::',
            sample: strings["ioc-insert-figure-sample"],
            icon: 'IocInsertFigureSyntax', // TODO[Xavi] Afegir icon
            category: 'IOC'
        },

        'InsertFigureLinkSyntax': {
            title: strings["ioc-insert-figure-link-button"],
            open: ':figure:',
            close: ':',
            sample: strings["ioc-insert-figure-link-sample"],
            icon: 'IocInsertFigureLinkSyntax', // TODO[Xavi] Afegir icon
            category: 'IOC'
        },

        'InsertTableSyntax': {
            title: strings["ioc-insert-table-button"],
            open: '::table:\n  :title:\n  :footer:\n',
            close: '\n:::',
            sample: strings["ioc-insert-table-sample"],
            icon: 'IocInsertTableSyntax', // TODO[Xavi] Afegir icon
            category: 'IOC'
        },

        'InsertTableLinkSyntax': {
            title: strings["ioc-insert-table-link-button"],
            open: ':table:',
            close: ':',
            sample: strings["ioc-insert-table-link-sample"],
            icon: 'IocInsertTableLinkSyntax', // TODO[Xavi] Afegir icon
            category: 'IOC'
        },

        'InsertTextSyntax': {
            title: strings["ioc-insert-text-button"],
            open: '::text:\n  :title:\n',
            close: '\n:::',
            sample: strings["ioc-insert-text-sample"],
            icon: 'IocInsertTextSyntax', // TODO[Xavi] Afegir icon
            category: 'IOC'
        },

        'InsertTextLargeSyntax': {
            title: strings["ioc-insert-text-large-button"],
            open: '::text:\n  :title:\n  :large:\n',
            close: '\n:::',
            sample: strings["ioc-insert-text-large-sample"],
            icon: 'IocInsertTextLargeSyntax', // TODO[Xavi] Afegir icon
            category: 'IOC'
        },

        'InsertExampleSyntax': {
            title: strings["ioc-insert-example-button"],
            open: '::example:\n  :title:\n',
            close: '\n:::',
            sample: strings["ioc-insert-example-sample"],
            icon: 'IocInsertExampleSyntax', // TODO[Xavi] Afegir icon
            category: 'IOC'
        },

        'InsertNoteSyntax': {
            title: strings["ioc-insert-note-button"],
            open: '::note:\n',
            close: '\n:::',
            sample: strings["ioc-insert-note-sample"],
            icon: 'IocInsertNoteSyntax', // TODO[Xavi] Afegir icon
            category: 'IOC'
        },

        'InsertReferenceSyntax': {
            title: strings["ioc-insert-reference-button"],
            open: '::reference:\n',
            close: '\n:::',
            sample: strings["ioc-insert-reference-sample"],
            icon: 'IocInsertReferenceSyntax', // TODO[Xavi] Afegir icon
            category: 'IOC'
        },

        'InsertImportantSyntax': {
            title: strings["ioc-insert-important-button"],
            open: '::important:\n',
            close: '\n:::',
            sample: strings["ioc-insert-reference-sample"],
            icon: 'IocInsertImportantSyntax', // TODO[Xavi] Afegir icon
            category: 'IOC'
        },

        'InsertQuoteSyntax': {
            title: strings["ioc-insert-quote-button"],
            open: '::quote:\n',
            close: '\n:::',
            sample: strings["ioc-insert-quote-sample"],
            icon: 'IocInsertQuoteSyntax', // TODO[Xavi] Afegir icon
            category: 'IOC'
        },

        'InsertAccountingSyntax': {
            title: strings["ioc-insert-accounting-button"],
            open: '::accounting:\n  :title:\n  :footer:\n',
            close: '\n:::',
            sample: strings["ioc-insert-accounting-sample"],
            icon: 'IocInsertAccountingSyntax', // TODO[Xavi] Afegir icon
            category: 'IOC'
        },

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