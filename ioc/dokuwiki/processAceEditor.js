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
    'ioc/dokuwiki/AceManager/IocCommands',
    'ioc/wiki30/GlobalState',
    'ioc/wiki30/dispatcherSingleton',
    'ioc/dokuwiki/AceManager/toolbarManager',
    "dojo/dom-geometry",
    "dojo/dom-style",

    // Només cal carregar els modes que s'han d'incloure
    "ace-builds/mode-markdown",
    "ace-builds/mode-latex",
    "ace-builds/mode-java",
    "ace-builds/mode-javascript",
    //"ace-builds/mode-php",
    "ioc/dokuwiki/underscore"


], function (ready, registry, dom, IocAceEditor, IocAceMode, IocRuleSet, AceWrapper, DokuWrapper, Container,
             IocCommands, GlobalState, dispatcher, toolbarManager, geometry, style) {

    var
        /**
         * Activa l'editor ACE a la pestanya actual o la pestanya pasada com argument per evitar problemas al recarregar.
         *
         * @param {string?} id - identificador de la pestanya corresponent al editor a activar.
         */
        enable = function (id) {
            var currentId = id || GlobalState.getCurrentId(),
                selection,
                container = dispatcher.getContentCache(currentId).getEditor(),
                ace = container.aceWrapper,
                doku = container.dokuWrapper;

            selection = doku.get_selection();
            doku.disable();
            container.set_height(doku.inner_height());
            container.show();
            ace.set_value(doku.get_value());
            ace.resize();
            ace.focus();
            ace.set_selection(selection.start, selection.end);
            //user_editing = true; // TODO comprovar on s'ha d'actualitzar aquest valor i per a que es fa servir --> Es fa servir a la funció callback que es passa al AceEditor
            doku.set_cookie('aceeditor', 'on');
            dispatcher.getContentCache(currentId).setAceEditorOn(true);
        },

        /**
         * Desactiva l'editor ACE a la pestanya actual
         */
        disable = function () {
            var id = GlobalState.getCurrentId(),
                selection,
                container = dispatcher.getContentCache(id).getEditor(),
                ace = container.aceWrapper,
                doku = container.dokuWrapper;

            selection = ace.get_selection();
            //user_editing = false; // TODO comprovar on s'ha d'actualitzar aquest valor i per a que es fa servir --> Es fa servir a la funció callback que es passa al AceEditor

            dispatcher.getContentCache(id).setAceEditorOn(false);
            doku.set_cookie('aceeditor', 'off');

            container.hide();
            doku.enable();
            doku.set_value(ace.get_value());
            doku.set_selection(selection.start, selection.end);
            doku.focus();
        },

        confEnableAce = {
            type:  "EnableAce",
            title: "Activar/Desactivar ACE",
            icon: "/iocjslib/ioc/gui/img/toggle_on.png"
        },

        /**
         * Activa o desactiva l'editor ACE segons l'estat actual
         *
         * @returns {boolean} - Sempre retorna fals.
         */
        funcEnableAce = function () {
            var id = GlobalState.getCurrentId();

            if (dispatcher.getContentCache(id).isAceEditorOn()) {
                disable();
            } else {
                enable();
            }
            return false;
        },

        confEnableWrapper = {
            type:  "EnableWrapper", // we havea new type that links to the function
            title: "Activar/Desactivar embolcall",
            icon: "/iocjslib/ioc/gui/img/wrap.png"
        },

        /**
         * Activa o desactiva l'embolcall del text.
         * @returns {boolean} - Sempre retorna fals
         */
        funcEnableWrapper = function () {
            var id = GlobalState.getCurrentId(),
                content = dispatcher.getContentCache(id),
                textArea = content.getEditor().$textArea.context;

            if (content.isWrapperOn()) {
                dw_editor.setWrap(textArea, 'off');
                content.setWrapperOn(false);

            } else {
                dw_editor.setWrap(textArea, 'on');
                content.setWrapperOn(true);
            }

            return false;
        };

    toolbarManager.addButton(confEnableAce, funcEnableAce);
    toolbarManager.addButton(confEnableWrapper, funcEnableWrapper);
    toolbarManager.removeButton(1);

    return function (params) {

        // Comprovem la versió del explorador i que existeix l'entorn de la dokuwiki abans de fer res
        if (/MSIE [0-8]\./.test(navigator.userAgent) || !(window.JSINFO && document.getElementById(params.textAreaId))) {
            return;
        }

        var contentNode = dom.byId(params.id);
        var h = geometry.getContentBox(contentNode).h;
        style.set(params.textAreaId, "height", "" + h - 20 + "px");
        style.set(params.textAreaId, "resize", "vertical");

        var currentEditor = dispatcher.getContentCache(params.id).getEditor(),

            lang_rules = {
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

        // TODO: en una propera tasca, user_editing sempre es false
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


        // Afegim el listener al botó per actualitzar el contingut del textarea abans de desar
        var wg = registry.byId(params.buttonId);

        wg.putClickListener(params.key, function () {

            if (dokuWrapper.get_cookie('aceeditor')
                && dokuWrapper.get_cookie('aceeditor') !== 'off') {
                var textArea = dom.byId(params.textAreaId),
                    id = GlobalState.getCurrentId(),
                    editor = dispatcher.getContentCache(id).getEditor();
                textArea.value = editor.getAceValue();
            }
        });


        dispatcher.getContentCache(params.id).setEditor(container);

        // Si s'ha d'activar l'editor l'activem
        if (JSINFO.plugin_aceeditor["default"] || dispatcher.getContentCache(id).isAceEditorOn()) {
            enable(params.id);
        }

        console.log("Carregat en " + (new Date().getTime() - inici));

    };
});
