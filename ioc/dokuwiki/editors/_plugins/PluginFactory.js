define([
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

    'ioc/dokuwiki/editors/AceManager/plugins/AceReadonlyBlocksToggle', // Test readonly
    'ioc/dokuwiki/editors/AceManager/plugins/AceTestReadonlyPlugin', // Test readonly

    'ioc/dokuwiki/editors/AceManager/plugins/AceTableEditorPlugin',

    // Localització
    'dojo/i18n!ioc/dokuwiki/editors/nls/commands'



], function (EventFactory, AceFormat, DojoFormat, DojoComment, AceFireEvent, AceFireDojoEvent,
             DojoFireEvent, AceDocumentPreview,DojoDocumentPreview,
             AceEnableACE, AceEnableWrapper, AceLatexPreview, AceReadonlyBlocksToggle, AceTestReadonlyPlugin, AceTableEditor, localization) {


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
            'TestReadonlyPlugin': AceTestReadonlyPlugin,
            'ReadonlyBlocksToggle': AceReadonlyBlocksToggle,
            'TableEditor': AceTableEditor,
            'TableEditorMultiline': AceTableEditor
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



    // Atributs de configucarió:
    //  type: tipus de botó, es el identificador que fa servir la toolbar. En el cas dels botons ace es el suffix de la funció global.
    //  title: titol del botó.
    //  event: {full|partial} nom dels events de l'EventManager que són llençants per aquests botons.
    //  customEvent: {type, data} events propis sense cap funcionalitat lligada. TODO[Xavi] pendent de canviar per customEvent

    //  icon: classe css corresponent a aquest botó (es troben tots a un atlas, si es volen afegir s'ha de modificar el fitxer amb el css i afegir la nova icona al fitxer)
    //  open/close: correspondencia del codi wiki per la apertura i tancament d'una etiqueta.
    //  category: grup al que pertany una icona, tots els botons amb la mateixa categoria s'afegeixen al mateix botó desplegable.

    var config = {
        'CancelButton': {
            type: 'BackButton',
            title: localization["cancel-button"],
            event: {full: EventFactory.eventName.CANCEL, partial: EventFactory.eventName.CANCEL_PARTIAL},
            icon: 'IocBack',
            // category: 'A'
        },
        'SaveButton': {
            type: 'SaveButton',
            title: localization["save-button"],
            event: {full: EventFactory.eventName.SAVE, partial: EventFactory.eventName.SAVE_PARTIAL},
            icon: 'IocSave',
            // category: 'A'
        },
        'CancelDialogEditorButton': {
            type: 'CancelDialogEditorButton',
            title: localization["cancel-button"],
            customEvent: {type:'CancelDialog', data: {}},
            icon: 'IocBack',
            // category: 'A'
        },
        'SaveDialogEditorButton': {
            type: 'SaveDialogEditorButton',
            title: localization["save-button"],
            customEvent: {type:'SaveDialog', data: {}},
            icon: 'IocSave',
            // category: 'A'
        },
        'IocSoundFormatButton': {
            title: localization["ioc-sound-button"],
            open: '{{soundcloud>',
            close: '}}',
            sample: localization["ioc-sound-sample"],
            icon: 'IocSound',
            category: localization["category-ioc"]
        },
        'DocumentPreviewButton': {
            type: 'DocumentPreview',
            title: localization["document-preview"],
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
            title: localization["ioc-comment-button"],
            icon: 'IocComment'
            // category: 'C',
        },

        'EnableACE': {
            type: 'EnableACE',
            title: localization["enable-ace"],
            icon: 'IocEnableACE'
            // category: 'C',
        },

        'EnableWrapper': {
            type: 'EnableWrapper',
            title: localization["enable-wrapper"],
            icon: 'IocEnableWrapper'
            // category: 'C',
        },

        'LatexPreview': {
            type: 'LatexPreview',
            title: localization["latex-preview"],
        },

        'NewContent': {
            title: localization["ioc-new-content-button"],
            open: '<newcontent>',
            close: '</newcontent>',
            sample: localization["ioc-new-content-sample"],
            icon: 'IocNewContent',
            category: localization["category-ioc"]
        },

        'InsertFigureSyntax': {
            title: localization["ioc-insert-figure-button"],
            open: '::figure:\n  :title:\n  :footer:\n',
            close: '\n:::',
            sample: localization["ioc-insert-figure-sample"],
            icon: 'IocInsertFigureSyntax',
            category: localization["category-ioc"]
        },

        'InsertFigureLinkSyntax': {
            title: localization["ioc-insert-figure-link-button"],
            open: ':figure:',
            close: ':',
            sample: localization["ioc-insert-figure-link-sample"],
            icon: 'IocInsertFigureLinkSyntax',
            category: localization["category-ioc"]
        },

        'InsertTableSyntax': {
            title: localization["ioc-insert-table-button"],
            open: '::table:\n  :title:\n  :footer:\n',
            close: '\n:::',
            sample: localization["ioc-insert-table-sample"],
            icon: 'IocInsertTableSyntax',
            category: localization["category-ioc"]
        },

        'InsertTableLinkSyntax': {
            title: localization["ioc-insert-table-link-button"],
            open: ':table:',
            close: ':',
            sample: localization["ioc-insert-table-link-sample"],
            icon: 'IocInsertTableLinkSyntax',
            category: localization["category-ioc"]
        },

        'InsertTextSyntax': {
            title: localization["ioc-insert-text-button"],
            open: '::text:\n  :title:\n',
            close: '\n:::',
            sample: localization["ioc-insert-text-sample"],
            icon: 'IocInsertTextSyntax',
            category: localization["category-ioc"]
        },

        'InsertTextLargeSyntax': {
            title: localization["ioc-insert-text-large-button"],
            open: '::text:\n  :title:\n  :large:\n',
            close: '\n:::',
            sample: localization["ioc-insert-text-large-sample"],
            icon: 'IocInsertTextLargeSyntax',
            category: localization["category-ioc"]
        },

        'InsertExampleSyntax': {
            title: localization["ioc-insert-example-button"],
            open: '::example:\n  :title:\n',
            close: '\n:::',
            sample: localization["ioc-insert-example-sample"],
            icon: 'IocInsertExampleSyntax',
            category: localization["category-ioc"]
        },

        'InsertNoteSyntax': {
            title: localization["ioc-insert-note-button"],
            open: '::note:\n',
            close: '\n:::',
            sample: localization["ioc-insert-note-sample"],
            icon: 'IocInsertNoteSyntax',
            category: localization["category-ioc"]
        },

        'InsertReferenceSyntax': {
            title: localization["ioc-insert-reference-button"],
            open: '::reference:\n',
            close: '\n:::',
            sample: localization["ioc-insert-reference-sample"],
            icon: 'IocInsertReferenceSyntax',
            category: localization["category-ioc"]
        },

        'InsertImportantSyntax': {
            title: localization["ioc-insert-important-button"],
            open: '::important:\n',
            close: '\n:::',
            sample: localization["ioc-insert-reference-sample"],
            icon: 'IocInsertImportantSyntax',
            category: localization["category-ioc"]
        },

        'InsertQuoteSyntax': {
            title: localization["ioc-insert-quote-button"],
            open: '::quote:\n',
            close: '\n:::',
            sample: localization["ioc-insert-quote-sample"],
            icon: 'IocInsertQuoteSyntax',
            category: localization["category-ioc"]
        },

        'InsertAccountingSyntax': {
            title: localization["ioc-insert-accounting-button"],
            open: '::accounting:\n  :title:\n  :footer:\n',
            close: '\n:::',
            sample: localization["ioc-insert-accounting-sample"],
            icon: 'IocInsertAccountingSyntax',
            category: localization["category-ioc"]
        },


        'HTMLBold': {
            title: localization["ioc-insert-bold-button"],
            open: '<strong>',
            close: '</strong>',
            sample: localization["ioc-insert-bold-button"],
            icon: 'IocBold',
        },

        'HTMLItalic': {
            title: localization["ioc-insert-italic-button"],
            open: '<em>',
            close: '</em>',
            sample: localization["ioc-insert-italic-button"],
            icon: 'IocItalic',
        },

        'HTMLUnderline': {
            title: localization["ioc-insert-underline-button"],
            open: '<ins>',
            close: '</ins>',
            sample: localization["ioc-insert-underline-button"],
            icon: 'IocUnderline',
        },

        'HTMLCode': {
            title: localization["ioc-insert-code-button"],
            open: '<code>',
            close: '</code>',
            sample: localization["ioc-insert-code-button"],
            icon: 'IocCode',
        },

        'HTMLStrikethrough': {
            title: localization["ioc-insert-strikethrough-button"],
            open: '<del>',
            close: '</del>',
            sample: localization["ioc-insert-strikethrough-button"],
            icon: 'IocStrikethrough',
        },

        'HTMLHeader1': {
            title: localization["ioc-insert-header1-button"],
            open: '<h1>',
            close: '</h1>',
            sample: localization["ioc-insert-header-sample"],
            icon: 'IocHeader1',
            category: localization["category-header"]
        },

        'HTMLHeader2': {
            title: localization["ioc-insert-header2-button"],
            open: '<h2>',
            close: '</h2>',
            sample: localization["ioc-insert-header-sample"],
            icon: 'IocHeader2',
            category: localization["category-header"]
        },

        'HTMLHeader3': {
            title: localization["ioc-insert-header3-button"],
            open: '<h3>',
            close: '</h3>',
            sample: localization["ioc-insert-header-sample"],
            icon: 'IocHeader3',
            category: localization["category-header"]
        },

        'HTMLHeader4': {
            title: localization["ioc-insert-header4-button"],
            open: '<h4>',
            close: '</h4>',
            sample: localization["ioc-insert-header-sample"],
            icon: 'IocHeader4',
            category: localization["category-header"]
        },

        'HTMLHeader5': {
            title: localization["ioc-insert-header5-button"],
            open: '<h5>',
            close: '</h5>',
            sample: localization["ioc-insert-header-sample"],
            icon: 'IocHeader5',
            category: localization["category-header"]
        },

        'HTMLHeader6': {
            title: localization["ioc-insert-header6-button"],
            open: '<h6>',
            close: '</h6>',
            sample: localization["ioc-insert-header-sample"],
            icon: 'IocHeader6',
            category: localization["category-header"]
        },

        'HTMLLink': {
            title: localization["ioc-insert-link-button"],
            open: '',
            close: '',
            sample: localization["ioc-insert-link-sample"],
            icon: 'IocLink',
        },

        'HTMLLinkExternal': {
            title: localization["ioc-insert-link-external-button"],
            open: '',
            close: '',
            sample: localization["ioc-insert-link-external-sample"],
            icon: 'IocLinkExternal',
        },

        'ReadonlyBlocksToggle': {
            type: localization["ioc-readonly-toggle"],
            title: localization["ioc-readonly-toggle"],
            icon: 'IocReadonly'
            // category: 'C',
        },

        'TableEditor': {
            type: localization["ioc-table-editor"],
            title: localization["ioc-table-editor"],
            icon: 'IocTable',
            category: 'WikiTable'
        },
        'TableEditorMultiline': {
            type: localization["ioc-table-editor-multiline"],
            title: localization["ioc-table-editor-multiline"],
            icon: 'IocTable',
            category: 'WikiTable'
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