define([
    'ioc/wiki30/manager/EventFactory',

    // Plugins
    'ioc/dokuwiki/editors/AceManager/plugins/AceFormat',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoFormat',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoReplaceFormat',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoFormatBlock',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoFormatCode',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoClearFormat',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoMediaFormatFigure',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoMediaFormatLateral',
    // 'ioc/dokuwiki/editors/DojoManager/plugins/DojoMediaFormat',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoInternalLink',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoPicker',

    'ioc/dokuwiki/editors/DojoManager/plugins/DojoTableCellMerge',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoTableDelete',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoTableInsert',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoToggleTableHeader',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoTableAlign',
    // 'ioc/dokuwiki/editors/DojoManager/plugins/DojoSound',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoWikiBlock',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoWikiSound',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoWikiLink',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoActionAddParagraph',

    'ioc/dokuwiki/editors/DojoManager/plugins/DojoComment',

    'ioc/dokuwiki/editors/DojoManager/plugins/DojoSafePaste',

    'ioc/dokuwiki/editors/AceManager/plugins/AceFireEvent',
    'ioc/dokuwiki/editors/AceManager/plugins/AceFireDojoEvent', // TODO: Fer versió pel dojo
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoFireEvent',

    'ioc/dokuwiki/editors/AceManager/plugins/AceDocumentPreview',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoDocumentPreview',

    // 'ioc/dokuwiki/editors/DojoManager/plugins/AceSwitchEditor', // TODO: Implementar!
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoSwitchEditor',

    'ioc/dokuwiki/editors/AceManager/plugins/AceEnableACE',
    'ioc/dokuwiki/editors/AceManager/plugins/AceEnableWrapper',

    'ioc/dokuwiki/editors/AceManager/plugins/AceLatexPreview',

    'ioc/dokuwiki/editors/AceManager/plugins/AceReadonlyBlocksToggle', // Test readonly
    'ioc/dokuwiki/editors/AceManager/plugins/AceTestReadonlyPlugin', // Test readonly

    'ioc/dokuwiki/editors/AceManager/plugins/AceTableEditorPlugin',
    'ioc/dokuwiki/editors/AceManager/plugins/AceSwitchEditorPlugin',


    'dijit/_editor/plugins/ViewSource',
    'dijit/_editor/plugins/LinkDialog',

    // Localització
    'dojo/i18n!ioc/dokuwiki/editors/nls/commands',


    // CSS
    'dojo/text!./../DojoManager/css/editorPlugins.css', // Copiat de dojox/editor/resources

], function (EventFactory, AceFormat, DojoFormat, DojoReplaceFormat, DojoFormatBlock, DojoFormatCode,
             DojoClearFormat,
             DojoMediaFormatFigure,
             DojoMediaFormatLateral,
             DojoInternalLink, DojoPicker,
             DojoTableCellMerge, DojoTableDelete,
             DojoTableInsert, DojoToggleTableHeader,
             DojoTableAlign,
             /*DojoSound, */
             DojoWikiBlock, DojoWikiSound, DojoWikiLink,
             DojoActionAddParagraph,
             DojoComment,
             DojoSafePaste,
             AceFireEvent, AceFireDojoEvent,
             DojoFireEvent, AceDocumentPreview, DojoDocumentPreview,
             /*AceSwitchEditor,*/ DojoSwitchEditor,
             AceEnableACE, AceEnableWrapper, AceLatexPreview, AceReadonlyBlocksToggle, AceTestReadonlyPlugin,
             AceTableEditor, AceSwitchEditor,
             ViewSource, LinkDialog,
             localization,
             editorPluginsCSS) {

    // Load required CSS
    var cssStyle = document.createElement('style');
    cssStyle.innerHTML = editorPluginsCSS;
    document.head.appendChild(cssStyle);


    var plugins = {
        'ACE': {
            'IocSoundFormatButton': AceFormat,
            // 'TestFormatButton' : AceFormat,
            'CancelButton': AceFireEvent,
            'SaveButton': AceFireEvent,
            'DocumentPreviewButton': AceDocumentPreview,
            // 'SwitchEditorButton': AceSwitchEditor, // TODO: Implementar
            'EnableACE': AceEnableACE,
            'EnableWrapper': AceEnableWrapper,
            'LatexPreview': AceLatexPreview,
            'CancelDialogEditorButton': AceFireDojoEvent,
            'SaveDialogEditorButton': AceFireDojoEvent,
            'TestReadonlyPlugin': AceTestReadonlyPlugin,
            'ReadonlyBlocksToggle': AceReadonlyBlocksToggle,
            'TableEditor': AceTableEditor,
            'TableEditorMultiline': AceTableEditor,
            'TableEditorAccounting': AceTableEditor,
            'SwitchEditorButton' : AceSwitchEditor
        },

        'Dojo': {
            'IocSoundFormatButton': DojoFormat,
            // 'TestFormatButton' : DojoFormat,
            'IocComment': DojoComment,
            'CancelButton': DojoFireEvent,
            'SaveButton': DojoFireEvent,
            'DocumentPreviewButton': DojoDocumentPreview,

            'SwitchEditorButton': DojoSwitchEditor,

            // Botons del desplegable IOC
            'NewContent': DojoFormat,
            // 'InsertFigureSyntax': DojoWikiBlock,
            'InsertFigureSyntax': DojoMediaFormatFigure,
            'InsertMediaSyntax': DojoMediaFormatLateral,
            //'InsertFigureLinkSyntax': DojoFormat,
            'InsertFigureLinkSyntax': DojoWikiLink,
            'InsertTableSyntax': DojoWikiBlock,
            // 'InsertTableLinkSyntax': DojoFormat,
            'InsertTableLinkSyntax': DojoWikiLink,
            'InsertTextSyntax': DojoWikiBlock,
            'InsertTextLargeSyntax': DojoWikiBlock,
            'InsertExampleSyntax': DojoWikiBlock,
            'InsertNoteSyntax': DojoWikiBlock,
            'InsertReferenceSyntax': DojoWikiBlock,
            'InsertImportantSyntax': DojoWikiBlock,
            'InsertQuoteSyntax': DojoWikiBlock,
            'InsertAccountingSyntax': DojoWikiBlock,

            // 'InsertMediaSyntax': DojoMediaFormat,
            'InsertInternalLinkSyntax': DojoInternalLink,
            'InsertSpecialCharacter': DojoPicker,
            'InsertHrSyntax': DojoFormatBlock,

            // Botons barra d'eines de dojo bàsics. Quan es retorna un string s'utilitza un dels plugins originals del Diit.Editor.
            'HTMLBold': 'bold',
            'HTMLItalic': 'italic',
            'HTMLUnderline': 'underline',
            'HTMLMonospace': DojoFormat,
            'HTMLCode': DojoFormatCode,
            'HTMLStrikethrough': 'strikethrough',
            'HTMLHeader0': DojoFormatBlock,
            'HTMLHeader1': DojoFormatBlock,
            'HTMLHeader2': DojoFormatBlock,
            'HTMLHeader3': DojoFormatBlock,
            'HTMLHeader4': DojoFormatBlock,
            'HTMLHeader5': DojoFormatBlock,
            //'HTMLHeader6': DojoFormat,
            'HTMLLink': DojoFormat,
            'HTMLLinkExternal': DojoFormat,

            'ViewSource': ViewSource,
            'ClearFormat': DojoClearFormat,

            'insertTable': DojoTableInsert,
            'ToggleTableHeader': DojoToggleTableHeader,
            'TableAlignLeft': DojoTableAlign,
            'TableAlignRight': DojoTableAlign,
            'TableAlignCenter': DojoTableAlign,
            'MergeCells': DojoTableCellMerge,
            'TableDelete': DojoTableDelete,

            'InsertSound': DojoWikiSound,

            'DojoSafePaste': DojoSafePaste,
            'DojoActionAddParagraph' : DojoActionAddParagraph

            // Aquests depenen del pluign 'LinkDialog', només cal que estigui carregat per habilitar-los
            // 'CreateLink' : 'createLink',
            // 'Unlink' : 'unlink',
            //
            // 'InsertOrderedList' : 'insertOrderedList',
            // 'InsertUnorderedList' :'insertUnorderedList'
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
    //  tableType: tipus de taula: 'normal', 'multiline' o 'accounting'
    //  empty: bool. Utilitzat per indicar que un block es de tipus buit (la línia horitzontal)

    //  prompt: frase a mostrar en els dialogs (si escau)
    //  htmlTemplate: templateHTML a utilitzar pels plugins dojo
    //  data: [{name, label, value, placeholder, type?, options?}] estructura de dades per crear dialegs d'entrada de
    //      dades per plugins (como el DojoWikiBlock). Type es opcional i per ara només discriminar per 'select' que
    //      indica que ha de ser un desplegable. En aquest cas alguns plugins s'utilitza l'atribut 'options' (altres
    //      el generan dinàmicament) per mostrar les opcions disponibles al desplegable.

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
            customEvent: {type: 'CancelDialog', data: {}},
            icon: 'IocBack',
            // category: 'A'
        },
        'SaveDialogEditorButton': {
            type: 'SaveDialogEditorButton',
            title: localization["save-button"],
            customEvent: {type: 'SaveDialog', data: {}},
            icon: 'IocSave',
            // category: 'A'
        },
        'IocSoundFormatButton': { // Pel AceEditor
            title: localization["ioc-sound-button"],
            open: '{{soundcloud>',
            close: '}}',
            sample: localization["ioc-sound-sample"],
            icon: 'IocSound',
            category: localization["category-ioc"]
        },


        'InsertSound': { // pel Dojo Editor
            title: localization["ioc-insert-sound-button"],
            prompt: localization["ioc-insert-sound-prompt"],
            icon: 'IocSound',

            data: [ // clau: etiqueta
                {
                    'name': 'id',
                    'label': 'Id',
                    'value': '',
                    'placeholder': localization["ioc-insert-sound-prompt"]
                }],

            htmlTemplate: '<div contenteditable="false" data-dw-block="sound" data-sound-id="${id}" data-ioc-id="ioc_sound_${id}" data-ioc-block-json="${json}">' +
            '<iframe width="100%" height="20" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/${id}?secret_token=none&color=%230066cc&inverse=false&auto_play=false&show_user=true"></iframe>' +
            '</div>',
            category: localization["category-ioc"]
        },


        'DocumentPreviewButton': {
            type: 'DocumentPreview',
            title: localization["document-preview"],
            icon: 'IocDocumentPreview',
            // category: 'B'
        },


        'SwitchEditorButton': {
            type: 'DocumentPreview',
            title: localization["switch-editor-dojo"],
            icon: 'IocSwitchEditorAce',
            // category: 'B'
        },



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

        'InsertFigureLinkSyntax': {
            title: localization["ioc-insert-figure-link-button"],
            prompt: localization["ioc-insert-figure-link-prompt"],
            targets: ['data-dw-box="figure"'],
            types: ['figure'],
            icon: 'IocInsertFigureLinkSyntax',
            category: localization["category-ioc"],
            htmlTemplate: '<a contenteditable="false" data-ioc-link="figure" data-ioc-id="ioc_link_figure_${id}" href="#${target}" data-ioc-block-json="${json}" title="${target}">${target}</a>&nbsp;',
            data: [
                {
                    'name': 'target',
                    'label': localization["ioc-insert-label-figure"],
                    'value': '',
                    'placeholder': localization["ioc-insert-placeholder-select"],
                    'type': 'select'
                }]
        },

        'InsertTableLinkSyntax': {
            title: localization["ioc-insert-table-link-button"],
            prompt: localization["ioc-insert-table-link-prompt"],
            //target: 'data-dw-box="table"',
            targets: ['data-dw-box="table"', 'data-dw-box="accounting"'],
            types: ['table', 'accounting'],
            icon: 'IocInsertTableLinkSyntax',
            category: localization["category-ioc"],
            htmlTemplate: '<a contenteditable="false" data-ioc-link="table" data-ioc-id="ioc_link_table_${id}" href="#${target}" data-ioc-block-json="${json}" title="${target}">${target}</a>&nbsp;', // si no afegim un espai no es pot continuar escrivint
            data: [
                {
                    'name': 'target',
                    'label': localization["ioc-insert-label-table"],
                    'value': '',
                    // 'placeholder': localization["ioc-insert-placeholder-select"],
                    'type': 'select',
                }]
        },


        // 'InsertMediaSyntax': {
        //     title: localization["ioc-insert-media-button"],
        //     icon: 'IocMedia',
        // },

        'InsertInternalLinkSyntax': {
            title: localization["ioc-insert-link-button"],
            icon: 'IocLink',
            'open': '[[',
            'close': ']]',
            'class': 'wikilink1' // ALERTA! aquestaclasse CSS es imprescindible per que funcionen els links AJAX
        },

        'InsertSpecialCharacter': {
            title: localization["ioc-insert-special-character-button"],
            icon: 'IocSpecialChars',
            class: 'symbols',
            list: ['À', 'à', 'Á', 'á', 'Â', 'â', 'Ã', 'ã', 'Ä', 'ä', 'Ǎ', 'ǎ', 'Ă', 'ă', 'Å', 'å', 'Ā', 'ā', 'Ą', 'ą', 'Æ', 'æ', 'Ć', 'ć', 'Ç', 'ç', 'Č', 'č', 'Ĉ', 'ĉ', 'Ċ', 'ċ', 'Ð', 'đ', 'ð', 'Ď', 'ď', 'È', 'è', 'É', 'é', 'Ê', 'ê', 'Ë', 'ë', 'Ě', 'ě', 'Ē', 'ē', 'Ė', 'ė', 'Ę', 'ę', 'Ģ', 'ģ', 'Ĝ', 'ĝ', 'Ğ', 'ğ', 'Ġ', 'ġ', 'Ĥ', 'ĥ', 'Ì', 'ì', 'Í', 'í', 'Î', 'î', 'Ï', 'ï', 'Ǐ', 'ǐ', 'Ī', 'ī', 'İ', 'ı', 'Į', 'į', 'Ĵ', 'ĵ', 'Ķ', 'ķ', 'Ĺ', 'ĺ', 'Ļ', 'ļ', 'Ľ', 'ľ', 'Ł', 'ł', 'Ŀ', 'ŀ', 'Ń', 'ń', 'Ñ', 'ñ', 'Ņ', 'ņ', 'Ň', 'ň', 'Ò', 'ò', 'Ó', 'ó', 'Ô', 'ô', 'Õ', 'õ', 'Ö', 'ö', 'Ǒ', 'ǒ', 'Ō', 'ō', 'Ő', 'ő', 'Œ', 'œ', 'Ø', 'ø', 'Ŕ', 'ŕ', 'Ŗ', 'ŗ', 'Ř', 'ř', 'Ś', 'ś', 'Ş', 'ş', 'Š', 'š', 'Ŝ', 'ŝ', 'Ţ', 'ţ', 'Ť', 'ť', 'Ù', 'ù', 'Ú', 'ú', 'Û', 'û', 'Ü', 'ü', 'Ǔ', 'ǔ', 'Ŭ', 'ŭ', 'Ū', 'ū', 'Ů', 'ů', 'ǖ', 'ǘ', 'ǚ', 'ǜ', 'Ų', 'ų', 'Ű', 'ű', 'Ŵ', 'ŵ', 'Ý', 'ý', 'Ÿ', 'ÿ', 'Ŷ', 'ŷ', 'Ź', 'ź', 'Ž', 'ž', 'Ż', 'ż', 'Þ', 'þ', 'ß', 'Ħ', 'ħ', '¿', '¡', '¢', '£', '¤', '¥', '€', '¦', '§', 'ª', '¬', '¯', '°', '±', '÷', '‰', '¼', '½', '¾', '¹', '²', '³', 'µ', '¶', '†', '‡', '·', '•', 'º', '∀', '∂', '∃', 'Ə', 'ə', '∅', '∇', '∈', '∉', '∋', '∏', '∑', '‾', '−', '∗', '×', '⁄', '√', '∝', '∞', '∠', '∧', '∨', '∩', '∪', '∫', '∴', '∼', '≅', '≈', '≠', '≡', '≤', '≥', '⊂', '⊃', '⊄', '⊆', '⊇', '⊕', '⊗', '⊥', '⋅', '◊', '℘', 'ℑ', 'ℜ', 'ℵ', '♠', '♣', '♥', '♦', 'α', 'β', 'Γ', 'γ', 'Δ', 'δ', 'ε', 'ζ', 'η', 'Θ', 'θ', 'ι', 'κ', 'Λ', 'λ', 'μ', 'Ξ', 'ξ', 'Π', 'π', 'ρ', 'Σ', 'σ', 'Τ', 'τ', 'υ', 'Φ', 'φ', 'χ', 'Ψ', 'ψ', 'Ω', 'ω', '★', '☆', '☎', '☚', '☛', '☜', '☝', '☞', '☟', '☹', '☺', '✔', '✘', '„', '“', '”', '‚', '‘', '’', '«', '»', '‹', '›', '—', '–', '…', '←', '↑', '→', '↓', '↔', '⇐', '⇑', '⇒', '⇓', '⇔', '©', '™', '®', '′', '″', '[', ']', '{', '}', '~', '(', ')', '%', '§', '$', '#', '|', '@']

        },

        'InsertHrSyntax': {
            title: localization["ioc-insert-hr-button"],
            tag: 'hr',
            sample: localization["ioc-insert-hr-button"],
            icon: 'IocHr',
            empty: true
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

        'HTMLMonospace': {
            title: localization["ioc-insert-monospace-button"],
            open: '<code>',
            close: '</code>',
            sample: localization["ioc-insert-monospace-button"],
            icon: 'IocMonospace',
            tag: 'code'
        },

        'HTMLCode': {
            title: localization["ioc-insert-code-button"],
            tags: ['pre', 'code'],
            sample: localization["ioc-insert-code-button"],
            icon: 'IocCode'
        },

        'HTMLStrikethrough': {
            title: localization["ioc-insert-strikethrough-button"],
            open: '<del>',
            close: '</del>',
            sample: localization["ioc-insert-strikethrough-button"],
            icon: 'IocStrikethrough',
        },

        'HTMLHeader0': {
            title: localization["ioc-insert-header0-button"],
            open: '<p>',
            close: '</p>',
            sample: '',
            icon: 'IocHeader0',
            category: localization["category-header"]
        },

        'HTMLHeader1': {
            title: localization["ioc-insert-header1-button"],
            open: '<h1>',
            close: '</h1>',
            sample: localization["ioc-insert-header-sample"],
            icon: 'IocHeader1',
            category: localization["category-header"],
            tag: 'h1',
            groupPattern: 'h.\d?',
            clearFormat: true
        },

        'HTMLHeader2': {
            title: localization["ioc-insert-header2-button"],
            open: '<h2>',
            close: '</h2>',
            sample: localization["ioc-insert-header-sample"],
            icon: 'IocHeader2',
            category: localization["category-header"],
            tag: 'h2',
            groupPattern: 'h.\d?',
            clearFormat: true

        },

        'HTMLHeader3': {
            title: localization["ioc-insert-header3-button"],
            open: '<h3>',
            close: '</h3>',
            sample: localization["ioc-insert-header-sample"],
            icon: 'IocHeader3',
            category: localization["category-header"],
            tag: 'h3',
            groupPattern: 'h.\d?',
            clearFormat: true
        },

        'HTMLHeader4': {
            title: localization["ioc-insert-header4-button"],
            open: '<h4>',
            close: '</h4>',
            sample: localization["ioc-insert-header-sample"],
            icon: 'IocHeader4',
            category: localization["category-header"],
            tag: 'h4',
            groupPattern: 'h.\d?',
            clearFormat: true
        },

        'HTMLHeader5': {
            title: localization["ioc-insert-header5-button"],
            open: '<h5>',
            close: '</h5>',
            sample: localization["ioc-insert-header-sample"],
            icon: 'IocHeader5',
            category: localization["category-header"],
            tag: 'h5',
            groupPattern: 'h.\d?',
            clearFormat: true
        },

        'HTMLLinkExternal': {
            title: localization["ioc-insert-link-external-button"],
            open: '',
            close: '',
            sample: localization["ioc-insert-link-external-sample"],
            icon: 'IocLinkExternal',
        },

        'ReadonlyBlocksToggle': {
            type: 'ReadonlyBlocksToggle',
            title: localization["ioc-readonly-toggle"],
            icon: 'IocReadonly'
            // category: 'C',
        },

        'DojoActionAddParagraph': {
            type: 'DojoActionAddParagraph',
            label: localization["ioc-action-add-paragraph"],
            placeholder: localization["ioc-action-add-paragraph-placeholder"],
            // category: 'C',
        },

        'TableEditor': {
            type: 'TableEditor',
            title: localization["ioc-table-editor"],
            icon: 'IocTable',
            category: 'WikiTable',
            tableType: 'normal',
            boxType: 'table',
        },
        'TableEditorMultiline': {
            type: 'TableEditorMultiline',
            title: localization["ioc-table-editor-multiline"],
            icon: 'IocTable',
            category: 'WikiTable',
            tableType: 'multiline',
            boxType: 'table',
        },
        'TableEditorAccounting': {
            type: 'TableEditorAccounting',
            title: localization["ioc-table-editor-accounting"],
            icon: 'IocTable',
            category: 'WikiTable',
            tableType: 'accounting',
            boxType: 'accounting',
        },

        'ViewSource': {
            type: 'ViewSource',
            title: localization["view-source"],
            icon: 'ViewSource',
        },


        'ClearFormat': {
            type: 'ClearFormat',
            title: localization["clear-format"],
            icon: 'ClearFormat',
        },

        'ToggleTableHeader': {
            type: 'ToggleTableHeader',
            title: localization["table-toggle-header"],
            icon: 'IocToggleTableHeader',
        },

        'TableAlignLeft': {
            type: 'TableAlign',
            title: localization["table-align-left"],
            icon: 'IocTableAlignLeft', // TODO: Canviar icona
            align: 'left'
        },

        'TableAlignRight': {
            type: 'TableAlign',
            title: localization["table-align-right"],
            icon: 'IocTableAlignRight', // TODO: Canviar icona
            align: 'right'
        },

        'TableAlignCenter': {
            type: 'TableAlign',
            title: localization["table-align-center"],
            icon: 'IocTableAlignCenter', // TODO: Canviar icona
            align: 'center'
        },

        'insertTable': {
            type: 'insertTable',
            title: localization["table-insert"],
            icon: 'IocInsertTable',
        },

        'MergeCells': {
            type: 'MergeCells',
            title: localization["merge-cells"],
            icon: 'IocMergeCell',
        },

        'TableDelete': {
            type: 'TableDelete',
            title: localization["table-delete"],
            icon: 'IocTableDelete',
        },

        'InsertMediaSyntax': {
            title: localization["ioc-insert-media-button"],
            prompt: localization["ioc-insert-figure-prompt"],
            data: [
                {
                    'name': 'title',
                    'label': localization["ioc-insert-label-title"],
                    'value': '',
                    'placeholder': localization["ioc-insert-placeholder-title"],
                },
                {
                    'name': 'image',
                    'type': 'image',
                    'label': localization["ioc-insert-media-button"],
                }
            ],
            htmlTemplate: '<div class="imgb" data-dw-lateral="image" data-ioc-id="ioc_figure_${id}">'
            + '<img src="${image}" class="media" title="${title}" alt="${title}" width="200"/>'
            + '<div class="title">${title}</div>'
            + '</div>',
            icon: 'IocMedia',
            category: localization["category-ioc"]
        },

        'InsertFigureSyntax': {
            title: localization["ioc-insert-figure-button"],
            prompt: localization["ioc-insert-figure-prompt"],
            sample: localization["ioc-insert-figure-sample"],
            data: [
                {
                    'name': 'id',
                    'label': localization["ioc-insert-label-id"],
                    'value': '',
                    'placeholder': localization["ioc-insert-placeholder-id"]
                },
                {
                    'name': 'title',
                    'label': localization["ioc-insert-label-title"],
                    'value': '',
                    'placeholder': localization["ioc-insert-placeholder-title"],
                },
                {
                    'name': 'footer',
                    'label': localization["ioc-insert-label-footer"],
                    'value': '',
                    'placeholder': localization["ioc-insert-placeholder-footer"],
                },
                {
                    'name': 'image',
                    'type': 'image',
                    'label': localization["ioc-insert-media-button"],
                }
            ],
            htmlTemplate: '<div class="iocfigure" data-dw-box="figure" data-ioc-id="ioc_figure_${id}" data-ioc-figure data-ioc-block-json="${json}">' +
            '<div class="iocinfo"><a id="${id}" data-dw-link="figure"><strong contenteditable="false" data-dw-field="id">ID:</strong> ${id}<br></a>' +
            '<strong contenteditable="false" data-dw-field="title">Títol:</strong> ${title}<br>' +
            '<strong contenteditable="false" data-dw-field="footer">Peu:</strong> ${footer}<br>' +
            '</div>' +
            //'<div data-dw-figure contenteditable="false" style="text-align: center; margin:0 auto;"></div>' +
            '</div>',
            icon: 'IocInsertFigureSyntax',
            category: localization["category-ioc"]
        },


        'InsertTableSyntax': {
            title: localization["ioc-insert-table-button"],
            prompt: localization["ioc-insert-table-prompt"],
            sample: localization["ioc-insert-table-sample"],
            data: [
                {
                    'name': 'id',
                    'label': localization["ioc-insert-label-id"],
                    'value': '',
                    'placeholder': localization["ioc-insert-placeholder-id"]
                },
                {
                    'name': 'title',
                    'label': localization["ioc-insert-label-title"],
                    'value': '',
                    'placeholder': localization["ioc-insert-placeholder-title"],
                },
                {
                    'name': 'footer',
                    'label': localization["ioc-insert-label-footer"],
                    'value': '',
                    'placeholder': '',
                }
            ],
            htmlTemplate: '<div class="ioctable" data-dw-box="figure" data-ioc-id="ioc_table_${id}" data-ioc-table data-ioc-block-json="${json}">' +
            '<div class="iocinfo" contenteditable="false"><a id="${id}" data-dw-link="table"><strong contenteditable="false">ID:</strong> ${id}<br></a>' +
            '<strong contenteditable="false">Títol:</strong> <span>${title}</span><br>' +
            '<strong contenteditable="false">Peu:</strong> ${footer}</br>' +
            '</div>' +
            '<p class="editable-text">' + localization["ioc-insert-table-sample"] + '</p>' +
            '</div>',

            icon: 'IocInsertTableSyntax',
            category: localization["category-ioc"],
            boxType: 'tables',
        },

        'InsertAccountingSyntax': {
            title: localization["ioc-insert-accounting-button"],
            prompt: localization["ioc-insert-accounting-prompt"],
            sample: localization["ioc-insert-accounting-sample"],
            data: [
                {
                    'name': 'id',
                    'label': localization["ioc-insert-label-id"],
                    'value': '',
                    'placeholder': localization["ioc-insert-placeholder-id"]
                },
                {
                    'name': 'title',
                    'label': localization["ioc-insert-label-title"],
                    'value': '',
                    'placeholder': localization["ioc-insert-placeholder-title"],
                },
                {
                    'name': 'footer',
                    'label': localization["ioc-insert-label-footer"],
                    'value': '',
                    'placeholder': localization["ioc-insert-placeholder-footer"],
                }
            ],
            htmlTemplate: '<div class="iocaccounting" data-ioc-id="ioc_accounting_${id}" data-ioc-table data-ioc-block-json="${json}">' +
            '<div class="iocinfo" contenteditable="false"><a id="${id}" ><strong>ID:</strong> ${id}<br></a>' +
            '<strong>Títol:</strong> <span>${title}</span><br>' +
            '<strong>Peu:</strong> ${footer}</br>' +
            '</div>' +
            '<p class="editable-text">' + localization["ioc-insert-accounting-sample"] + '</p>' +
            '</div>',

            icon: 'IocInsertAccountingSyntax',
            category: localization["category-ioc"],
            boxType: 'accounting',
        },

        'InsertTextSyntax': {
            title: localization["ioc-insert-text-button"],
            prompt: localization["ioc-insert-text-prompt"],
            sample: localization["ioc-insert-text-sample"],
            data: [{
                'name': 'title',
                'label': 'Títol',
                'value': '',
                'placeholder': 'Introduceix el títol'
            }],
            htmlTemplate: '<div class="ioctext" data-dw-box-text="text" data-ioc-id="ioc_text_${id}" data-ioc-text data-ioc-block-json="${json}">' +
            '<div class="ioccontent">' +
            '<p class="ioctitle" data-dw-field="title" data-ioc-optional>${title}</p>' +
            '<p class="editable-text">' + localization["ioc-insert-text-sample"] + '</p>' +
            '</div></div>',
            icon: 'IocInsertTextSyntax',
            category: localization["category-ioc-style"]
        },


        'InsertTextLargeSyntax': {
            title: localization["ioc-insert-text-large-button"],
            prompt: localization["ioc-insert-text-large-prompt"],
            sample: localization["ioc-insert-text-large-sample"],
            data: [{
                'name': 'title',
                'label': localization["ioc-insert-label-title"],
                'value': '',
                'placeholder': localization["ioc-insert-placeholder-title"],
            }],
            htmlTemplate: '<div class="ioctextl" data-dw-box-text="textl" data-ioc-id="ioc_textl_${id}" data-ioc-textl data-ioc-block-json="${json}">' +
            '<div class="ioccontent">' +
            '<p class="ioctitle" data-dw-field="title" data-ioc-optional>${title}</p>' +
            '<p class="editable-text">' + localization["ioc-insert-text-large-sample"] + '</p>' +
            '</div></div>',
            icon: 'IocInsertTextLargeSyntax',
            category: localization["category-ioc-style"]
        },

        'InsertExampleSyntax': {
            title: localization["ioc-insert-example-button"],
            prompt: localization["ioc-insert-example-prompt"],
            sample: localization["ioc-insert-example-sample"],
            data: [{
                'name': 'title',
                'label': localization["ioc-insert-label-title"],
                'value': '',
                'placeholder': localization["ioc-insert-placeholder-title"],
            }],
            htmlTemplate: '<div class="iocexample" data-dw-box-text="example" data-ioc-id="ioc_example_${id}" data-ioc-example data-ioc-block-json="${json}">' +
            '<div class="ioccontent">' +
            '<p class="ioctitle" data-dw-field="title" data-ioc-optional>${title}</p>' +
            '<p class="editable-text">' + localization["ioc-insert-example-sample"] + '</p>' +
            '</div></div>',
            icon: 'IocInsertExampleSyntax',
            category: localization["category-ioc-style"]
        },

        'InsertNoteSyntax': {
            title: localization["ioc-insert-note-button"],
            // prompt: localization["ioc-insert-note-prompt"],
            sample: localization["ioc-insert-note-sample"],
            data: [],
            htmlTemplate: '<div class="iocnote" data-dw-box-text="note" data-ioc-id="ioc_note_${id}" data-ioc-note data-ioc-block-json="${json}">' +
            '<div class="ioccontent">' +
            '<p class="editable-text">' + localization["ioc-insert-note-sample"] + '</p>' +
            '</div></div>',
            icon: 'IocInsertNoteSyntax',
            category: localization["category-ioc-style"]
        },

        'InsertReferenceSyntax': {
            title: localization["ioc-insert-reference-button"],
            //prompt: localization["ioc-insert-reference-prompt"],
            sample: localization["ioc-insert-reference-sample"],
            data: [],
            htmlTemplate: '<div class="iocreference" data-dw-box-text="reference" data-ioc-id="ioc_reference_${id}" data-ioc-reference data-ioc-block-json="${json}">' +
            '<div class="ioccontent">' +
            '<p class="editable-text">' + localization["ioc-insert-reference-sample"] + '</p>' +
            '</div></div>',
            icon: 'IocInsertReferenceSyntax',
            category: localization["category-ioc-style"]
        },

        'InsertImportantSyntax': {
            title: localization["ioc-insert-important-button"],
            //prompt: localization["ioc-insert-important-prompt"],
            sample: localization["ioc-insert-important-sample"],
            data: [],
            htmlTemplate: '<div class="iocimportant" data-dw-box-text="reference" data-ioc-id="ioc_important_${id}" data-ioc-important data-ioc-block-json="${json}">' +
            '<div class="ioccontent">' +
            '<p class="editable-text">' + localization["ioc-insert-important-sample"] + '</p>' +
            '</div></div>',
            icon: 'IocInsertImportantSyntax',
            category: localization["category-ioc-style"]
        },

        'InsertQuoteSyntax': {
            title: localization["ioc-insert-quote-button"],
            //prompt: localization["ioc-insert-quote-prompt"],
            sample: localization["ioc-insert-quote-sample"],
            data: [],
            htmlTemplate: '<div class="iocquote" data-dw-box-text="quote" data-ioc-id="ioc_quote_${id}" data-ioc-important data-ioc-block-json="${json}">' +
            '<div class="ioccontent">' +
            '<p class="editable-text">' + localization["ioc-insert-quote-sample"] + '</p>' +
            '</div></div>',
            icon: 'IocInsertQuoteSyntax',
            category: localization["category-ioc-style"]
        },

        'DojoSafePaste': {
            type: 'DojoSafePaste',
            // title: localization["clear-format"],
            // icon: 'ClearFormat',
        },

    };


    var getPlugin = function (name, editorType) {
        // console.log("PluginFactory#getPlugin", name, editorType, plugins);

        if (plugins[editorType][name]) {
            return {
                plugin: plugins[editorType][name],
                config: config[name] || {}
            };
        }

        // Si el nom no existeix retorna el nom del plugin, això permet reutilizar els plugins de Dojo que no
        // requereixen configuració sense afegir-los manualment
        return name;
        // return null;
    };


    return {
        getPlugin: getPlugin
    };

});