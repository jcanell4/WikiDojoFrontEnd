define([
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
    'dojo/dom-geometry',
    'dojo/dom-style',
    'dojo/on',

    'ioc/dokuwiki/underscore'
], function (registry, dom, IocAceEditor, IocAceMode, IocRuleSet, AceWrapper, DokuWrapper, Container,
             IocCommands, GlobalState, getDispatcher, toolbarManager, geometry, style, on) {

    var dispatcher = getDispatcher();
    var
        dispatcher = getDispatcher(),
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
            type: "EnableAce",
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
            type: "EnableWrapper", // we havea new type that links to the function
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
                return false;

            } else {
                dw_editor.setWrap(textArea, 'on');
                content.setWrapperOn(true);
                return true;
            }

        },

        /**
         * Afegeix els botons i canvia el valor de buttonsCreated a cert si es crean amb exit o fals si algun falla.
         *
         * @returns {boolean}
         */
        addButtons = function () {
            buttonsCreated = true;

            buttonsCreated &= toolbarManager.addButton(confEnableAce, funcEnableAce);
            buttonsCreated &= toolbarManager.addButton(confEnableWrapper, funcEnableWrapper);
        },

        buttonsCreated = false;

    return function (params) {

        if (!buttonsCreated) {
            addButtons();
        }

        // Comprovem la versió del explorador i que existeix l'entorn de la dokuwiki abans de fer res
        if (/MSIE [0-8]\./.test(navigator.userAgent) || !(window.JSINFO && document.getElementById(params.textAreaId))) {
            return;
        }


        var currentEditor = dispatcher.getContentCache(params.id).getEditor(),

            lang_rules = {},

            iocAceMode = new IocAceMode({
                baseHighlighters: lang_rules,
                ruleSets: [new IocRuleSet()],
                xmlTags: JSINFO.plugin_aceeditor.xmltags
            }),

            mode = iocAceMode.getMode(),

            iocAceEditor = new IocAceEditor({
                mode: mode,
                containerId: "editor" + params.id,
                theme: JSINFO.plugin_aceeditor.colortheme,
                readOnly: jQuery('#' + params.textAreaId).attr('readonly'),
                wraplimit: JSINFO.plugin_aceeditor.wraplimit,
                wrapMode: jQuery('#' + params.textAreaId).attr('wrap') !== 'off',
                mdpage: JSINFO.plugin_aceeditor.mdpage
            }),

            aceWrapper = new AceWrapper(iocAceEditor),

            dokuWrapper = new DokuWrapper(aceWrapper, params.textAreaId),

            container = new Container(aceWrapper, dokuWrapper, currentEditor),

            user_editing = false,

            commands,

            editor;


        // Inicialitzem l'editor
        iocAceEditor.init();

        // No es poden afegir els comandaments fins que no s'a inicialitzat l'editor
        commands = new IocCommands(aceWrapper);

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
        if (JSINFO.plugin_aceeditor["default"] || dispatcher.getContentCache(params.id).isAceEditorOn()) {
            enable(params.id);
        }

        var fillEditorContainer = function () {
            var contentNode = dom.byId(params.id),
                editor = dispatcher.getContentCache(params.id).getEditor(),
                h = geometry.getContentBox(contentNode).h;


            console.log("Editor: ", editor);

            console.log("Canviant mida del texarea a: " + h);
            style.set(params.textAreaId, "height", "" + h - 20 + "px");

            console.log("Canviant mida del editor a: " + h);
            style.set(editor.containerId, "height", "" + h - 20 + "px");

            console.log("editor", editor);
            console.log("textArea", params.textAreaId);

        };

        on(window, 'resize', function () {
            fillEditorContainer();
        });

        // Incialitzem la mida dels editors

        toolbarManager.initToolbar();
        fillEditorContainer();
        //funcEnableWrapper();
        enable();
        console.log("Carregat en " + (new Date().getTime() - inici));
    };
});
