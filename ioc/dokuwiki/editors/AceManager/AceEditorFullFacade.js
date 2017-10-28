define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AbstractIocFacade',
    'ioc/dokuwiki/editors/AceManager/IocAceEditor',
    'ioc/dokuwiki/editors/AceManager/IocCommands',
    'dojo/dom-style',
    'dojo/dom',
    'ioc/dokuwiki/editors/AceManager/toolbarManager',
    'dojo/dom-geometry',
    /*'ioc/dokuwiki/editors/AceManager/ace-preview',*/
    'dojo/cookie',
], function (declare, AbstractIocFacade, IocAceEditor, /*IocAceMode,*/ /*IocRuleSet, *//*AceWrapper, DokuWrapper,*/ /*Container,*/ IocCommands, /*patcher,*/
             style, dom, toolbarManager, geometry, /*acePreview,*/ cookie) {


    return declare([AbstractIocFacade], {

        TOOLBAR_ID: "full-editor",
        VERTICAL_MARGIN: 25,
        MIN_HEIGHT: 200,

        constructor: function (args) {
            var iocAceEditor = new IocAceEditor({ // ALERTA! Arriben tots directament del cotenttool
                containerId: args.containerId,
                textareaId: args.textareaId,
                auxId: args.auxId,
                theme: args.theme,
                readOnly: args.readOnly,
                wraplimit: args.wraplimit,
                wrapMode: args.wrapMode,
                mdpage: args.mdpage,
                originalContent: args.originalContent

            });

            this.dispatcher = args.dispatcher;
            this.editor = iocAceEditor;
            this.id = args.auxId;

            this.initEventHandlers();

            this.enable();

            this.addToolbars(args.dispatcher);

        },

        initEventHandlers: function() {
            this.editor.on('focus', this.select.bind(this));

            this.editor.on('change', function () {
                this.emit('change', {newContent: this.getValue()});
            }.bind(this));
        },

        getValue: function () {
            return this.editor.getValue();
        },

        setValue: function (value) {
            this.editor.setValue(value);
        },

        destroy: function () {
            this.editor.destroy();
        },

        enable: function () {
            this.editor.enable();
        },

        disable: function () {
            this.editor.disable();
        },

        select: function () {
            // patcher.restoreCachedFunctions(this.id);
            this.editor.restoreCachedFunctions();
        },

        lockEditor: function () {
            this.editor.setReadOnly(true);
            this.hideToolbar();
        },

        unlockEditor: function () {
            this.editor.setReadOnly(false);
            this.showToolbar();
        },


        // ALERTA[Xavi] pendent de determinar si això es necessari aqui, es cridat només per un botó que hauria de connectar directament amb l'editor i no la Facade
        toggleWrap: function () {
            this.editor.toggleWrap();
        },

        // ALERTA[Xavi] pendent de determinar si això es necessari aqui, es cridat només per un botó que hauria de connectar directament amb l'editor i no la Facade
        toggleEditor: function () {
            this.editor.toggleEditor();
        },

        resetOriginalContentState: function () {
            // console.log("AceEditorFullFacade#resetOriginalContentState", this.id);
            alert("Es fa servir reseetOriginalContentState?");
            this.originalContent = this.getValue();
        },

        isChanged: function () {
            alert("Es fa servir isChanged?");

            return this.originalContent != this.getValue();
        },


        fillEditorContainer: function () {
            var contentNode = dom.byId(this.id),
                h = geometry.getContentBox(contentNode).h;


            this.setHeight(Math.max(h));
        },

        setHeight: function (height) {
            console.log("AceEditorFullFacade#setHeight", height);
            var min = this.MIN_HEIGHT,
                contentNode = dom.byId(this.id),
                h = geometry.getContentBox(contentNode).h,
                max = h - this.VERTICAL_MARGIN,
                normalizedHeight = Math.max(min, Math.min(height, max));


            var node = this.editor.$textarea.get(0);

            if (node) {
                style.set(node, "height", "" + normalizedHeight + "px");
            }

            node = dom.byId(this.editor.containerId);
            if (node) {
                style.set(node, "height", "" + normalizedHeight + "px");
            }

            this.editor.resize();

        },


        addToolbars: function (dispatcher) {
            toolbarManager.setDispatcher(dispatcher);


            if (this.editor.getReadOnly()) {
                return;
            }
            this.addButtons(dispatcher);

            this.toolbarId = 'toolbar_' + this.id;
            toolbarManager.initToolbar(this.toolbarId, 'textarea_' + this.id, this.TOOLBAR_ID);
        },

        addButtons: function (dispatcher) {
            var argSave = {
                    type: 'SaveButton',
                    title: 'Desar',
                    icon: '/iocjslib/ioc/gui/img/save.png'
                },

                argCancel = {
                    type: 'BackButton',
                    title: 'Tornar',
                    icon: '/iocjslib/ioc/gui/img/back.png'
                },

                confEnableAce = {
                    type: 'EnableAce',
                    title: 'Activar/Desactivar ACE',
                    icon: '/iocjslib/ioc/gui/img/toggle_on.png'
                },

                confEnableWrapper = {
                    type: 'EnableWrapper', // we havea new type that links to the function
                    title: 'Activar/Desactivar embolcall',
                    icon: '/iocjslib/ioc/gui/img/wrap.png'
                },

                argPreview = {
                    type: "preview", // we havea new type that links to the function
                    title: "Previsualitzar el contingut d'aquest editor",
                    icon: "/iocjslib/ioc/gui/img/Document-Preview-icon.png"
                };

            toolbarManager.addButton(argPreview, this._funcPreview.bind(dispatcher), this.TOOLBAR_ID);
            toolbarManager.addButton(confEnableWrapper, this._funcEnableWrapper.bind(dispatcher), this.TOOLBAR_ID);
            toolbarManager.addButton(confEnableAce, this._funcEnableAce.bind(dispatcher), this.TOOLBAR_ID);
            toolbarManager.addButton(argSave, this._funcSave.bind(dispatcher), this.TOOLBAR_ID);
            toolbarManager.addButton(argCancel, this._funcCancel.bind(dispatcher), this.TOOLBAR_ID);
        },

        _funcPreview: function () {
            var id = this.getGlobalState().getCurrentId(),
                contentTool = this.getContentCache(id).getMainContentTool(),
                dataToSend = contentTool.requester.get("dataToSend"),
                urlBase = contentTool.requester.get("urlBase");

            cookie("IOCForceScriptLoad", 1);

            contentTool.requester.set("dataToSend", {call: "preview", wikitext: contentTool.getCurrentContent()});
            contentTool.requester.set("urlBase", contentTool.requester.get("defaultUrlBase"));
            contentTool.requester.sendRequest();
            contentTool.requester.set("urlBase", urlBase);
            contentTool.requester.set("dataToSend", dataToSend);
        },

        /**
         * Activa o desactiva l'embolcall del text.
         * @returns {boolean} - Sempre retorna fals
         * @protected
         */
        _funcEnableWrapper: function () {
            var id = this.getGlobalState().getCurrentId(),
                editor = this.getContentCache(id).getMainContentTool().getEditor();

            editor.toggleWrap();
        },

        /**
         * ALERTA[Xavi] Compte, el this fa referencia al dispatcher
         *
         * @protected
         */
        _funcSave: function () {
            var id = this.getGlobalState().getCurrentId(),
                eventManager = this.getEventManager();

            eventManager.fireEvent(eventManager.eventName.SAVE, {id: id}, id);
        },

        /**
         * Activa o desactiva l'editor ACE segons l'estat actual
         *
         * @returns {boolean} - Sempre retorna fals.
         * @protected
         */
        _funcEnableAce: function () {
            var id = this.getGlobalState().getCurrentId(),
                editor = this.getContentCache(id).getMainContentTool().getEditor();
            editor.toggleEditor();
        },

        /**
         * ALERTA[Xavi] Compte, el this fa referencia al dispatcher
         * @protected
         */
        _funcCancel: function () {
            var id = this.getGlobalState().getCurrentId(),
                eventManager = this.getEventManager();

            eventManager.fireEvent(eventManager.eventName.CANCEL, {id: id}, id);
        },

        hideToolbar: function () {
            var $toolbar = jQuery('#' + this.toolbarId);

            this._originalToolbarDisplayStyle = $toolbar.css('display');
            $toolbar.css('display', 'none')
        },

        showToolbar: function () {
            if (this._originalToolbarDisplayStyle) {
                jQuery('#' + this.toolbarId).css('display', this._originalToolbarDisplayStyle);
            } else {
                jQuery('#' + this.toolbarId).css('display', 'inherit');
            }

        },



    });


});

