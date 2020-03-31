define(

    ({
        // Toolbar buttons
        'cancel-button': 'Tornar',
        'save-button': 'Desar',
        'document-preview': 'Previsualitzar el document',
        'switch-editor-ace': 'Canviar a editor ACE',
        'switch-editor-dojo': 'Canviar a editor HTML',

        'enable-ace': 'Activar/Desactivar ACE',
        'enable-wrapper' : 'Activar/Desactivar embolcall',

        // Categories
        'category-ioc': 'Elements',
        'category-ioc-style': 'Estils',
        'category-header': 'Capçalera',
        'category-WikiTable': 'Taules',

        // Comments Plugin
        'ioc-comment-button': 'Afegir comentari',
        // 'replybutton': 'Respon',
        // 'addcommentbutton': 'Afegir',
        // 'addcommenttitle': 'Afegir un comentari',
        'ioc-comment-resolve-title': 'Elimina el comentari',
        'ioc-comment-resolve-button' : 'Resol',
        'ioc-comment-textarea-placeholder' : 'Escriu un comentari',
        'ioc-comment-reply-title' : 'Afegir un comentari',
        'ioc-comment-reply-button' : "Respon",
        'ioc-comment-save-button': 'Desar',
        'ioc-comment-cancel-button': 'Cancel·lar',

        // IOC Sound Plugin
        'ioc-sound-button': 'Afegir so',
        'ioc-sound-sample': 'identificador del so:clau',


        // Latex Preview Plugin
        'ioc-latex-preview': 'Previsualització Latex',

        // Botons Estils IOC
        'ioc-new-content-button': 'Nou contingut',
        'ioc-new-content-sample': 'Incloure contingut nou',

        'ioc-insert-figure-button': 'Afegir figura',
        'ioc-insert-figure-sample': 'Incloure la figura',

        'ioc-insert-figure-link-button': 'Enllaç a figura',
        'ioc-insert-figure-link-sample': 'Incloure enllaç a figura',

        'ioc-insert-table-button': 'Taula',
        'ioc-insert-table-sample': 'Incloure taula',

        'ioc-insert-table-link-button': 'Enllaç a taula',
        'ioc-insert-table-link-sample': 'Incloure enllaç a taula',

        'ioc-insert-text-button': 'Text complementari',
        'ioc-insert-text-sample': 'Incloure text complementari',

        'ioc-insert-text-large-button': 'Text complementari llarg',
        'ioc-insert-text-large-sample': 'Incloure text complementari llarg',

        'ioc-insert-example-button': 'Exemple',
        'ioc-insert-example-sample': 'Incloure exemple',

        'ioc-insert-note-button': 'Nota',
        'ioc-insert-note-sample': 'Incloure nota',

        'ioc-insert-reference-button': 'Referència',
        'ioc-insert-reference-sample': 'Incloure referència',

        'ioc-insert-important-button': 'Important',
        'ioc-insert-important-sample': 'Incloure text important',

        'ioc-insert-quote-button': 'Citació',
        'ioc-insert-quote-sample': 'Incloure citació',


        // 'ioc-insert-accounting-button': 'Sintaxi d\'assentament contable',
        // 'ioc-insert-accounting-sample': 'Incloure la sintaxis d\'un assentament contable',


        // Basic toolbar butons

        'ioc-insert-bold-button' : 'Negreta',
        'ioc-insert-bold-sample' : 'Negreta',
        'ioc-insert-italic-button' : 'Cursiva',
        'ioc-insert-italic-sample' : 'Cursiva',
        'ioc-insert-underline-button' : 'Subratllat',
        'ioc-insert-underline-sample' : 'Subratllat',
        'ioc-insert-monospace-button' : 'Monoespai',
        'ioc-insert-monospace-sample' : 'Monoespai',
        'ioc-insert-code-button' : 'Bloc de Codi',
        'ioc-insert-code-sample' : 'Bloc de Codi',
        'ioc-insert-strikethrough-button' : 'Text barrat',
        'ioc-insert-strikethrough-sample' : 'Text barrat',
        'ioc-insert-link-button' : 'Enllaç intern',
        'ioc-insert-link-sample' : 'Enllaç intern',
        'ioc-insert-link-external-button' : 'Enllaç extern',
        'ioc-insert-link-external-sample' : 'Enllaç extern',

        'ioc-insert-special-character-button': 'Caràcters especials',
        'ioc-insert-media-button': 'Afegeix imatges',
        'ioc-insert-hr-button': 'Ratlla horitzontal',



        'ioc-insert-header-sample': 'Encapçalament',
        'ioc-insert-header0-button': 'Elimina caçalera',
        'ioc-insert-header1-button': 'Sintaxi d\'encapçalament nivell 1',
        'ioc-insert-header2-button': 'Sintaxi d\'encapçalament nivell 2',
        'ioc-insert-header3-button': 'Sintaxi d\'encapçalament nivell 3',
        'ioc-insert-header4-button': 'Sintaxi d\'encapçalament nivell 4',
        'ioc-insert-header5-button': 'Sintaxi d\'encapçalament nivell 5',
        'ioc-insert-header6-button': 'Sintaxi d\'encapçalament nivell 6',


        'ioc-readonly-toggle': 'Activa/Desactiva blocs de només lectura',

        'ioc-table-editor':  'Editor de taules',
        'ioc-table-editor-multiline':  'Editor de taules multilínia',
        'ioc-table-editor-accounting':  'Editor de taules accounting',

        'table-insert': 'Insertar taula',
        'table-toggle-header' : 'Alternar entre cel·la i capçalera',
        'table-align-right' : 'Aliniar cel·la a la dreta',
        'table-align-left' : 'Aliniar cel·la a la esquerra',
        'table-align-center' : 'Aliniar cel·la al centre',
        'merge-cells': 'Fusionar cel·les',
        'table-delete': 'Eliminar taula',

        'delete': 'Eliminar',
        'confirm-delete': 'Estàs segur que vols eliminar',

        'ioc-insert-sound-button': 'Insertar so',
        // 'ioc-insert-sound-sample': 'identificador_so',
        'ioc-insert-sound-prompt': 'Introdueix l\'identificador del so:',

        'ioc-insert-figure-prompt': 'Introdueix les dades de la figura:',

        'ioc-insert-label-id': 'Id',
        'ioc-insert-placeholder-id': 'Introduceix l\'identificador',

        'ioc-insert-label-title': 'Title',
        'ioc-insert-placeholder-title': 'Introdueix el títol',

        'ioc-insert-label-footer': 'Footer',
        'ioc-insert-placeholder-footer': 'Introdueix el peu',

        'ioc-insert-table-prompt': 'Introdueix les dades de la taula:',

        'ioc-insert-accounting-prompt': 'Introdueix les dades de la taula de contabilitat:',

        'ioc-insert-text-prompt' : 'Introdueix el títol:',
        'ioc-insert-text-large-prompt': 'Introdueix el títol:',
        'ioc-insert-example-prompt': 'Introdueix el títol:',

        // 'ioc-insert-placeholder-select': '-- Selecciona un element --',
        'ioc-insert-label-table': 'Selecciona una taula de la llista',
        'ioc-insert-label-figure': 'Selecciona una figura de la llista',

        'ioc-insert-figure-link-prompt': 'Afegeix un enllaç a una figura.',
        'ioc-insert-table-link-prompt': 'Afegeix un enllaç a una taula.',

        'clear-format' : 'Elimina el format',

        'ioc-action-add-paragraph' : 'Afegeix paràgraf buit',
        'ioc-action-add-paragraph-placeholder' : '',
    })
);

