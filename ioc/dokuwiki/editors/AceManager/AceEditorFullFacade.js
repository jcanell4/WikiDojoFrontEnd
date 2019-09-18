define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AbstractIocFacade',
    'ioc/dokuwiki/editors/AceManager/IocAceEditor',
    'ioc/dokuwiki/editors/AceManager/IocCommands',
    'dojo/dom-style',
    'dojo/dom',
    'ioc/dokuwiki/editors/AceManager/toolbarManager',
    'dojo/dom-geometry'
], function (declare, AbstractIocFacade, IocAceEditor, IocCommands, style, dom, toolbarManager, geometry) {


    return declare([AbstractIocFacade], {

        TOOLBAR_ID: "full-editor",
        VERTICAL_MARGIN: 25,
        MIN_HEIGHT: 200,

        constructor: function (args) {
            if (args.TOOLBAR_ID) {
                this.TOOLBAR_ID = args.TOOLBAR_ID;
            }

            var iocAceEditor = new IocAceEditor({ // ALERTA! Arriben tots directament del cotenttool
                id: args.id,
                containerId: args.containerId,
                textareaId: args.textareaId,
                auxId: args.auxId,
                theme: args.theme,
                readOnly: args.readOnly,
                wraplimit: args.wraplimit,
                wrapMode: args.wrapMode,
                mdpage: args.mdpage,
                content: args.content,
                originalContent: args.originalContent || args.content,
                dispatcher: args.dispatcher,
                plugins: args.plugins,
                TOOLBAR_ID: this.TOOLBAR_ID,
                partialDisabled: args.partialDisabled
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
            console.log("AceEditorFullFacade#select", this.id);
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
            this.editor.resetOriginalContentState();
        },

        isChanged: function () {
            return this.editor.isChanged();
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


        addToolbars: function () {

            if (this.editor.getReadOnly()) {
                return;
            }

            this.toolbarId = 'toolbar_' + this.id;


            toolbarManager.initToolbar(this.toolbarId, 'textarea_' + this.id, this.TOOLBAR_ID);
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

        getCurrentRow: function() {
            return this.editor.getCurrentRow();
        }



    });


});

