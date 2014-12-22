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
    'ioc/wiki30/GlobalState',
    'ioc/wiki30/dispatcherSingleton',

    // Només cal carregar els modes que s'han d'incloure
    "ace-builds/mode-markdown",
    "ace-builds/mode-latex",
    "ace-builds/mode-java",
    "ace-builds/mode-javascript",
    //"ace-builds/mode-php",
    "ioc/dokuwiki/underscore",


], function (ready, registry, dom, IocAceEditor, IocAceMode, IocRuleSet, AceWrapper, DokuWrapper, Container, Toggle, IocCommands, GlobalState, Dispatcher) {
    var editorsCarregats = {};

    return function (params) { 

        // Comprovem la versió del explorador i que existeix l'entorn de la dokuwiki abans de fer res
        if (/MSIE [0-8]\./.test(navigator.userAgent) || !(window.JSINFO && document.getElementById(params.textAreaId))) {
            return;
        }

        var currentEditor = Dispatcher.getContentCache(params.id).getEditor();

        var lang_rules = {
                // TODO Eliminar aquests llenguatges, es només una demostració
                //java:       ace.require("ace/mode/java_highlight_rules").JavaHighlightRules,
                javascript: ace.require("ace/mode/javascript_highlight_rules").JavaScriptHighlightRules
            },

            iocAceMode = new IocAceMode({
                //xmlTags:          ['alumne', 'professor'], // TODO Eliminar, només per fer proves
                baseHighlighters: lang_rules,
                ruleSets:         [new IocRuleSet()],
                xmlTags:          JSINFO.plugin_aceeditor.xmltags
            }),

            mode = iocAceMode.getMode(),

            iocAceEditor = new IocAceEditor({
                mode:        mode,
                containerId: "editor" + params.id,

                // TODO Reactivar al integrar
                theme:       JSINFO.plugin_aceeditor.colortheme,
                readOnly:    jQuery(document.getElementById(params.textAreaId)).attr('readonly'),
                wraplimit:   JSINFO.plugin_aceeditor.wraplimit,
                wrapMode:    jQuery(document.getElementById(params.textAreaId)).attr('wrap') !== 'off',
                mdpage:      JSINFO.plugin_aceeditor.mdpage // TODO no he trobat on es fa servir aquesta propietat
            }),

            aceWrapper = new AceWrapper(iocAceEditor),

            dokuWrapper = new DokuWrapper(aceWrapper, '', params.id),

            container = new Container(aceWrapper, dokuWrapper, currentEditor),

            toggle = new Toggle(container),

            user_editing = false,

            commands,

            preview, // TODO en una propera tasca

            editor;


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
        /*
        iocAceEditor.setChangeCursorCallback(
            function () {
                var currline = iocAceEditor.editor.getSelectionRange().start.row;
                console.log(iocAceEditor.session.getState(currline));
            }
        );*/

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




        var wg = registry.byId(params.buttonId)
        
        wg.putClickListener(params.key, function () {

            if (dokuWrapper.get_cookie('aceeditor')
                && dokuWrapper.get_cookie('aceeditor') !== 'off') {
                var textArea = dom.byId(params.textAreaId),
                    id = GlobalState.getCurrentId(),
                    editor = Dispatcher.getContentCache(id).getEditor();
                textArea.value = editor.getAceValue();
            }
        });





        Dispatcher.getContentCache(params.id).setEditor(container);


        var enable = function () {
                var id = GlobalState.getCurrentId(),
                    selection,
                    container = Dispatcher.getContentCache(id).getEditor(),
                    ace = container.aceWrapper,
                    doku = container.dokuWrapper;

                selection = doku.get_selection();
                doku.disable();
                container.set_height(doku.inner_height());
                container.show();
                //this.on();
                ace.set_value(doku.get_value());
                ace.resize();
                ace.focus();
                ace.set_selection(selection.start, selection.end);
                //user_editing = true; // TODO comprovar on s'ha d'actualitzar aquest valor i per a que es fa servir --> Es fa servir a la funció callback que es passa al AceEditor
                //doku.set_cookie('aceeditor-' + id, 'on');
                doku.set_cookie('aceeditor', 'on');
                Dispatcher.getContentCache(id).setAceEditorOn(true);

                //console.log('aceeditor-'+id);
                //console.log(doku.get_cookie('aceeditor-'+id));

            },

            disable = function () {
                var id = GlobalState.getCurrentId(),
                    selection,
                    container = Dispatcher.getContentCache(id).getEditor(),
                    ace = container.aceWrapper,
                    doku = container.dokuWrapper;

                selection = ace.get_selection();
                //user_editing = false; // TODO comprovar on s'ha d'actualitzar aquest valor i per a que es fa servir --> Es fa servir a la funció callback que es passa al AceEditor

                Dispatcher.getContentCache(id).setAceEditorOn(false);
                //doku.set_cookie('aceeditor-' + id, 'off');
                doku.set_cookie('aceeditor', 'off');

                //console.log('aceeditor-'+id);
                //console.log(doku.get_cookie('aceeditor-'+id));

                container.hide();
                //this.off();
                doku.enable();
                doku.set_value(ace.get_value());
                doku.set_selection(selection.start, selection.end);
                doku.focus();
            };

        // Afegim els botons a la barra
        if (JSINFO.plugin_aceeditor["default"] || Dispatcher.getContentCache(id).isAceEditorOn()) {
            enable();
        }

        // TODO[Xavi] Les funcions cridades per la toolbar son globals, altre opció es modificar el fitxer lib/plugins/scripts/toolbar.js

        // Només afegim el botó si no existeix

        if (typeof window.toolbar !== 'undefined' && !window.addBtnActionClick) {
            window.addBtnActionClick = function ($btn, props, edid) {
                var id = GlobalState.getCurrentId();

                $btn.click(function () {
                    // Hem de comprovar l'editor actual
                    if (Dispatcher.getContentCache(id).isAceEditorOn()) {
                        disable();
                    } else {
                        enable();
                    }
                    return false;
                })
            };

            if (typeof window.toolbar !== 'undefined') {
                window.toolbar[window.toolbar.length] = {
                    type:  "Click", // we havea new type that links to the function
                    title: "Activar/Desactivar ACE!",
                    icon:  "../../plugins/aceeditor/images/toggle_on.png"
                }
            }

        }


        console.log("Carregat en " + (new Date().getTime() - inici));
    };
});

