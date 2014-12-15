define([
    'dojo/ready',
    "dijit/registry",
    'dojo/dom',
    'ioc/dokuwiki/AceManager/IocAceEditor',
    'ioc/dokuwiki/AceManager/IocAceMode',
    'ioc/dokuwiki/AceManager/IocRuleSet',
    'ioc/dokuwiki/AceManager/AceWrapper',
    'ioc/dokuwiki/AceManager/DokuWrapper',
    'ioc/dokuwiki/AceManager/Container',
    'ioc/dokuwiki/AceManager/Toggle',
    'ioc/dokuwiki/AceManager/IocCommands',

    // Només cal carregar els modes que s'han d'incloure
    "ace-builds/mode-markdown",
    "ace-builds/mode-latex",
    "ace-builds/mode-java",
    "ace-builds/mode-javascript",
    //"ace-builds/mode-php",
    "ioc/dokuwiki/underscore",


], function (ready, registry, dom, IocAceEditor, IocAceMode, IocRuleSet, AceWrapper, DokuWrapper, Container, Toggle, IocCommands) {
    var instanciesCreades = 0;

    return function (params) {
        console.log(params)

        instanciesCreades++;
        alert(instanciesCreades);


        // TODO: substituir totes les referencies a wiki__text per params.textAreaId

        // Comprovem la versió del explorador i que existeix l'entorn de la dokuwiki abans de fer res
        if (/MSIE [0-8]\./.test(navigator.userAgent) || !(window.JSINFO && document.getElementById('wiki__text'))) {
            return;
        }

        var lang_rules = {
                // TODO Eliminar aquests llenguatges, es només una demostració
                //java:       ace.require("ace/mode/java_highlight_rules").JavaHighlightRules,
                javascript: ace.require("ace/mode/javascript_highlight_rules").JavaScriptHighlightRules
            },
            iocAceMode = new IocAceMode({
                //xmlTags:          ['alumne', 'professor'], // TODO Eliminar, només per fer proves
                baseHighlighters: lang_rules,
                ruleSets:         [new IocRuleSet()],
                xmlTags: JSINFO.plugin_aceeditor.xmltags
            }),
            mode = iocAceMode.getMode(),

            iocAceEditor = new IocAceEditor({
                mode:        mode,
                containerId: "editor",

                // TODO Reactivar al integrar
                theme:       JSINFO.plugin_aceeditor.colortheme,
                readOnly:    jQuery(document.getElementById('wiki__text')).attr('readonly'),
                wraplimit:   JSINFO.plugin_aceeditor.wraplimit,
                wrapMode: jQuery(document.getElementById('wiki__text')).attr('wrap') !== 'off',
                mdpage:      JSINFO.plugin_aceeditor.mdpage // TODO no he trobat on es fa servir aquesta propietat
            }),

            aceWrapper = new AceWrapper(iocAceEditor),

            dokuWrapper = new DokuWrapper(aceWrapper),

            container = new Container(aceWrapper, dokuWrapper),

            toggle = new Toggle(container),

            user_editing = false,

            commands,

            preview; // TODO en una propera tasca


        // Inicialitzem l'editor
        iocAceEditor.init();

        // No es poden afegir els comandaments fins que no s'a inicialitzat l'editor
        commands = new IocCommands(aceWrapper);

        // TODO: Eliminar aquesta etiqueta de prova externa
        mode = iocAceMode.getMode(); // S'ha de tornar a generar el mode


        // COMPTA: Fins que no s'ha inicialitzat l'editor no es possible afegir noves regles
        iocAceEditor.setMode(mode);

        // TODO: Eliminar, només es fan servir per les proves
        iocAceEditor.setDocumentChangeCallback(function () {
        });

        // TODO: Eliminar, aquest codi fa que es mostri el state de la línia actual
        iocAceEditor.setChangeCursorCallback(
            function () {
                var currline = iocAceEditor.editor.getSelectionRange().start.row;
                console.log(iocAceEditor.session.getState(currline));
            }
        );

        // TODO en una propera tasca
        iocAceEditor.setDocumentChangeCallback(function () {
            if (user_editing) {
                dokuWrapper.text_changed();
                //preview.trigger();
                commands.hide_menu();
            }
        });

        // TODO en una propera tasca
        iocAceEditor.setChangeCursorCallback(function () {
            //preview.trigger();
            commands.hide_menu();
        });

        if (JSINFO.plugin_aceeditor["default"] ||
            (dokuWrapper.get_cookie('aceeditor') != null && dokuWrapper.get_cookie('aceeditor') !== 'off')) {
            toggle.enable();
        }

        toggle.enable();


        var wg = registry.byId(params.buttonId)

        wg.putClickListener(params.key, function () {
            if (dokuWrapper.get_cookie('aceeditor')
                && dokuWrapper.get_cookie('aceeditor') !== 'off') {
                var textArea = dom.byId(params.textAreaId);
                textArea.value = aceWrapper.get_value();
            }

            console.log(dokuWrapper.get_cookie('aceeditor'));
        });

        console.log("Carregat en " + (new Date().getTime() - inici));

        return {
            dokuWrapper: dokuWrapper,
            containerId: container,
            toggle:      toggle,
            ace:         aceWrapper,
            preview:     preview,
            commands:    commands
        }
    };
});

