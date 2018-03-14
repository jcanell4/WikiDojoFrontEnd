define([
    'dojo/i18n', // i18n.getLocalization
    'ioc/wiki30/manager/EventFactory',

    // Plugins
    'ioc/dokuwiki/editors/AceManager/plugins/AceFormat',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoFormat',

    'ioc/dokuwiki/editors/DojoManager/plugins/DojoComment',

    'ioc/dokuwiki/editors/AceManager/plugins/AceFireEvent',
    'ioc/dokuwiki/editors/AceManager/plugins/AceFireDojoEvent', // TODO: Fer versió pel dojo
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoFireEvent',

    'ioc/dokuwiki/editors/AceManager/plugins/AceDocumentPreview',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoDocumentPreview',

    'ioc/dokuwiki/editors/AceManager/plugins/AceEnableACE',
    'ioc/dokuwiki/editors/AceManager/plugins/AceEnableWrapper',

    'ioc/dokuwiki/editors/AceManager/plugins/AceLatexPreview',

    'ioc/dokuwiki/editors/AceManager/plugins/AceTestReadonlyPlugin', // Test readonly

    // Localització
    'dojo/i18n!ioc/dokuwiki/editors/nls/commands'



], function (i18n, EventFactory, AceFormat, DojoFormat, DojoComment, AceFireEvent, AceFireDojoEvent,
             DojoFireEvent, AceDocumentPreview,DojoDocumentPreview,
             AceEnableACE, AceEnableWrapper, AceLatexPreview, AceTestReadonlyPlugin) {

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
            'LatexPreview': AceLatexPreview,
            'CancelDialogEditorButton' : AceFireDojoEvent,
            'SaveDialogEditorButton' : AceFireDojoEvent,
            'TestReadonlyPlugin': AceTestReadonlyPlugin
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


            // Botons barra d'eines de dojo bàsics
            'HTMLBold': DojoFormat,
            'HTMLItalic': DojoFormat,
            'HTMLUnderline': DojoFormat,
            'HTMLCode': DojoFormat,
            'HTMLStrikethrough' : DojoFormat,
            'HTMLHeader1' : DojoFormat,
            'HTMLHeader2' : DojoFormat,
            'HTMLHeader3' : DojoFormat,
            'HTMLHeader4' : DojoFormat,
            'HTMLHeader5' : DojoFormat,
            'HTMLHeader6' : DojoFormat,
            'HTMLLink' : DojoFormat,
            'HTMLLinkExternal' : DojoFormat,


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
        'CancelDialogEditorButton': {
            type: 'CancelDialogEditorButton',
            title: strings["cancel-button"],
            event: {type:'CancelDialog', data: {}},
            icon: 'IocBack',
            // category: 'A'
        },
        'SaveDialogEditorButton': {
            type: 'SaveDialogEditorButton',
            title: strings["save-button"],
            event: {type:'SaveDialog', data: {}},
            icon: 'IocSave',
            // category: 'A'
        },
        'IocSoundFormatButton': {
            title: strings["ioc-sound-button"],
            open: '{{soundcloud>',
            close: '}}',
            sample: strings["ioc-sound-sample"],
            icon: 'IocSound',
            category: strings["category-ioc"]
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
            icon: 'IocNewContent',
            category: strings["category-ioc"]
        },

        'InsertFigureSyntax': {
            title: strings["ioc-insert-figure-button"],
            open: '::figure:\n  :title:\n  :footer:\n',
            close: '\n:::',
            sample: strings["ioc-insert-figure-sample"],
            icon: 'IocInsertFigureSyntax',
            category: strings["category-ioc"]
        },

        'InsertFigureLinkSyntax': {
            title: strings["ioc-insert-figure-link-button"],
            open: ':figure:',
            close: ':',
            sample: strings["ioc-insert-figure-link-sample"],
            icon: 'IocInsertFigureLinkSyntax',
            category: strings["category-ioc"]
        },

        'InsertTableSyntax': {
            title: strings["ioc-insert-table-button"],
            open: '::table:\n  :title:\n  :footer:\n',
            close: '\n:::',
            sample: strings["ioc-insert-table-sample"],
            icon: 'IocInsertTableSyntax',
            category: strings["category-ioc"]
        },

        'InsertTableLinkSyntax': {
            title: strings["ioc-insert-table-link-button"],
            open: ':table:',
            close: ':',
            sample: strings["ioc-insert-table-link-sample"],
            icon: 'IocInsertTableLinkSyntax',
            category: strings["category-ioc"]
        },

        'InsertTextSyntax': {
            title: strings["ioc-insert-text-button"],
            open: '::text:\n  :title:\n',
            close: '\n:::',
            sample: strings["ioc-insert-text-sample"],
            icon: 'IocInsertTextSyntax',
            category: strings["category-ioc"]
        },

        'InsertTextLargeSyntax': {
            title: strings["ioc-insert-text-large-button"],
            open: '::text:\n  :title:\n  :large:\n',
            close: '\n:::',
            sample: strings["ioc-insert-text-large-sample"],
            icon: 'IocInsertTextLargeSyntax',
            category: strings["category-ioc"]
        },

        'InsertExampleSyntax': {
            title: strings["ioc-insert-example-button"],
            open: '::example:\n  :title:\n',
            close: '\n:::',
            sample: strings["ioc-insert-example-sample"],
            icon: 'IocInsertExampleSyntax',
            category: strings["category-ioc"]
        },

        'InsertNoteSyntax': {
            title: strings["ioc-insert-note-button"],
            open: '::note:\n',
            close: '\n:::',
            sample: strings["ioc-insert-note-sample"],
            icon: 'IocInsertNoteSyntax',
            category: strings["category-ioc"]
        },

        'InsertReferenceSyntax': {
            title: strings["ioc-insert-reference-button"],
            open: '::reference:\n',
            close: '\n:::',
            sample: strings["ioc-insert-reference-sample"],
            icon: 'IocInsertReferenceSyntax',
            category: strings["category-ioc"]
        },

        'InsertImportantSyntax': {
            title: strings["ioc-insert-important-button"],
            open: '::important:\n',
            close: '\n:::',
            sample: strings["ioc-insert-reference-sample"],
            icon: 'IocInsertImportantSyntax',
            category: strings["category-ioc"]
        },

        'InsertQuoteSyntax': {
            title: strings["ioc-insert-quote-button"],
            open: '::quote:\n',
            close: '\n:::',
            sample: strings["ioc-insert-quote-sample"],
            icon: 'IocInsertQuoteSyntax',
            category: strings["category-ioc"]
        },

        'InsertAccountingSyntax': {
            title: strings["ioc-insert-accounting-button"],
            open: '::accounting:\n  :title:\n  :footer:\n',
            close: '\n:::',
            sample: strings["ioc-insert-accounting-sample"],
            icon: 'IocInsertAccountingSyntax',
            category: strings["category-ioc"]
        },


        'HTMLBold': {
            title: strings["ioc-insert-bold-button"],
            open: '<strong>',
            close: '</strong>',
            sample: strings["ioc-insert-bold-button"],
            icon: 'IocBold',
        },

        'HTMLItalic': {
            title: strings["ioc-insert-italic-button"],
            open: '<em>',
            close: '</em>',
            sample: strings["ioc-insert-italic-button"],
            icon: 'IocItalic',
        },

        'HTMLUnderline': {
            title: strings["ioc-insert-underline-button"],
            open: '<ins>',
            close: '</ins>',
            sample: strings["ioc-insert-underline-button"],
            icon: 'IocUnderline',
        },

        'HTMLCode': {
            title: strings["ioc-insert-code-button"],
            open: '<code>',
            close: '</code>',
            sample: strings["ioc-insert-code-button"],
            icon: 'IocCode',
        },

        'HTMLStrikethrough': {
            title: strings["ioc-insert-strikethrough-button"],
            open: '<del>',
            close: '</del>',
            sample: strings["ioc-insert-strikethrough-button"],
            icon: 'IocStrikethrough',
        },

        'HTMLHeader1': {
            title: strings["ioc-insert-header1-button"],
            open: '<h1>',
            close: '</h1>',
            sample: strings["ioc-insert-header-sample"],
            icon: 'IocHeader1',
            category: strings["category-header"]
        },

        'HTMLHeader2': {
            title: strings["ioc-insert-header2-button"],
            open: '<h2>',
            close: '</h2>',
            sample: strings["ioc-insert-header-sample"],
            icon: 'IocHeader2',
            category: strings["category-header"]
        },

        'HTMLHeader3': {
            title: strings["ioc-insert-header3-button"],
            open: '<h3>',
            close: '</h3>',
            sample: strings["ioc-insert-header-sample"],
            icon: 'IocHeader3',
            category: strings["category-header"]
        },

        'HTMLHeader4': {
            title: strings["ioc-insert-header4-button"],
            open: '<h4>',
            close: '</h4>',
            sample: strings["ioc-insert-header-sample"],
            icon: 'IocHeader4',
            category: strings["category-header"]
        },

        'HTMLHeader5': {
            title: strings["ioc-insert-header5-button"],
            open: '<h5>',
            close: '</h5>',
            sample: strings["ioc-insert-header-sample"],
            icon: 'IocHeader5',
            category: strings["category-header"]
        },

        'HTMLHeader6': {
            title: strings["ioc-insert-header6-button"],
            open: '<h6>',
            close: '</h6>',
            sample: strings["ioc-insert-header-sample"],
            icon: 'IocHeader6',
            category: strings["category-header"]
        },

        'HTMLLink': {
            title: strings["ioc-insert-link-button"],
            open: '',
            close: '',
            sample: strings["ioc-insert-link-sample"],
            icon: 'IocLink',
        },

        'HTMLLinkExternal': {
            title: strings["ioc-insert-link-external-button"],
            open: '',
            close: '',
            sample: strings["ioc-insert-link-external-sample"],
            icon: 'IocLinkExternal',
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