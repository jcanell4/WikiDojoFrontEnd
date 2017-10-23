define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AbstractIocFacade',
    'ioc/dokuwiki/editors/AceManager/IocAceEditor',
    // 'ioc/dokuwiki/editors/AceManager/modes/IocAceMode',
    // 'ioc/dokuwiki/editors/AceManager/rules/IocRuleSet',
    // 'ioc/dokuwiki/editors/AceManager/AceWrapper',
    // 'ioc/dokuwiki/editors/AceManager/DokuWrapper',
    // 'ioc/dokuwiki/editors/AceManager/Container2',
    'ioc/dokuwiki/editors/AceManager/IocCommands',
    'ioc/dokuwiki/editors/AceManager/patcher',
    'dojo/dom-style',
    'dojo/dom',
    'ioc/dokuwiki/editors/AceManager/toolbarManager',
    'dojo/dom-geometry',
    'ioc/dokuwiki/editors/AceManager/ace-preview',
    'dojo/cookie',
], function (declare, AbstractIocFacade, IocAceEditor, /*IocAceMode,*/ /*IocRuleSet, *//*AceWrapper, DokuWrapper,*/ /*Container,*/ IocCommands, patcher,
             style, dom, toolbarManager, geometry, acePreview, cookie) {


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

            this.iocAceEditor = iocAceEditor;
            this.id = args.auxId;

            // this.$editor = jQuery('#' + args.containerId);

            // iocAceEditor.init();

            // console.log("id:", id);
            // console.log("originalcontent?:",args.originalContent);
            // var text = this.iocAceEditor.getTextareaValue(); // TODO: Comprovar si aquest text es igual a l'original!
            // this.iocAceEditor.setEditorValue(text);

            // this.iocAceEditor.setValue(args.originalContent);

            // console.log("Text igual a originalcontent?", text === args.originalContent, text == args.originalContent);
            // console.log("text:", text);
            // console.log("original:", args.originalContent);

            this.initEventHandlers();
            // iocAceEditor.on('focus', this.select.bind(this));
            //
            // iocAceEditor.on('change', function () {
            //     this.emit('change', {newContent: this.getValue()});
            // }.bind(this));

            // jQuery(this.$editor).find('textarea').on('focus', this.select.bind(this));


            // jQuery(this.$editor).on('input paste cut keyup', function () {
            //     console.log("input en el constructor");
            //     this.emit('change', {newContent: this.getValue()});
            // }.bind(this));


            // this.originalContent = args.originalContent;

            this.enable();

            this.addToolbars(args.dispatcher);

        },

        initEventHandlers: function() {
            this.iocAceEditor.on('focus', this.select.bind(this));

            this.iocAceEditor.on('change', function () {
                this.emit('change', {newContent: this.getValue()});
            }.bind(this));
        },

        updateTextarea: function (value) {
            // Comprovar si el id del textarea seleccionat correspont amb el que te el focus?
            this.iocAceEditor.dokuWrapper.set_value(value);
        },

        getValue: function () {
            return this.iocAceEditor.getValue();

            // if (this.enabled) {
            //     return this.getEditorValue();
            // } else {
            //     return this.getTextareaValue();
            // }
        },

        setValue: function (value) {
            this.iocAceEditor.setValue(value);
        },

        // getEditorValue: function () {
        //     return this.iocAceEditor.aceWrapper.get_value();
        // },
        //
        // getTextareaValue: function () {
        //     return this.iocAceEditor.dokuWrapper.get_value();
        // },


        // setEditorValue: function (value) {
        //     return this.iocAceEditor.aceWrapper.set_value(value);
        // },
        //
        // setTextareaValue: function (value) {
        //     return this.iocAceEditor.dokuWrapper.set_value(value);
        // },

        destroy: function () {
            alert("Es fa servir el destroy del AceEditorFullFacade");
            this.iocAceEditor.destroy();
        },

        enable: function () {
            this.iocAceEditor.enable();
            // var selection = this.iocAceEditor.dokuWrapper.get_selection();
            // this.iocAceEditor.dokuWrapper.disable();
            //
            // this.set_height(this.iocAceEditor.dokuWrapper.inner_height());
            // this.show();
            // this.iocAceEditor.aceWrapper.set_value(this.iocAceEditor.dokuWrapper.get_value());
            // this.iocAceEditor.aceWrapper.resize();
            // this.iocAceEditor.aceWrapper.focus();
            // this.iocAceEditor.aceWrapper.set_selection(selection.start, selection.end);
            //
            // this.iocAceEditor.dokuWrapper.set_cookie('aceeditor', 'on');
            //
            // this.enabled = true;
        },

        disable: function () {
            this.iocAceEditor.disable();
            // var selection;
            //
            // selection = this.iocAceEditor.aceWrapper.get_selection();
            // this.iocAceEditor.dokuWrapper.set_cookie('aceeditor', 'off');
            //
            // this.hide();
            // this.iocAceEditor.dokuWrapper.enable();
            // this.iocAceEditor.dokuWrapper.set_value(this.iocAceEditor.aceWrapper.get_value());
            // this.iocAceEditor.dokuWrapper.set_selection(selection.start, selection.end);
            // this.iocAceEditor.dokuWrapper.focus();
            //
            // this.enabled = false;

        },

        select: function () {
            console.log("select: restaurando funciones parcheadas");
            patcher.restoreCachedFunctions(this.id);
        },

        lockEditor: function () {
            this.iocAceEditor.setReadOnly(true);
            this.hideToolbar();
        },

        unlockEditor: function () {
            this.iocAceEditor.setReadOnly(false);
            this.showToolbar();
        },


        // ALERTA[Xavi] pendent de determinar si això es necessari aqui, es cridat només per un botó que hauria de connectar directament amb l'editor i no la Facade
        toggleWrap: function () {
            this.iocAceEditor.toggleWrap();
        },

        toggleEditor: function () {
            this.iocAceEditor.toggleEditor();


            // if (this.enabled) {
            //     this.disable();
            // } else {
            //     this.enable();
            // }

        },

        resetOriginalContentState: function () {
            // console.log("AceEditorFullFacade#resetOriginalContentState", this.id);
            alert("Es fa servir reseetOriginalContentState");
            this.originalContent = this.getValue();
        },

        isChanged: function () {
            alert("Es fa servir isChanged");

            return this.originalContent != this.getValue();
        },


        fillEditorContainer: function () {
            var contentNode = dom.byId(this.id),
                h = geometry.getContentBox(contentNode).h;


            this.setHeight(Math.max(h));
        },

        setHeight: function (height) {
            // console.log("AceEditorFullFacade#setHeight", height);
            var min = this.MIN_HEIGHT,
                contentNode = dom.byId(this.id),
                h = geometry.getContentBox(contentNode).h,
                max = h - this.VERTICAL_MARGIN,
                normalizedHeight = Math.max(min, Math.min(height, max));


            var node = dom.byId(this.iocAceEditor.dokuWrapper.textArea.id);

            if (node) {
                style.set(node, "height", "" + normalizedHeight + "px");
            }

            node = dom.byId(this.iocAceEditor.containerId);
            if (node) {
                style.set(node, "height", "" + normalizedHeight + "px");
            }

            this.iocAceEditor.aceWrapper.resize();

        },


        addToolbars: function (dispatcher) {
            toolbarManager.setDispatcher(dispatcher);


            if (this.iocAceEditor.getReadOnly()) {
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

        // getOriginalValue: function () {
        //     alert("Es fa servir gerOriginalValue?");
        //     return this.originalContent;
        // },
        //
        // resetValue: function () {
        //     alert("Es fa servir resetValue");
        //     this.setValue(this.getOriginalValue());
        // },


        // show: function () {
        //     var wrapper = this.iocAceEditor.$wrapper,
        //         element = this.iocAceEditor.$elementContainer;
        //     wrapper.show();
        //     element.css('width', wrapper.width() + 'px');
        //     return element.css('height', wrapper.height() + 'px');
        // },
        //
        // hide: function () {
        //     return this.iocAceEditor.$wrapper.hide();
        // },

        // set_height: function (value) {
        //     this.iocAceEditor.$wrapper.css('height', value + 'px');
        //     return this.iocAceEditor.$elementContainer.css('height', this.iocAceEditor.$wrapper.height() + 'px');
        // }

    });


});

